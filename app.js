// app.js

// --- GLOBALE KONFIGURATION ---
const ADMIN_UIDS = ["dn5robQQfcRxj7FdPDTKbizItvL2"];
const MAX_IMAGES = 15; // Maximale Anzahl an Bildern pro Anzeige
const FORBIDDEN_USERNAMES = [
    // Allgemeine Begriffe, die zu Verwechslungen oder Missbrauch führen können
    'admin', 'administrator', 'root', 'support', 'hilfe', 'kontakt', 'info',
    'moderator', 'sysadmin', 'webmaster', 'system', 'helpdesk', 'supportteam',
    'security', 'management', 'dev', 'developer', 'testuser', 'gast', 'guest',
    'demo',
];


// --- CLOUDINARY & CACHE KONFIGURATION ---
const CLOUDINARY_CLOUD_NAME = "dfavditps";
const CLOUDINARY_UPLOAD_PRESET = "ml_default";
const authorProfileCache = new Map(); // Cache für Autorenprofile, um Datenbankabfragen zu sparen

// --- AVATAR KONFIGURATION ---
const AVATAR_COLORS = [
    '#000000', '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f',
    '#0288d1', '#0097a7', '#00796b', '#388e3c', '#689f38'
];

/**
 * Erstellt ein dynamisches Platzhalter-Avatar als SVG-Daten-URL.
 * @param {string} name - Der Name, aus dem der Anfangsbuchstabe generiert wird.
 * @param {string|null} colorHex - Eine optionale Hex-Farbe für den Hintergrund.
 * @returns {string} Eine base64-kodierte SVG-Daten-URL.
 */
function createInitialAvatar(name, colorHex = null) {
    if (!name || typeof name !== 'string' || name.trim() === '') name = '?';
    const firstLetter = name.charAt(0).toUpperCase();

    let backgroundColor = colorHex;

    if (!backgroundColor) {
        // Fallback: Stabile Farberzeugung basierend auf dem Namen
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash; // Zu 32bit Integer konvertieren
        }
        const hue = hash % 360;
        backgroundColor = `hsl(${hue}, 70%, 45%)`;
    }

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="${backgroundColor}" />
            <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="55" font-weight="600" fill="#ffffff">${firstLetter}</text>
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
}


// --- WEITERE FUNKTIONEN ---
function isUserAdmin() {
  const currentUser = auth.currentUser;
  return currentUser && ADMIN_UIDS.includes(currentUser.uid);
}

async function uploadImageToCloudinary(file) {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(url, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Upload fehlgeschlagen");
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Fehler:", error);
        showToast("Bild-Upload fehlgeschlagen.", true);
        return null;
    }
}

async function getAuthorProfile(uid) {
    if (authorProfileCache.has(uid)) {
        return authorProfileCache.get(uid);
    }
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const profileData = userDoc.data();
            authorProfileCache.set(uid, profileData);
            return profileData;
        }
        return null;
    } catch (error) {
        console.error("Fehler beim Abrufen des Autorenprofils:", error);
        return null;
    }
}

// --- FIREBASE & DATENBANK INITIALISIERUNG ---
const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, updateProfile, sendEmailVerification } = window.firebaseAuth;
const { db, collection, addDoc, doc, onSnapshot, query, orderBy, deleteDoc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, where, getDocs, writeBatch } = window.firebaseDb;


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("btn-back").addEventListener("click", () => showView(lastListView || 'home'));
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('reset-confirm-modal').style.display = 'none';
    document.getElementById('verify-email-modal').style.display = 'none';

    document.getElementById('btn-delete-avatar').addEventListener('click', async () => {
        const confirmed = await showConfirmModal(
            "Profilbild entfernen?",
            "Bist du sicher, dass du dein Profilbild entfernen möchtest? Es wird durch einen farbigen Avatar ersetzt.",
            "Entfernen"
        );
        if (!confirmed) return;

        const user = auth.currentUser;
        if (!user) return;
        
        try {
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
    avatarUrl: ''
}, { merge: true });
            showToast("Profilbild erfolgreich entfernt.");
        } catch (error) {
            console.error("Fehler beim Löschen des Profilbilds:", error);
            showToast("Das Profilbild konnte nicht entfernt werden.", true);
        }
    });
});

// --- STATE (Anwendungszustand) ---
let ads = [];
let watchlist = [];
let currentUserProfile = null;
let unsubscribeAdsListener = null;
let unsubscribeWatchlistListener = null;
let unsubscribeNotificationsListener = null;
let unsubscribeReportsListener = null; // NEU für Admin-Meldungen
let editingAdId = null;
let reportingAd = { id: null, reason: null }; // NEU für Melde-Prozess
let lastListView = 'home';


// --- Views ---
const views = {
  home: document.getElementById("view-home"),
  detail: document.getElementById("view-detail"),
  watchlist: document.getElementById("view-watchlist"),
  new: document.getElementById("view-new"),
  about: document.getElementById("view-about"),
  myAds: document.getElementById("view-my-ads"),
  nachrichten: document.getElementById("view-nachrichten"),
  stats: document.getElementById("view-stats"),
  profile: document.getElementById("view-profile"),
  publicProfile: document.getElementById("view-public-profile"),
  reportReason: document.getElementById("view-report-reason"), // NEU
  reportDetails: document.getElementById("view-report-details"), // NEU
};

const PLACEHOLDER_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiJ5rAqr1pIi6pHOdFGGijRXcE4HLHqWJNSw&s";

function generateAdId() {
    const prefix = "AD-ID";
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `${prefix}-${result}`;
}


function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const datePart = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timePart = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  return `${datePart} ${timePart}`;
}

function showView(name) {
  if (name === "home" || name === "watchlist" || name === "myAds") {
    lastListView = name;
  }

  Object.values(views).forEach(v => v.hidden = true);
  const viewKey = Object.keys(views).find(k => k.toLowerCase() === name.toLowerCase());
  if(views[viewKey]) {
    views[viewKey].hidden = false;
  }

  if (name === "home") applyFilters();
  if (name === "watchlist") renderWatchlist();
  if (name === "myAds") renderMyAds();
  if (name === "stats") renderStatsView();
  if (name === "profile") renderProfileView();

  if (name !== 'new' && editingAdId) {
    resetAdForm();
  }
}

// --- Routing ---
const navLinks = document.querySelectorAll(".site-nav a, .logo a, #user-status-link");
navLinks.forEach(l => {
    if(l.id === 'auth-btn') return;
    l.addEventListener("click", e => {
      e.preventDefault();
      const id = l.getAttribute("href").replace("#", "");
      showView(id || "home");
    });
});

// --- Render Cards (Home) ---
function renderAds(list = ads) {
  const wrap = document.getElementById("ads-list");
  wrap.innerHTML = "";
  if (!list.length) {
    document.getElementById("home-empty").hidden = false;
    return;
  }
  document.getElementById("home-empty").hidden = true;
  list.forEach(ad => {
    const card = document.createElement("div");
    card.className = "card";
    const liked = watchlist.includes(ad.id);
    const likeButtonClass = liked ? 'card-like liked' : 'card-like';
    const paymentText = ad.paymentType === 'vb' ? `VB ${ad.payment} €` : `${ad.payment} €`;
    const imageUrl = ad.images && ad.images[0] ? ad.images[0] : PLACEHOLDER_IMAGE;

    card.innerHTML = `
      <div class="card-clickable-area">
        <img src="${imageUrl}" alt="${ad.title}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${ad.title}</h3>
          <div class="card-meta">
            ${ad.createdAt ? `<span class="i"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${formatDate(ad.createdAt)} Uhr</span>` : ''}
            <span class="i"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${ad.location}</span>
          </div>
          <p class="card-desc">${ad.desc.substring(0, 80)}...</p>
        </div>
      </div>
      <div class="card-actions">
        <span class="payment">${paymentText}</span>
        <div class="card-buttons-wrap">
          ${isUserAdmin() ? `<button class="card-delete-btn" data-id="${ad.id}" title="Anzeige löschen">🗑️</button>` : ''}
          <button class="card-like-btn" data-id="${ad.id}">
            <svg class="${likeButtonClass}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      </div>
    `;
    card.querySelector('.card-clickable-area').addEventListener("click", () => renderDetail(ad.id));
    wrap.appendChild(card);
  });
}

// --- Render My Ads ---
function renderMyAds() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const list = ads.filter(ad => ad.authorId === currentUser.uid && ad.status !== 'deleted');
    const wrap = document.getElementById("my-ads-list");
    const emptyHint = document.getElementById("my-ads-empty");
    wrap.innerHTML = "";

    if (!list.length) {
        emptyHint.hidden = false;
        return;
    }
    emptyHint.hidden = true;

    list.forEach(ad => {
        const card = document.createElement("div");
        card.className = "card";
        if (ad.status === 'reserved') {
            card.classList.add('reserved');
        }

        const paymentText = ad.paymentType === 'vb' ? `VB ${ad.payment} €` : `${ad.payment} €`;
        const imageUrl = ad.images && ad.images[0] ? ad.images[0] : PLACEHOLDER_IMAGE;
        const isReserved = ad.status === 'reserved';
        const reserveButtonText = isReserved ? 'Freigeben' : 'Reservieren';
        const reserveButtonClass = isReserved ? 'unreserve' : 'reserve';

        card.innerHTML = `
          <div class="reserved-overlay"><span>RESERVIERT</span></div>
          <div class="card-clickable-area">
            <img src="${imageUrl}" alt="${ad.title}" class="card-image">
            <div class="card-content">
              <h3 class="card-title">${ad.title}</h3>
              <p class="card-desc">${ad.desc.substring(0, 100)}...</p>
              ${ad.displayId ? `<p style="font-size: 0.8em; color: var(--muted); margin-top: 10px;">ID: ${ad.displayId}</p>` : ''}
            </div>
          </div>
          <div class="card-actions">
            <span class="payment">${paymentText}</span>
            <div class="card-buttons-wrap">
              <button class="my-ad-btn ${reserveButtonClass}" data-id="${ad.id}">${reserveButtonText}</button>
              <button class="my-ad-btn edit" data-id="${ad.id}">Bearbeiten</button>
              <button class="my-ad-btn delete" data-id="${ad.id}">Löschen</button>
            </div>
          </div>
        `;
        card.querySelector('.card-clickable-area').addEventListener("click", () => renderDetail(ad.id));
        wrap.appendChild(card);
    });
}


// --- Render Watchlist ---
function renderWatchlist() {
  const list = ads.filter(ad => watchlist.includes(ad.id) && ad.status !== 'deleted');
  const wrap = document.getElementById("watch-list");
  wrap.innerHTML = "";
  if (!list.length) {
    document.getElementById("watch-empty").hidden = false;
    return;
  }
  document.getElementById("watch-empty").hidden = true;
  list.forEach(ad => {
    const card = document.createElement("div");
    card.className = "card";
    const paymentText = ad.paymentType === 'vb' ? `VB ${ad.payment}` : `${ad.payment} €`;
    const imageUrl = ad.images && ad.images[0] ? ad.images[0] : PLACEHOLDER_IMAGE;
    card.innerHTML = `
      <div class="card-clickable-area">
        <img src="${imageUrl}" alt="${ad.title}" class="card-image">
        <div class="card-content">
          <h3 class="card-title">${ad.title}</h3>
          <p class="card-desc">${ad.desc.substring(0, 100)}...</p>
        </div>
      </div>
      <div class="card-actions">
        <span class="payment">${paymentText}</span>
        <button class="card-like-btn" data-id="${ad.id}">
          <svg class="card-like liked" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
    `;
    card.querySelector('.card-clickable-area').addEventListener("click", () => renderDetail(ad.id));
    wrap.appendChild(card);
  });
}

function updateGalleryImages() {
    const images = document.querySelectorAll('.detail-gallery-image');
    images.forEach((img, index) => img.classList.toggle('active', index === currentImageIndex));
}
function navigateGallery(direction, totalImages) {
    currentImageIndex = (currentImageIndex + direction + totalImages) % totalImages;
    updateGalleryImages();
}

// --- Form & Ad Creation/Editing ---
const form = document.getElementById("ad-form");

function resetAdForm() {
    editingAdId = null;
    form.reset();
    document.querySelectorAll('select').forEach(s => s.dispatchEvent(new Event('change')));
    document.getElementById("preview-container").innerHTML = `<p class="drop-hint">Hier werden deine Bilder angezeigt. Du kannst sie per Drag & Drop sortieren.</p>`;
    document.querySelector('#view-new h2').textContent = "Neue Anzeige erstellen";
    document.querySelector('#ad-form button[type="submit"]').textContent = "Anzeige speichern";
    document.getElementById('image-upload-hint').hidden = true;
}

function startEditAd(adId) {
    const adToEdit = ads.find(a => a.id === adId);
    if (!adToEdit) return;

   if (adToEdit.status === 'reserved') {
    showToast("Bitte gib die Anzeige erst frei, um sie zu bearbeiten.", true);
    return;
    }

    editingAdId = adId;

    document.getElementById("f-title").value = adToEdit.title || '';
    document.getElementById("f-location").value = adToEdit.location || '';
    document.getElementById("f-category").value = adToEdit.category || '';
    document.getElementById("f-difficulty").value = adToEdit.difficulty || '';
    document.getElementById("f-size").value = adToEdit.size || '';
    document.getElementById("f-payment-type").value = adToEdit.paymentType || 'fest';
    document.getElementById("f-payment").value = adToEdit.payment || '';
    document.getElementById("f-desc").value = adToEdit.desc || '';
    if (adToEdit.tools) {
        document.querySelector(`input[name="f-tools"][value="${adToEdit.tools}"]`).checked = true;
    }

    const previewContainer = document.getElementById("preview-container");
    previewContainer.innerHTML = '';
    if (adToEdit.images && adToEdit.images.length > 0) {
        adToEdit.images.forEach(src => {
            const item = document.createElement("div");
            item.className = "preview-item";
            item.draggable = true;
            item.innerHTML = `<img src="${src}" alt="Vorschaubild"><button type="button" class="remove-btn" aria-label="Bild entfernen">&times;</button>`;
            item.querySelector('.remove-btn').onclick = () => item.remove();
            previewContainer.appendChild(item);
        });
    } else {
        previewContainer.innerHTML = `<p class="drop-hint">Hier werden deine Bilder angezeigt...</p>`;
    }

    document.querySelectorAll('select').forEach(s => s.dispatchEvent(new Event('change')));
    document.querySelector('#view-new h2').textContent = "Anzeige bearbeiten";
    document.querySelector('#ad-form button[type="submit"]').textContent = "Änderungen speichern";
    document.getElementById('image-upload-hint').hidden = true;

    showView("new");
    window.scrollTo(0, 0);
}


form.onsubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.emailVerified) {
        showToast("Du musst angemeldet und verifiziert sein.", true);
        return;
    }
    const selectedToolInput = document.querySelector('input[name="f-tools"]:checked');
    if (!selectedToolInput) {
        showToast("Bitte gib an, ob Werkzeuge gestellt werden.", true);
        return;
    }

    const adImages = [...document.getElementById("preview-container").querySelectorAll("img")].map(i => i.src);
    const imageHint = document.getElementById('image-upload-hint');

    if (adImages.length > MAX_IMAGES) {
        imageHint.textContent = `Zu viele Bilder (maximal ${MAX_IMAGES}). Bitte entferne einige.`;
        imageHint.hidden = false;
        showToast(`Du hast zu viele Bilder ausgewählt (max. ${MAX_IMAGES}).`, true);
        return;
    }

    const adData = {
      authorId: currentUser.uid,
      authorName: currentUser.displayName || 'Anonym',
      title: document.getElementById("f-title").value,
      location: document.getElementById("f-location").value,
      category: document.getElementById("f-category").value,
      difficulty: document.getElementById("f-difficulty").value,
      size: document.getElementById("f-size").value,
      desc: document.getElementById("f-desc").value.trim(),
      paymentType: document.getElementById("f-payment-type").value,
      payment: document.getElementById("f-payment").value,
      tools: selectedToolInput.value,
      images: adImages
    };

    if (adData.desc.length < 20) { return showToast("Beschreibung zu kurz (min. 20 Zeichen)", true); }
    if (adData.desc.length > 500) { return showToast("Beschreibung zu lang (max. 500 Zeichen)", true); }

    try {
        if (editingAdId) {
            adData.updatedAt = serverTimestamp();
            const adRef = doc(db, "ads", editingAdId);
            await updateDoc(adRef, adData);
            showToast("Anzeige erfolgreich aktualisiert!");
            resetAdForm();
            showView("myAds");
        } else {
            adData.createdAt = serverTimestamp();
            adData.updatedAt = serverTimestamp();
            adData.status = 'active';
            adData.displayId = generateAdId();
            // GEÄNDERT: addDoc gibt eine Referenz zurück, die wir für die Benachrichtigungen brauchen
            const newAdRef = await addDoc(collection(db, "ads"), adData);
            showToast("Anzeige erfolgreich erstellt!");
            
            // NEU: Benachrichtigungen für Follower erstellen
            await createNotificationsForFollowers(newAdRef.id, adData);

            resetAdForm();
            showView("home");
        }
        window.scrollTo(0, 0);
    } catch (error) {
        console.error("Fehler beim Speichern der Anzeige:", error);
        showToast("Ein Fehler ist aufgetreten.", true);
    }
};

document.getElementById("btn-discard").onclick = () => {
    resetAdForm();
    showView(lastListView || 'home');
};

// --- CONFIRMATION MODAL LOGIC ---
const confirmModal = document.getElementById('confirm-modal');
const confirmModalTitle = document.getElementById('confirm-modal-title');
const confirmModalText = document.getElementById('confirm-modal-text');
const confirmBtn = document.getElementById('confirm-modal-confirm-btn');
const cancelBtn = document.getElementById('confirm-modal-cancel-btn');

/**
 * Zeigt ein benutzerdefiniertes Bestätigungsmodal an.
 * @param {string} title - Der Titel des Modals.
 * @param {string} text - Der Nachrichtentext im Modal.
 * @param {string} confirmText - Der Text für den Bestätigungsbutton.
 * @returns {Promise<boolean>} Ein Promise, das zu `true` auflöst, wenn bestätigt, ansonsten zu `false`.
 */
function showConfirmModal(title, text, confirmText = 'Löschen') {
    return new Promise((resolve) => {
        confirmModalTitle.textContent = title;
        confirmModalText.textContent = text;
        confirmBtn.textContent = confirmText;

        confirmModal.style.display = 'flex';

        const close = (result) => {
            confirmModal.style.display = 'none';
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            confirmModal.onclick = null;
            resolve(result);
        };

        confirmBtn.onclick = () => close(true);
        cancelBtn.onclick = () => close(false);
        confirmModal.onclick = (e) => {
            if (e.target === confirmModal) {
                close(false);
            }
        };
    });
}


// --- Event Listeners für Buttons (delegiert) ---
document.addEventListener('click', async (e) => {
  if (e.target.closest('.card-like-btn')) {
    const button = e.target.closest('.card-like-btn');
    const adId = button.dataset.id;
    const currentUser = auth.currentUser;
    if (!currentUser) {
        showToast("Bitte melde dich an.", true);
        openAuthModal();
        return;
    }
    const userDocRef = doc(db, "users", currentUser.uid);
    if (watchlist.includes(adId)) {
        await updateDoc(userDocRef, { watchlist: arrayRemove(adId) });
        showToast("Von Beobachtungsliste entfernt");
    } else {
        await setDoc(userDocRef, { watchlist: arrayUnion(adId) }, { merge: true });
        showToast("Zur Beobachtungsliste hinzugefügt");
    }
  }

  else if (e.target.closest('.card-delete-btn')) {
    if (!isUserAdmin()) return;
    const button = e.target.closest('.card-delete-btn');
    const adId = button.dataset.id;
    const confirmed = await showConfirmModal(
        "Anzeige unsichtbar machen?",
        "Möchtest du diese Anzeige wirklich für Nutzer unsichtbar machen? Sie bleibt im System für dich auffindbar.",
        "Ja, unsichtbar machen"
    );

    if (confirmed) {
        try {
            await updateDoc(doc(db, "ads", adId), {
                status: 'deleted',
                updatedAt: serverTimestamp()
            });
            showToast("Anzeige wurde für Nutzer unsichtbar gemacht.");
        } catch (error) {
            showToast("Aktion fehlgeschlagen.", true);
        }
    }
  }

  else if (e.target.matches('#my-ads-list .my-ad-btn.reserve, #my-ads-list .my-ad-btn.unreserve')) {
      const adId = e.target.dataset.id;
      const adRef = doc(db, "ads", adId);
      const isReserving = e.target.classList.contains('reserve');

      try {
          const newStatus = isReserving ? 'reserved' : 'active';
          await updateDoc(adRef, {
              status: newStatus,
              updatedAt: serverTimestamp()
          });
          showToast(`Anzeige wurde ${isReserving ? 'als reserviert markiert' : 'wieder freigegeben'}.`);
      } catch (error) {
          console.error("Fehler beim Ändern des Status:", error);
          showToast("Status konnte nicht geändert werden.", true);
      }
  }

  else if (e.target.matches('#my-ads-list .my-ad-btn.delete')) {
      const adId = e.target.dataset.id;
      const confirmed = await showConfirmModal(
          "Anzeige löschen?",
          "Bist du sicher, dass du diese Anzeige endgültig löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.",
          "Endgültig löschen"
      );
      if (confirmed) {
          try {
              await updateDoc(doc(db, "ads", adId), {
                  status: 'deleted',
                  updatedAt: serverTimestamp()
              });
              showToast("Anzeige erfolgreich gelöscht.");
          } catch (error) {
              console.error("Fehler beim Löschen der eigenen Anzeige:", error);
              showToast("Löschen fehlgeschlagen.", true);
          }
      }
  }

  else if (e.target.matches('#my-ads-list .my-ad-btn.edit')) {
      const adId = e.target.dataset.id;
      startEditAd(adId);
  }

   else if (e.target.matches('.btn-permanent-delete')) {
      if (!isUserAdmin()) return; // Sicherheitscheck

      const adId = e.target.dataset.id;
      const adToDelete = ads.find(ad => ad.id === adId);
      const adIdentifier = adToDelete ? `"${adToDelete.title}" (ID: ${adToDelete.displayId})` : `diese Anzeige`;

      const confirmed = await showConfirmModal(
          "Endgültig löschen?",
          `Bist du absolut sicher, dass du ${adIdentifier} unwiderruflich vom Server löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden!`,
          "Ja, endgültig löschen"
      );

      if (confirmed) {
          try {
              await deleteDoc(doc(db, "ads", adId));
              showToast("Anzeige wurde permanent gelöscht.");
          } catch (error) {
              console.error("Fehler beim endgültigen Löschen:", error);
              showToast("Löschen fehlgeschlagen.", true);
          }
      }
  }
});

// --- Image Upload & Drag & Drop ---
const galleryInput = document.getElementById("f-images");
const cameraInput = document.getElementById("f-images-camera");
const preview = document.getElementById("preview-container");

document.getElementById("btn-pick-gallery").onclick = () => galleryInput.click();
document.getElementById("btn-pick-camera").onclick = () => cameraInput.click();

function addImages(files) {
    const preview = document.getElementById("preview-container");
    const hint = document.getElementById('image-upload-hint');
    const currentImageCount = preview.querySelectorAll('.preview-item').length;

    hint.hidden = true; // Hinweis bei jedem neuen Versuch ausblenden

    if (currentImageCount >= MAX_IMAGES) {
        hint.textContent = `Das Maximum von ${MAX_IMAGES} Bildern ist bereits erreicht.`;
        hint.hidden = false;
        showToast(`Du kannst maximal ${MAX_IMAGES} Bilder hochladen.`, true);
        return;
    }

    if (preview.querySelector('.drop-hint')) preview.innerHTML = '';

    const filesToAdd = Array.from(files).slice(0, MAX_IMAGES - currentImageCount);

    if (filesToAdd.length < files.length) {
        hint.textContent = `Limit von ${MAX_IMAGES} Bildern erreicht. Einige Bilder wurden nicht hinzugefügt.`;
        hint.hidden = false;
        showToast(`Es konnten nur ${filesToAdd.length} von ${files.length} Bildern hinzugefügt werden.`, true);
    }

    filesToAdd.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const item = document.createElement("div");
            item.className = "preview-item";
            item.draggable = true;
            item.innerHTML = `<img src="${e.target.result}" alt="Vorschaubild"><button type="button" class="remove-btn" aria-label="Bild entfernen">&times;</button>`;
            item.querySelector('.remove-btn').onclick = () => item.remove();
            preview.appendChild(item);
        };
        reader.readAsDataURL(file);
    });
}
galleryInput.onchange = e => addImages(e.target.files);
cameraInput.onchange = e => addImages(e.target.files);

let dragSrcEl = null;
preview.addEventListener('dragstart', e => {
    if (e.target.matches('.preview-item')) {
        dragSrcEl = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('dragging');
    }
});
preview.addEventListener('dragover', e => e.preventDefault());
preview.addEventListener('drop', e => {
    e.preventDefault();
    const target = e.target.closest('.preview-item');
    if (dragSrcEl && target && dragSrcEl !== target) {
        const rect = target.getBoundingClientRect();
        const next = (e.clientY - rect.top) / rect.height > .5;
        preview.insertBefore(dragSrcEl, next && target.nextSibling || target);
    }
});
preview.addEventListener('dragend', e => {
    if(e.target.matches('.preview-item')) {
        e.target.classList.remove('dragging');
    }
});

// --- Toast ---
function showToast(msg, err = false) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `toast ${err ? 'error' : 'success'} show`;
  setTimeout(() => { toast.className = "toast"; }, 3000);
}

// --- Filter Logic ---
const filterCategory = document.getElementById("filter-category");
const filterLocation = document.getElementById("filter-location");
const btnClearFilters = document.getElementById("btn-clear-filters");

function applyFilters() {
  const category = filterCategory.value;
  const location = filterLocation.value.toLowerCase().trim();

  let filteredAds = ads.filter(ad => ad.status === 'active');

  if (category) {
    filteredAds = filteredAds.filter(ad => ad.category === category);
  }
  if (location) {
    filteredAds = filteredAds.filter(ad => ad.location.toLowerCase().includes(location));
  }
  renderAds(filteredAds);
}

filterCategory.addEventListener("change", applyFilters);
filterLocation.addEventListener("input", applyFilters);
btnClearFilters.addEventListener("click", () => {
  filterCategory.value = "";
  filterLocation.value = "";
  document.querySelectorAll('#filter-category').forEach(s => s.dispatchEvent(new Event('change')));
  applyFilters();
});


// --- AUTHENTICATION LOGIC ---
const authModal = document.getElementById('auth-modal');
const authBtn = document.getElementById('auth-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const userStatusLink = document.getElementById('user-status-link');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const resetConfirmModal = document.getElementById('reset-confirm-modal');
const closeConfirmModalBtn = document.getElementById('close-confirm-modal-btn');
const resendContainer = document.getElementById('resend-container');
let lastResetEmail = '';
let resendTimerInterval;
const verifyEmailModal = document.getElementById('verify-email-modal');
const closeVerifyModalBtn = document.getElementById('close-verify-modal-btn');

function openAuthModal() { authModal.style.display = 'flex'; }
function closeAuthModal() { authModal.style.display = 'none'; }
function closeResetConfirmModal() {
    resetConfirmModal.style.display = 'none';
    clearInterval(resendTimerInterval);
}

authBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if(authBtn.classList.contains('logout')) {
        signOut(auth).catch(error => showToast(`Fehler beim Abmelden: ${error.message}`, true));
    } else {
        openAuthModal();
    }
});
closeModalBtn.addEventListener('click', closeAuthModal);
authModal.addEventListener('click', (e) => { if(e.target === authModal) { closeAuthModal(); } });
closeConfirmModalBtn.addEventListener('click', closeResetConfirmModal);
resetConfirmModal.addEventListener('click', (e) => { if(e.target === resetConfirmModal) { closeResetConfirmModal(); } });
closeVerifyModalBtn.addEventListener('click', () => verifyEmailModal.style.display = 'none');
verifyEmailModal.addEventListener('click', (e) => { if (e.target === verifyEmailModal) { verifyEmailModal.style.display = 'none'; } });
showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginView.hidden = true; registerView.hidden = false; });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); loginView.hidden = false; registerView.hidden = true; });


onAuthStateChanged(auth, user => {
    const authElements = document.querySelectorAll('[data-requires-auth]');
    const adminElements = document.querySelectorAll('[data-admin-only]');

    const userProfileNav = document.getElementById('user-profile-nav');
    const userStatusText = document.getElementById('user-status-text');
    const navAvatar = document.getElementById('nav-avatar');

    // Listener zurücksetzen
    if (unsubscribeWatchlistListener) {
        unsubscribeWatchlistListener();
        unsubscribeWatchlistListener = null;
    }
    if (unsubscribeNotificationsListener) {
        unsubscribeNotificationsListener();
        unsubscribeNotificationsListener = null;
    }
    // NEU: Reports Listener zurücksetzen
    if (unsubscribeReportsListener) {
        unsubscribeReportsListener();
        unsubscribeReportsListener = null;
    }


    // Setzt alles standardmäßig auf "ausgeblendet"
    authElements.forEach(el => el.hidden = true);
    adminElements.forEach(el => el.hidden = true);

    if (user && user.emailVerified) {
        // Zustand für ANGEMELDETE & VERIFIZIERTE Benutzer
        userProfileNav.style.display = 'flex';
        userStatusText.textContent = user.displayName || user.email;
        authBtn.textContent = 'Abmelden';
        authBtn.classList.add('logout');
        authElements.forEach(el => el.hidden = false);
        if (isUserAdmin()) {
            adminElements.forEach(el => el.hidden = false);
            listenToReports(); // NEU: Admin lauscht auf Meldungen
        }
        listenToUserProfile(user.uid);
        listenToNotifications(user.uid); 

    } else {
        // Zustand für ABGEMELDETE oder NICHT VERIFIZIERTE Benutzer
        userProfileNav.style.display = 'none';
        currentUserProfile = null;
        userStatusText.textContent = '';
        navAvatar.src = '';
        authBtn.textContent = 'Anmelden';
        authBtn.classList.remove('logout');
        watchlist = [];
        
        // --- START: Gründliches Aufräumen der Benachrichtigungen ---
        document.getElementById('notification-bell-container').hidden = true;
        document.getElementById('notifications-panel').hidden = true;
        document.getElementById('notifications-list').innerHTML = ''; // Leert die Liste
        const counter = document.getElementById('notification-counter');
        counter.hidden = true;
        counter.textContent = '0';
        // --- ENDE: Aufräumen ---
        
        showView('home');
    }

    if (views.home.hidden === false) applyFilters();
});

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            if (userCredential.user.emailVerified) {
                showToast(`Willkommen zurück!`);
                closeAuthModal();
                loginForm.reset();
            } else {
                signOut(auth);
                showToast("Bitte bestätige zuerst deine E-Mail-Adresse.", true);
            }
        })
        .catch((error) => { showToast(`Fehler: ${error.message}`, true); });
});

const registerForm = document.getElementById('register-form');
const registerPasswordInput = document.getElementById('register-password');
const criteriaContainer = document.getElementById('password-criteria');
const pwLength = document.getElementById('pw-length');
const pwUppercase = document.getElementById('pw-uppercase');
const pwNumber = document.getElementById('pw-number');

const validatePassword = () => {
    const password = registerPasswordInput.value;
    let allValid = true;

    const updateCriterion = (element, isValid) => {
        const text = element.textContent.replace(/[✗✓] /g, '');
        if (isValid) {
            element.style.color = 'var(--brand)';
            element.innerHTML = `✓ ${text}`;
        } else {
            element.style.color = 'var(--danger)';
            element.innerHTML = `✗ ${text}`;
            allValid = false;
        }
    };

    updateCriterion(pwLength, password.length >= 8 && password.length <= 16);
    updateCriterion(pwUppercase, /[A-Z]/.test(password));
    updateCriterion(pwNumber, /\d/.test(password));

    return allValid;
};

registerPasswordInput.addEventListener('focus', () => {
    criteriaContainer.hidden = false;
});
registerPasswordInput.addEventListener('input', validatePassword);


/**
 * Validiert einen Benutzernamen auf Eindeutigkeit, erlaubte Zeichen und verbotene Namen.
 * @param {string} username - Der zu überprüfende Benutzername.
 * @param {string|null} currentUserId - Die UID des aktuellen Benutzers (optional, für Profil-Updates).
 * @returns {Promise<{isValid: boolean, message: string}>} Ein Objekt, das den Validierungsstatus und eine Nachricht enthält.
 */
async function validateUsername(username, currentUserId = null) {
    const usernameTrimmed = username.trim();
    // 1. Längenprüfung
    if (usernameTrimmed.length < 3 || usernameTrimmed.length > 20) {
        return { isValid: false, message: "Benutzername muss 3-20 Zeichen lang sein." };
    }

    // 2. Prüfung auf erlaubte Zeichen (nur Buchstaben, Zahlen, _, .)
    const allowedCharsRegex = /^[a-zA-Z0-9_.]+$/;
    if (!allowedCharsRegex.test(usernameTrimmed)) {
        return { isValid: false, message: "Benutzername enthält ungültige Zeichen. Erlaubt sind nur Buchstaben, Zahlen, '_' und '.'." };
    }

    // 3. Prüfung auf verbotene Namen
    if (FORBIDDEN_USERNAMES.includes(usernameTrimmed.toLowerCase())) {
        return { isValid: false, message: "Dieser Benutzername ist nicht erlaubt." };
    }

    // 4. Prüfung auf Eindeutigkeit in der Datenbank
    try {
        const q = query(collection(db, "users"), where("username_lowercase", "==", usernameTrimmed.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Ein Benutzer mit diesem Namen existiert bereits. Prüfen, ob es der aktuelle Benutzer selbst ist.
            let isTaken = true;
            if (currentUserId) {
                querySnapshot.forEach(doc => {
                    if (doc.id === currentUserId) {
                        isTaken = false; // Der gefundene Benutzer ist der aktuelle, also ist der Name nicht "von jemand anderem" belegt.
                    }
                });
            }
             if (isTaken) {
                return { isValid: false, message: "Dieser Benutzername ist bereits vergeben." };
            }
        }
    } catch (error) {
        console.error("Fehler bei der Benutzernamen-Prüfung:", error);
        return { isValid: false, message: "Fehler bei der Prüfung des Benutzernamens." };
    }

    return { isValid: true, message: "Benutzername ist gültig." };
}


registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
        showToast("Dein Passwort erfüllt nicht alle Anforderungen.", true);
        return;
    }

const username = document.getElementById('register-username').value;
const email = document.getElementById('register-email').value;
const password = registerPasswordInput.value;
const submitButton = registerForm.querySelector('button[type="submit"]');
const usernameHint = document.getElementById('register-username-hint');

submitButton.disabled = true;
submitButton.textContent = 'Prüfe Daten...';
usernameHint.hidden = true;

// Benutzernamen validieren
const usernameValidation = await validateUsername(username);
if (!usernameValidation.isValid) {
    usernameHint.textContent = usernameValidation.message;
    usernameHint.classList.add('error');
    usernameHint.hidden = false;
    
    submitButton.disabled = false;
    submitButton.textContent = 'Registrieren';
    return;
}
    
submitButton.textContent = 'Registriere...';

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            return updateProfile(userCredential.user, { displayName: username })
                .then(() => sendEmailVerification(userCredential.user))
                .then(() => {
                    // GEÄNDERT: Neue Felder für das Follow-System hinzugefügt
                    return setDoc(doc(db, "users", userCredential.user.uid), {
                        username: username,
                        username_lowercase: username.toLowerCase(),
                        watchlist: [],
                        firstName: "",
                        lastName: "",
                        address: "",
                        usernameLastChanged: null,
                        usernameChangeCount: 0,
                        avatarColor: null,
                        avatarUrl: '',
                        following: [], // NEU
                        followers: []  // NEU
                    });
                });
        })
        .then(() => {
            closeAuthModal();
            registerForm.reset();
            criteriaContainer.hidden = true;
            pwLength.innerHTML = 'Mindestens 8 & maximal 16 Zeichen';
            pwUppercase.innerHTML = 'Mindestens ein Großbuchstabe (A-Z)';
            pwNumber.innerHTML = 'Mindestens eine Zahl (0-9)';
            [pwLength, pwUppercase, pwNumber].forEach(el => el.style.color = 'var(--muted)');

            verifyEmailModal.style.display = 'flex';
            signOut(auth);
        })
        .catch((error) => { 
            showToast(`Fehler: ${error.message}`, true); 
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Registrieren';
        });
});

function startResendTimer() {
    let seconds = 30;
    resendContainer.innerHTML = `<p>Du kannst in ${seconds} Sekunden eine neue E-Mail anfordern.</p>`;

    resendTimerInterval = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            resendContainer.innerHTML = `<p>Du kannst in ${seconds} Sekunden eine neue E-Mail anfordern.</p>`;
        } else {
            clearInterval(resendTimerInterval);
            const resendLink = document.createElement('a');
            resendLink.href = '#';
            resendLink.textContent = 'Klicke hier, um die E-Mail erneut zu senden.';
            resendLink.onclick = (e) => {
                e.preventDefault();
                sendPasswordResetEmail(auth, lastResetEmail)
                    .then(() => {
                        showToast("E-Mail wurde erneut gesendet.");
                        startResendTimer();
                    })
                    .catch((error) => {
                        showToast(`Fehler: ${error.message}`, true);
                        startResendTimer();
                    });
            };
            resendContainer.innerHTML = '';
            resendContainer.appendChild(resendLink);
        }
    }, 1000);
}

const forgotPasswordLink = document.getElementById('forgot-password-link');
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    if (!email) {
        showToast("Bitte gib deine E-Mail-Adresse ein.", true);
        return;
    }
    sendPasswordResetEmail(auth, email)
        .then(() => {
            lastResetEmail = email;
            closeAuthModal();
            resetConfirmModal.style.display = 'flex';
            startResendTimer();
        })
        .catch((error) => { showToast(`Fehler: ${error.message}`, true); });
});

// --- Custom Select & Initialisierungslogik ---
document.addEventListener('DOMContentLoaded', () => {
  const avatarUploadInput = document.getElementById('p-avatar-upload');
avatarUploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5 MB Limit
        showToast("Datei ist zu groß (max. 5MB)", true);
        return;
    }

    showToast("Lade Bild hoch...");
    const imageUrl = await uploadImageToCloudinary(file);

    if (imageUrl) {
        const user = auth.currentUser;
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { avatarUrl: imageUrl });

        showToast("Profilbild erfolgreich aktualisiert!");
    }
    e.target.value = '';
});
  document.querySelectorAll('select').forEach(selectElement => {
    if(selectElement.parentElement.classList.contains('custom-select-wrapper')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML = `<span>${selectElement.options[selectElement.selectedIndex].textContent}</span><div class="arrow"></div>`;
    const options = document.createElement('div');
    options.className = 'custom-options';
    Array.from(selectElement.options).forEach(option => {
      const customOption = document.createElement('div');
      customOption.className = 'custom-option';
      customOption.textContent = option.textContent;
      customOption.dataset.value = option.value;
      if (option.disabled) customOption.classList.add('disabled');
      if (option.selected) customOption.classList.add('selected');
      customOption.addEventListener('click', (e) => {
        e.stopPropagation();
        if (option.disabled) return;
        options.querySelector('.selected')?.classList.remove('selected');
        customOption.classList.add('selected');
        trigger.querySelector('span').textContent = option.textContent;
        selectElement.value = option.value;
        selectElement.dispatchEvent(new Event('change'));
        wrapper.classList.remove('open');
      });
      options.appendChild(customOption);
    });
    selectElement.parentNode.insertBefore(wrapper, selectElement);
    wrapper.append(selectElement, trigger, options);
   trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll('.custom-select-wrapper.open').forEach(openWrapper => {
        if (openWrapper !== wrapper) { openWrapper.classList.remove('open'); }
    });
    wrapper.classList.toggle('open');
    });
    selectElement.addEventListener('change', () => {
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      trigger.querySelector('span').textContent = selectedOption.textContent;
      options.querySelector('.selected')?.classList.remove('selected');
      options.querySelector(`[data-value="${selectedOption.value}"]`)?.classList.add('selected');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-wrapper.open').forEach(wrapper => { wrapper.classList.remove('open'); });
  });

  const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  const eyeOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

  function setupPasswordToggle(inputId, buttonId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.getElementById(buttonId);
    if (!passwordInput || !toggleButton) return;
    toggleButton.innerHTML = eyeIcon;
    toggleButton.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.innerHTML = eyeOffIcon;
      } else {
        passwordInput.type = 'password';
        toggleButton.innerHTML = eyeIcon;
      }
    });
  }

  setupPasswordToggle('login-password', 'toggle-login-password');
  setupPasswordToggle('register-password', 'toggle-register-password');

  const adminSearchForm = document.getElementById('admin-search-form');
  adminSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('admin-search-input');
      const searchTerm = searchInput.value.trim().toUpperCase();
      if (!searchTerm) return;

      const foundAd = ads.find(ad => ad.displayId.toUpperCase() === searchTerm);

      if (foundAd) {
          renderDetail(foundAd.id);
          searchInput.value = '';
      } else {
          showToast(`Keine Anzeige mit der ID "${searchTerm}" gefunden.`, true);
      }
  });

  // NEU: Event-Listener für die Benachrichtigungsglocke
    const bellBtn = document.getElementById('notification-bell-btn');
    const notifPanel = document.getElementById('notifications-panel');

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Verhindert, dass das document-click-Event sofort ausgelöst wird
        notifPanel.hidden = !notifPanel.hidden;
    });

    document.addEventListener('click', (e) => {
        // Panel ausblenden, wenn außerhalb geklickt wird
        if (!notifPanel.hidden && !notifPanel.contains(e.target) && !bellBtn.contains(e.target)) {
            notifPanel.hidden = true;
        }
    });

    // NEU: Event-Listener für "Zurück"-Buttons im Melde-Prozess
    document.getElementById('btn-back-from-report-reason').addEventListener('click', () => {
        if (reportingAd && reportingAd.id) {
            renderDetail(reportingAd.id);
        } else {
            showView(lastListView || 'home'); // Fallback
        }
    });
    
    document.getElementById('btn-back-from-report-details').addEventListener('click', () => {
        showView('reportReason');
    });

    // NEU: Logik für "Abbrechen"-Buttons im Melde-Prozess verbessert
    const cancelReportFlow = () => {
        const adToReturnTo = reportingAd.id;
        reportingAd = { id: null, reason: null }; // Zustand zurücksetzen
        if (adToReturnTo) {
            renderDetail(adToReturnTo);
        } else {
            showView(lastListView || 'home');
        }
    };
    document.getElementById('btn-cancel-report-1').onclick = cancelReportFlow;
    document.getElementById('btn-cancel-report-2').onclick = cancelReportFlow;


  listenToAds();
  showView("home");
});


// --- DATENBANK-LISTENER FUNKTIONEN ---
function listenToAds() {
    const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));

    unsubscribeAdsListener = onSnapshot(q, (querySnapshot) => {
        ads = [];
        querySnapshot.forEach((doc) => {
            ads.push({ id: doc.id, ...doc.data() });
        });

        const currentView = Object.keys(views).find(key => !views[key].hidden);
        if (currentView === "home") applyFilters();
        if (currentView === "watchlist") renderWatchlist();
        if (currentView === "myAds") renderMyAds();
        if (currentView === "stats") renderStatsView();

    }, (error) => {
        console.error("Fehler beim Lauschen auf Anzeigen-Änderungen:", error);
        showToast("Konnte Anzeigen nicht laden.", true);
    });
}

function listenToUserProfile(uid) {
    if (unsubscribeWatchlistListener) unsubscribeWatchlistListener();

    unsubscribeWatchlistListener = onSnapshot(doc(db, "users", uid), (doc) => {
        if (doc.exists()) {
            currentUserProfile = doc.data();
            watchlist = currentUserProfile.watchlist || [];
        } else {
            currentUserProfile = {};
            watchlist = [];
        }

        const navAvatar = document.getElementById('nav-avatar');
        if (currentUserProfile && currentUserProfile.avatarUrl) {
            navAvatar.src = currentUserProfile.avatarUrl.replace('/upload/', '/upload/w_40,h_40,c_fill,g_face,r_max/');
        } else {
            const userName = auth.currentUser ? auth.currentUser.displayName : '';
            navAvatar.src = createInitialAvatar(userName, currentUserProfile.avatarColor);
        }

        const currentView = Object.keys(views).find(key => !views[key].hidden);
        if (currentView === "home") applyFilters();
        if (currentView === "watchlist") renderWatchlist();
        if (currentView === "profile" && views.profile.hidden === false) {
             renderProfileView();
        }
    }, (error) => {
        console.error("Fehler beim Lauschen auf Profil-Änderungen:", error);
    });
}

// --- PROFILSEITE LOGIK ---
const profileForm = document.getElementById('profile-form');

function renderProfileView() {
    const user = auth.currentUser;
    if (!user || !currentUserProfile) return;

    const avatarPreview = document.getElementById('p-avatar-preview');
    const deleteAvatarBtn = document.getElementById('btn-delete-avatar');
    const colorPaletteContainer = document.getElementById('color-palette-container');

    // Logik zur Anzeige von Avatar, Buttons und Farbpalette
    const hasCustomAvatar = currentUserProfile.avatarUrl && currentUserProfile.avatarUrl !== '';
    
    if (hasCustomAvatar) {
        avatarPreview.src = currentUserProfile.avatarUrl.replace('/upload/', '/upload/w_150,h_150,c_fill,g_face,r_max/');
        deleteAvatarBtn.hidden = false;
        colorPaletteContainer.hidden = true;
    } else {
        avatarPreview.src = createInitialAvatar(user.displayName, currentUserProfile.avatarColor);
        deleteAvatarBtn.hidden = true;
        colorPaletteContainer.hidden = false;
    }

    // Farbpalette rendern
    const paletteContainer = document.getElementById('avatar-color-palette');
    paletteContainer.innerHTML = '';
    AVATAR_COLORS.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color;
        if (color === currentUserProfile.avatarColor) {
            swatch.classList.add('selected');
        }
        swatch.addEventListener('click', () => {
            paletteContainer.querySelector('.selected')?.classList.remove('selected');
            swatch.classList.add('selected');
            if (!hasCustomAvatar) {
                avatarPreview.src = createInitialAvatar(user.displayName, color);
            }
        });
        paletteContainer.appendChild(swatch);
    });

    // Formularfelder füllen
    document.getElementById('p-email').value = user.email || '';
    document.getElementById('p-username').value = user.displayName || '';
    document.getElementById('p-firstname').value = currentUserProfile.firstName || '';
    document.getElementById('p-lastname').value = currentUserProfile.lastName || '';
    document.getElementById('p-street').value = currentUserProfile.street || '';
    document.getElementById('p-zip').value = currentUserProfile.zip || '';
    document.getElementById('p-city').value = currentUserProfile.city || '';

    // Logik für Benutzernamen-Änderung
    const usernameInput = document.getElementById('p-username');
    const usernameHint = document.getElementById('username-hint');
    const { usernameLastChanged, usernameChangeCount } = currentUserProfile;
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    let canChangeUsername = true;

    if (usernameChangeCount >= 2) {
        if (usernameLastChanged) {
            const lastChangeDate = usernameLastChanged.toDate();
            const timeSinceChange = new Date().getTime() - lastChangeDate.getTime();
            if (timeSinceChange < thirtyDaysInMs) {
                canChangeUsername = false;
                const daysLeft = Math.ceil((thirtyDaysInMs - timeSinceChange) / (1000 * 60 * 60 * 24));
                usernameHint.textContent = `Du kannst deinen Namen wieder in ${daysLeft} Tagen ändern.`;
            }
        }
    }

    if (canChangeUsername) {
        const changesLeft = 2 - (usernameChangeCount || 0);
        usernameHint.textContent = `Du kannst deinen Namen noch ${changesLeft} mal ändern (Reset in 30 Tagen).`;
    }

    usernameInput.disabled = !canChangeUsername;
    usernameHint.hidden = false;
}

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !currentUserProfile) return;

    const usernameHint = document.getElementById('username-hint');
    const userDocRef = doc(db, "users", user.uid);

    const newUsername = document.getElementById('p-username').value.trim();
    const newFirstName = document.getElementById('p-firstname').value.trim();
    const newLastName = document.getElementById('p-lastname').value.trim();
    const newStreet = document.getElementById('p-street').value.trim();
    const newZip = document.getElementById('p-zip').value.trim();
    const newCity = document.getElementById('p-city').value.trim();

    const selectedColorSwatch = document.querySelector('#avatar-color-palette .selected');
    const newAvatarColor = selectedColorSwatch ? selectedColorSwatch.dataset.color : currentUserProfile.avatarColor || null;

    const updates = {
        firstName: newFirstName,
        lastName: newLastName,
        street: newStreet,
        zip: newZip,
        city: newCity,
        avatarColor: newAvatarColor,
    };

    if (newUsername !== user.displayName) {
        const { usernameLastChanged, usernameChangeCount } = currentUserProfile;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        let canChangeUsername = true;
        let effectiveCount = usernameChangeCount || 0;

        if (usernameLastChanged && (new Date().getTime() - usernameLastChanged.toDate().getTime() > thirtyDaysInMs)) {
            effectiveCount = 0;
        }

        if (effectiveCount >= 2) {
             canChangeUsername = false;
        }

         if (canChangeUsername) {
            const usernameValidation = await validateUsername(newUsername, user.uid);
            if (!usernameValidation.isValid) {
                usernameHint.textContent = usernameValidation.message;
                usernameHint.classList.add('error');
                usernameHint.hidden = false;
                document.getElementById('p-username').value = user.displayName;
                return;
            }

            try {
                usernameHint.classList.remove('error');
                renderProfileView();
                
                await updateProfile(user, { displayName: newUsername });
                updates.username = newUsername;
                updates.username_lowercase = newUsername.toLowerCase();
                updates.usernameLastChanged = serverTimestamp();
                updates.usernameChangeCount = effectiveCount + 1;

            } catch (error) {
                showToast(`Fehler beim Ändern des Benutzernamens: ${error.message}`, true);
                return;
            }
        } else {
            showToast("Du kannst deinen Benutzernamen zurzeit nicht ändern.", true);
            document.getElementById('p-username').value = user.displayName;
            return;
        }
    }

    try {
        await setDoc(userDocRef, updates, { merge: true });
        showToast("Profil erfolgreich gespeichert!");
    } catch (error) {
        showToast(`Fehler beim Speichern des Profils: ${error.message}`, true);
    }
});

document.getElementById('btn-discard-profile').addEventListener('click', () => {
    renderProfileView();
    showToast("Änderungen verworfen.");
});


// --- STATISTIK-ANSICHT ---
function renderStatsView() {
    const adminContainer = document.querySelector('.admin-container');
    const noAdminHint = document.getElementById('stats-no-admin-hint');

    if (!isUserAdmin()) {
        adminContainer.hidden = true;
        noAdminHint.hidden = false;
        return;
    }

    adminContainer.hidden = false;
    noAdminHint.hidden = true;

    // Hinzugefügt: Aufruf zum Rendern der gemeldeten Anzeigen
    renderReportedAds();

    const deletedAds = ads
        .filter(ad => ad.status === 'deleted')
        .sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0))
        .slice(0, 50);

    const listContainer = document.getElementById('deleted-ads-list');
    const emptyHint = document.getElementById('deleted-ads-empty');
    listContainer.innerHTML = '';

    if (deletedAds.length === 0) {
        emptyHint.hidden = false;
    } else {
        emptyHint.hidden = true;
        deletedAds.forEach(ad => {
            const item = document.createElement('div');
            item.className = 'deleted-ad-item';
            item.innerHTML = `
                <span class="id">${ad.displayId}</span>
                <span class="title">${ad.title}</span>
            `;
            item.onclick = () => renderDetail(ad.id);
            listContainer.appendChild(item);
        });
    }

    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    const oldDeletedAds = ads.filter(ad =>
        ad.status === 'deleted' &&
        ad.updatedAt &&
        (now - ad.updatedAt.toDate().getTime()) > sixtyDaysInMs
    );

    const oldListContainer = document.getElementById('old-deleted-ads-list');
    const oldEmptyHint = document.getElementById('old-deleted-ads-empty');
    oldListContainer.innerHTML = '';

    if (oldDeletedAds.length === 0) {
        oldEmptyHint.hidden = false;
    } else {
        oldEmptyHint.hidden = true;
        oldDeletedAds.forEach(ad => {
            const item = document.createElement('div');
            item.className = 'old-deleted-ad-item';
            const deletedDate = formatDate(ad.updatedAt);
            item.innerHTML = `
                <div class="info">
                    <span class="id">${ad.displayId} - ${ad.title}</span>
                    <span class="title">Gelöscht am: ${deletedDate}</span>
                </div>
                <button class="button small danger btn-permanent-delete" data-id="${ad.id}">Endgültig löschen</button>
            `;
            oldListContainer.appendChild(item);
        });
    }
}

// --- NEU: FOLGEN/ENTFOLGEN FUNKTION ---
/**
 * Schaltet den "folgen"-Status für einen Zielbenutzer um.
 * @param {string} targetUserId Die ID des Benutzers, dem gefolgt/entfolgt werden soll.
 */
async function toggleFollowUser(targetUserId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        showToast("Du musst angemeldet sein, um Nutzern zu folgen.", true);
        return;
    }

    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", targetUserId);

    const isCurrentlyFollowing = currentUserProfile?.following?.includes(targetUserId);
    const followButton = document.getElementById('follow-btn');
    if (followButton) followButton.disabled = true;

    try {
        const batch = writeBatch(db);

        if (isCurrentlyFollowing) {
            // Entfolgen-Logik
            batch.update(currentUserRef, { following: arrayRemove(targetUserId) });
            batch.update(targetUserRef, { followers: arrayRemove(currentUser.uid) });
        } else {
            // Folgen-Logik
            batch.update(currentUserRef, { following: arrayUnion(targetUserId) });
            batch.update(targetUserRef, { followers: arrayUnion(currentUser.uid) });
        }

        await batch.commit();

        // UI direkt aktualisieren für besseres Nutzererlebnis
        if (followButton) {
            if (isCurrentlyFollowing) {
                followButton.classList.remove('following');
                followButton.textContent = 'Folgen';
            } else {
                followButton.classList.add('following');
                followButton.textContent = 'Gefolgt';
            }
        }

    } catch (error) {
        console.error("Fehler beim Folgen/Entfolgen:", error);
        showToast("Ein Fehler ist aufgetreten.", true);
    } finally {
        if (followButton) followButton.disabled = false;
    }
}

/**
 * Rendert die öffentliche Profilansicht für einen bestimmten Benutzer.
 * @param {string} userId Die ID des Benutzers, dessen Profil angezeigt werden soll.
 * @param {string} fromAdId Die ID der Anzeige, von der aus navigiert wurde (für den "Zurück"-Button).
 * @param {string} authorName Der bereits bekannte Anzeigename des Autors.
 */
async function renderPublicProfileView(userId, fromAdId, authorName) {
    const userProfile = await getAuthorProfile(userId);

    if (!userProfile) {
        showToast("Nutzerprofil konnte nicht geladen werden.", true);
        return;
    }

    const userAds = ads.filter(ad => ad.authorId === userId && ad.status === 'active');

    const avatarEl = document.getElementById('public-profile-avatar');
    const usernameEl = document.getElementById('public-profile-username');
    const adCountEl = document.getElementById('public-profile-ad-count');
    const adsListEl = document.getElementById('public-profile-ads-list');
    const noAdsHint = document.getElementById('public-profile-no-ads');
    const backButton = document.getElementById('btn-back-from-profile');
    const followContainer = document.getElementById('follow-button-container'); // NEU
    followContainer.innerHTML = ''; // NEU: Alten Button entfernen

    const username = authorName || userProfile.username || 'Unbekannter Nutzer';
    avatarEl.src = userProfile.avatarUrl
        ? userProfile.avatarUrl.replace('/upload/', '/upload/w_160,h_160,c_fill,g_face,r_max/')
        : createInitialAvatar(username, userProfile.avatarColor);
    usernameEl.textContent = username;
    adCountEl.textContent = `${userAds.length} ${userAds.length === 1 ? 'Anzeige' : 'Anzeigen'} online`;

    // NEU: Follow-Button nur anzeigen, wenn man eingeloggt ist und nicht das eigene Profil ansieht
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid !== userId) {
        const isFollowing = currentUserProfile?.following?.includes(userId);

        const followButton = document.createElement('button');
        followButton.id = 'follow-btn';
        followButton.className = 'button follow-btn';
        if (isFollowing) {
            followButton.classList.add('following');
            followButton.textContent = 'Gefolgt';
        } else {
            followButton.textContent = 'Folgen';
        }

        followButton.addEventListener('click', () => toggleFollowUser(userId));
        followContainer.appendChild(followButton);
    }

    adsListEl.innerHTML = '';
    if (userAds.length > 0) {
        noAdsHint.hidden = true;
        userAds.forEach(ad => {
            const card = document.createElement("div");
            card.className = "card";
            const liked = watchlist.includes(ad.id);
            const likeButtonClass = liked ? 'card-like liked' : 'card-like';
            const paymentText = ad.paymentType === 'vb' ? `VB ${ad.payment} €` : `${ad.payment} €`;
            const imageUrl = ad.images && ad.images[0] ? ad.images[0] : PLACEHOLDER_IMAGE;

            card.innerHTML = `
              <div class="card-clickable-area">
                <img src="${imageUrl}" alt="${ad.title}" class="card-image">
                <div class="card-content">
                  <h3 class="card-title">${ad.title}</h3>
                  <div class="card-meta">
                    ${ad.createdAt ? `<span class="i"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${formatDate(ad.createdAt)} Uhr</span>` : ''}
                    <span class="i"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${ad.location}</span>
                  </div>
                </div>
              </div>
              <div class="card-actions">
                <span class="payment">${paymentText}</span>
                <button class="card-like-btn" data-id="${ad.id}">
                  <svg class="${likeButtonClass}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
            `;
            card.querySelector('.card-clickable-area').addEventListener("click", () => renderDetail(ad.id));
            adsListEl.appendChild(card);
        });
    } else {
        noAdsHint.hidden = false;
    }

    backButton.onclick = () => renderDetail(fromAdId);
    showView('publicProfile');
    window.scrollTo(0, 0);
}

// --- DETAIL-ANSICHT ---
async function renderDetail(adId) {
    const ad = ads.find(a => a.id === adId);
    if (!ad) {
        showToast("Anzeige nicht gefunden.", true);
        showView(lastListView || 'home');
        return;
    }

    const authorProfile = await getAuthorProfile(ad.authorId);
    const authorName = authorProfile ? (authorProfile.username || ad.authorName || 'Unbekannt') : (ad.authorName || 'Unbekannt');
    const authorAvatar = authorProfile && authorProfile.avatarUrl
        ? authorProfile.avatarUrl.replace('/upload/', '/upload/w_32,h_32,c_fill,g_face,r_max/')
        : createInitialAvatar(authorName, authorProfile?.avatarColor);

    const detailCard = document.getElementById("detail-card");

    let galleryHtml = '';
    const images = ad.images && ad.images.length > 0 ? ad.images : [PLACEHOLDER_IMAGE];

    galleryHtml = `
        <div class="detail-gallery">
            ${images.map((src, index) => `
                <img src="${src}" alt="Bild ${index + 1} für ${ad.title}" class="detail-gallery-image ${index === 0 ? 'active' : ''}">
            `).join('')}
            ${images.length > 1 ? `
                <div class="gallery-nav">
                    <button id="prev-btn" aria-label="Voriges Bild">‹</button>
                    <button id="next-btn" aria-label="Nächstes Bild">›</button>
                </div>
            ` : ''}
        </div>
    `;

    const paymentText = ad.paymentType === 'vb' ? `VB ${ad.payment} €` : `${ad.payment} €`;

    // KORRIGIERT: HTML-Struktur für das Icon, um CSS-Konflikte zu vermeiden
    const menuHtml = `
        <div class="detail-header-actions">
            <button class="menu-toggle-btn" aria-label="Weitere Optionen">
                <div class="menu-dots">
                    <span></span><span></span><span></span>
                </div>
            </button>
            <div class="detail-menu">
                <button class="detail-menu-item" id="detail-share-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    <span>Teilen</span>
                </button>
                <button class="detail-menu-item danger" id="detail-report-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <span>Melden</span>
                </button>
            </div>
        </div>
    `;
    
    // Admin-Panel Logik
    let adminPanelHtml = '';
    if (isUserAdmin()) {
        const isDeleted = ad.status === 'deleted';
        adminPanelHtml = `
            <div class="admin-detail-panel">
                <h4>Admin-Aktionen</h4>
                <p>Aktueller Status: <strong>${ad.status}</strong></p>
                <div class="admin-actions">
                    <button class="button small ${isDeleted ? '' : 'danger'}" id="admin-toggle-ad-status-btn">
                        ${isDeleted ? 'Anzeige reaktivieren' : 'Anzeige deaktivieren'}
                    </button>
                    <button class="button small danger" id="admin-permanent-delete-btn">Endgültig löschen</button>
                </div>
            </div>
        `;
    }

    const contentHtml = `
      <div class="detail-content">
            ${menuHtml} 
            <div id="detail-author-link" class="detail-author" style="cursor: pointer;" title="Profil von ${authorName} ansehen">
                <img src="${authorAvatar}" alt="Avatar von ${authorName}" class="detail-author-avatar">
                <span>Erstellt von <strong>${authorName}</strong></span>
            </div>

            <h1 class="detail-title">${ad.title}</h1>

            <div class="detail-meta-grid">
                <div class="meta-item"><strong>Erstellt am:</strong> <span>${formatDate(ad.createdAt)}</span></div>
                <div class="meta-item"><strong>Kategorie:</strong> <span>${ad.category}</span></div>
                <div class="meta-item"><strong>Ort:</strong> <span>${ad.location}</span></div>
                <div class="meta-item"><strong>Dauer/Fläche:</strong> <span>${ad.size || 'Keine Angabe'}</span></div>
                <div class="meta-item"><strong>Geräte gestellt:</strong> <span>${ad.tools}</span></div>
            </div>

            <p class="detail-desc">${ad.desc.replace(/\n/g, '<br>')}</p>

            <div class="detail-footer">
                <span class="detail-payment">${paymentText}</span>
                ${ad.displayId ? `<span class="detail-ad-id">ID: ${ad.displayId}</span>` : ''}
            </div>

            <div class="detail-actions">
                 <button id="btn-contact-author">Nachricht senden</button>
            </div>
            ${adminPanelHtml}
        </div>
    `;

    detailCard.innerHTML = galleryHtml + contentHtml;
    detailCard.querySelector('#detail-author-link').addEventListener('click', () => {
        renderPublicProfileView(ad.authorId, ad.id, authorName);
    });
   
    if (isUserAdmin()) {
        const toggleBtn = document.getElementById('admin-toggle-ad-status-btn');
        if (toggleBtn) {
            toggleBtn.onclick = async () => {
                const isCurrentlyDeleted = ad.status === 'deleted';
                const newStatus = isCurrentlyDeleted ? 'active' : 'deleted';
                const actionText = isCurrentlyDeleted ? 'reaktiviert' : 'deaktiviert';
                try {
                    await updateDoc(doc(db, "ads", adId), { status: newStatus, updatedAt: serverTimestamp() });
                    showToast(`Anzeige wurde ${actionText}.`);
                    renderDetail(adId);
                } catch (error) {
                    showToast("Statusänderung fehlgeschlagen.", true);
                }
            };
        }

        const permDeleteBtn = document.getElementById('admin-permanent-delete-btn');
        if (permDeleteBtn) {
            permDeleteBtn.onclick = async () => {
                 const confirmed = await showConfirmModal(
                    "Endgültig löschen?",
                    `Bist du absolut sicher, dass du diese Anzeige unwiderruflich vom Server löschen möchtest? Dies kann nicht rückgängig gemacht werden!`,
                    "Ja, endgültig löschen"
                );
                if (confirmed) {
                    try {
                        await deleteDoc(doc(db, "ads", adId));
                        showToast("Anzeige wurde permanent gelöscht.");
                        showView(lastListView || 'home');
                    } catch (error) {
                        showToast("Endgültiges Löschen fehlgeschlagen.", true);
                    }
                }
            };
        }
    }

    if (images.length > 1) {
        let currentImageIndex = 0;
        const imageElements = detailCard.querySelectorAll('.detail-gallery-image');
        const updateGallery = () => {
            imageElements.forEach((img, index) => img.classList.toggle('active', index === currentImageIndex));
        };
        detailCard.querySelector('#prev-btn').onclick = () => {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            updateGallery();
        };
        detailCard.querySelector('#next-btn').onclick = () => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            updateGallery();
        };
    }

    const menuToggle = detailCard.querySelector('.menu-toggle-btn');
    const detailMenu = detailCard.querySelector('.detail-menu');
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        detailMenu.classList.toggle('visible');
    });
    document.addEventListener('click', () => detailMenu.classList.remove('visible'), true);

    detailCard.querySelector('#detail-share-btn').addEventListener('click', () => openShareModal(ad.id));
    detailCard.querySelector('#detail-report-btn').addEventListener('click', () => startReportProcess(ad.id));


    showView("detail");
    window.scrollTo(0, 0);
}


// --- NEU: BENACHRICHTIGUNGS-FUNKTIONEN ---

/**
 * Erstellt Benachrichtigungen für alle Follower eines Nutzers, wenn eine neue Anzeige erstellt wird.
 * @param {string} adId - Die ID der neuen Anzeige.
 * @param {object} adData - Die Daten der neuen Anzeige.
 */
async function createNotificationsForFollowers(adId, adData) {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUserProfile) return;

    const followers = currentUserProfile.followers || [];
    if (followers.length === 0) return;

    try {
        const batch = writeBatch(db);
        const notificationsRef = collection(db, "notifications");

        followers.forEach(followerId => {
            const newNotifRef = doc(notificationsRef);
            const notificationData = {
                recipientId: followerId,
                fromUserId: currentUser.uid,
                fromUserName: currentUser.displayName,
                adId: adId,
                adTitle: adData.title,
                type: 'new_ad',
                isRead: false,
                createdAt: serverTimestamp()
            };
            batch.set(newNotifRef, notificationData);
        });

        await batch.commit();
    } catch (error) {
        console.error("Fehler beim Erstellen der Benachrichtigungen:", error);
    }
}

/**
 * Lauscht auf neue Benachrichtigungen für den angemeldeten Benutzer.
 * @param {string} uid - Die User-ID des angemeldeten Benutzers.
 */
function listenToNotifications(uid) {
    if (unsubscribeNotificationsListener) unsubscribeNotificationsListener();

    const q = query(
        collection(db, "notifications"),
        where("recipientId", "==", uid),
        orderBy("createdAt", "desc")
    );

    unsubscribeNotificationsListener = onSnapshot(q, (snapshot) => {
        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        renderNotifications(notifications);
    }, (error) => {
        console.error("Fehler beim Lauschen auf Benachrichtigungen:", error);
    });
}

/**
 * Rendert die Benachrichtigungen in der Navigationsleiste.
 * @param {Array} notifications - Ein Array von Benachrichtigungs-Objekten.
 */
function renderNotifications(notifications) {
    const bellContainer = document.getElementById('notification-bell-container');
    const counter = document.getElementById('notification-counter');
    const list = document.getElementById('notifications-list');
    const emptyHint = document.getElementById('notifications-empty');

    bellContainer.hidden = false;
    list.innerHTML = '';

    const unreadNotifications = notifications.filter(n => !n.isRead);

    if (unreadNotifications.length === 0) {
        emptyHint.hidden = false;
        counter.hidden = true;
        counter.textContent = '0';
        return;
    }

    emptyHint.hidden = true;
    counter.textContent = unreadNotifications.length;
    counter.hidden = false;

    unreadNotifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = 'notification-item unread';

        const avatarSrc = createInitialAvatar(notif.fromUserName);

        item.innerHTML = `
            <div class="notification-avatar">
                <img src="${avatarSrc}" alt="Avatar von ${notif.fromUserName}">
            </div>
            <div class="notification-content">
                <p><strong>${notif.fromUserName}</strong> hat eine neue Anzeige erstellt: "${notif.adTitle}"</p>
                <span>${formatDate(notif.createdAt)}</span>
            </div>
        `;

        item.addEventListener('click', async () => {
            document.getElementById('notifications-panel').hidden = true;
            renderDetail(notif.adId);

            try {
                await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
            } catch (error) {
                console.error("Konnte Benachrichtigung nicht als gelesen markieren:", error);
                showToast("Fehler beim Aktualisieren der Benachrichtigung.", true);
            }
        });

        list.appendChild(item);
    });
}

// ===================================================================
// ====== NEUE FUNKTIONEN FÜR TEILEN & MELDEN (18.09.2025) ======
// ===================================================================

// --- SHARE MODAL LOGIC ---
const shareModal = document.getElementById('share-modal');
const closeShareModalBtn = document.getElementById('close-share-modal-btn');

function openShareModal(adId) {
    const adToShare = ads.find(ad => ad.id === adId);
    if (!adToShare) return;

    const shareLink = `${window.location.origin}${window.location.pathname}#detail=${adId}`;
    const shareText = `Schau dir diese Anzeige an: ${adToShare.title}`;
    
    document.getElementById('share-link-input').value = shareLink;
    document.getElementById('share-whatsapp').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + shareLink)}`;
    document.getElementById('share-email').href = `mailto:?subject=${encodeURIComponent(adToShare.title)}&body=${encodeURIComponent(shareText + "\n\n" + shareLink)}`;

    shareModal.style.display = 'flex';
}

closeShareModalBtn.onclick = () => shareModal.style.display = 'none';
shareModal.onclick = (e) => { if (e.target === shareModal) shareModal.style.display = 'none'; };

document.getElementById('copy-share-link-btn').onclick = () => {
    const input = document.getElementById('share-link-input');
    input.select();
    navigator.clipboard.writeText(input.value)
        .then(() => showToast("Link kopiert!"))
        .catch(() => showToast("Kopieren fehlgeschlagen.", true));
};

// --- REPORTING LOGIC ---
function startReportProcess(adId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        showToast("Du musst angemeldet sein, um eine Anzeige zu melden.", true);
        openAuthModal();
        return;
    }
    reportingAd.id = adId;
    document.getElementById('report-reason-form').reset();
    showView('reportReason');
}

document.getElementById('report-reason-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedReason = new FormData(e.target).get('report-reason');
    if (selectedReason) {
        reportingAd.reason = selectedReason;
        document.getElementById('report-details-form').reset();
        showView('reportDetails');
    }
});

document.getElementById('report-details-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser || !reportingAd.id || !reportingAd.reason) return;

    const description = document.getElementById('report-description').value.trim();
    
    const reportData = {
        adId: reportingAd.id,
        reason: reportingAd.reason,
        description: description,
        reporterId: currentUser.uid,
        status: 'open', // 'open', 'resolved_deleted', 'resolved_dismissed'
        createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, "reports"), reportData);
        showToast("Vielen Dank, deine Meldung wurde übermittelt.");
        showView('home');
    } catch (error) {
        console.error("Fehler beim Senden der Meldung:", error);
        showToast("Meldung konnte nicht gesendet werden.", true);
    } finally {
        reportingAd = { id: null, reason: null };
    }
});

// --- ADMIN REPORTING LOGIC ---
let openReports = []; // Cache für offene Meldungen

function listenToReports() {
    if (!isUserAdmin()) return;
    if (unsubscribeReportsListener) unsubscribeReportsListener();

    const q = query(collection(db, "reports"), where("status", "==", "open"), orderBy("createdAt", "desc"));

    unsubscribeReportsListener = onSnapshot(q, (snapshot) => {
        openReports = [];
        snapshot.forEach(doc => {
            openReports.push({ id: doc.id, ...doc.data() });
        });
        if (!views.stats.hidden) {
            renderReportedAds();
        }
    });
}

function renderReportedAds() {
    if (!isUserAdmin()) return;

    const listContainer = document.getElementById('reported-ads-list');
    const emptyHint = document.getElementById('reported-ads-empty');
    listContainer.innerHTML = '';

    if (openReports.length === 0) {
        emptyHint.hidden = false;
        return;
    }

    emptyHint.hidden = true;
    openReports.forEach(report => {
        const ad = ads.find(a => a.id === report.adId);
        if (!ad) return;

        const item = document.createElement('div');
        item.className = 'reported-ad-item';
        item.innerHTML = `
            <div class="reported-ad-info">
                <span class="title">${ad.title} (${ad.displayId})</span>
                <span class="reason">Grund: ${report.reason}</span>
            </div>
            <span class="badge">Neu</span>
        `;
        item.onclick = () => openAdminReportModal(report);
        listContainer.appendChild(item);
    });
}

const adminReportModal = document.getElementById('admin-report-modal');
const closeAdminReportModalBtn = document.getElementById('close-admin-report-modal-btn');
let currentReport = null;

async function openAdminReportModal(report) {
    currentReport = report;
    const ad = ads.find(a => a.id === report.adId);
    if (!ad) {
        showToast("Die zugehörige Anzeige wurde nicht gefunden.", true);
        return;
    }
    
    document.getElementById('admin-report-ad-title').textContent = ad.title;
    document.getElementById('admin-report-reason').textContent = report.reason;
    document.getElementById('admin-report-description').textContent = report.description || 'Keine weitere Beschreibung vorhanden.';

    document.getElementById('admin-view-ad-btn').onclick = () => {
        adminReportModal.style.display = 'none';
        currentReport = null;
        renderDetail(ad.id);
    };

    adminReportModal.style.display = 'flex';
}

closeAdminReportModalBtn.onclick = () => { adminReportModal.style.display = 'none'; currentReport = null; };
adminReportModal.onclick = (e) => { if (e.target === adminReportModal) { adminReportModal.style.display = 'none'; currentReport = null; } };

document.getElementById('admin-delete-ad-btn').onclick = async () => {
    if (!currentReport) return;
    
    const confirmed = await showConfirmModal(
        "Anzeige löschen & Meldung schließen?",
        "Die Anzeige wird für Nutzer unsichtbar gemacht und die Meldung wird als erledigt markiert.",
        "Ja, löschen"
    );

    if (confirmed) {
        try {
            const batch = writeBatch(db);
            const adRef = doc(db, "ads", currentReport.adId);
            const reportRef = doc(db, "reports", currentReport.id);

            batch.update(adRef, { status: 'deleted', updatedAt: serverTimestamp() });
            batch.update(reportRef, { status: 'resolved_deleted' });
            
            await batch.commit();
            showToast("Anzeige gelöscht und Meldung geschlossen.");
        } catch (error) {
            showToast("Aktion fehlgeschlagen.", true);
        } finally {
            adminReportModal.style.display = 'none';
        }
    }
};

document.getElementById('admin-dismiss-report-btn').onclick = async () => {
    if (!currentReport) return;

    try {
        const reportRef = doc(db, "reports", currentReport.id);
        await updateDoc(reportRef, { status: 'resolved_dismissed' });
        showToast("Meldung als erledigt markiert.");
    } catch (error) {
        showToast("Aktion fehlgeschlagen.", true);
    } finally {
        adminReportModal.style.display = 'none';
    }
};