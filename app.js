// app.js


// --- GLOBALE KONFIGURATION ---

const MAX_IMAGES = 15; // Maximale Anzahl an Bildern pro Anzeige
const FORBIDDEN_USERNAMES = [
    'admin', 'administrator', 'root', 'support', 'hilfe', 'kontakt', 'info',
    'moderator', 'sysadmin', 'webmaster', 'system', 'helpdesk', 'supportteam',
    'security', 'management', 'dev', 'developer', 'testuser', 'gast', 'guest',
    'demo', 'service', 'official', 'offiziell', 'betreiber', 'inhaber', 'owner',
    'ceo', 'operator', 'account', 'moderation', 'kundenservice', 'customerservice',
    'team', 'teammitglied', 'adminteam', 'communitymanager', 'webmaster', 'devteam',

    // Anstößige und beleidigende Begriffe (Deutsch & Englisch)
    'arsch', 'fotze', 'hure', 'bastard', 'miststueck', 'wichser', 'ficker',
    'pisser', 'schaedel', 'vollidiot', 'trottel', 'spasti', 'schwuchtel',
    'kanake', 'nazi', 'scheisse', 'penner', 'saukerl', 'drecksau', 'huehnchen',
    'zicke', 'mongo', 'nutte', 'fresse', 'schlampe', 'luder', 'verrecker',
    'spacko', 'wichse', 'fotzen', 'arschloch', 'hurensohn', 'schwachkopf',
    'kotze', 'fickfotze', 'nuttensohn', 'schleimscheisser', 'pimmelkopf',
    'sackgesicht', 'vollpfosten', 'kotstulle', 'arschgeige', 'schwachmat',
    'spasti', 'kanacken', 'judenhasser', 'opfer', 'spinner', 'hirni', 'idiot',
    'mutterficker', 'schnauze', 'verpiss', 'leckmich', 'scheisskerl',
    'penner', 'mongo', 'spasti', 'wichser', 'pimmelneid', 'wixer',
    'pisskopf', 'blödmann', 'schwachmat', 'spacken', 'arschgeige',
    'asshole', 'bitch', 'cunt', 'dick', 'fuck', 'pussy', 'slut', 'whore',
    'bastard', 'motherfucker', 'douchebag', 'cock', 'twat', 'wanker', 'prick',
    'ass', 'anal', 'boob', 'tits', 'shit', 'crap', 'nigga', 'faggot', 'retard',
    'queer', 'pedo', 'pervert', 'sex', 'porn', 'basterd', 'fucking', 'bullshit',
    'damn', 'hell', 'suck', 'sucker', 'whorehouse', 'dickhead', 'piss', 'gay',
    'lesbo', 'tranny', 'thot', 'incest', 'necrophilia', 'childporn', 'pedo',
    'pervert', 'sexist', 'racist', 'homophobe',

    // Extremistische und illegale Begriffe
    'hitler', 'nazi', 'kpd', 'terrorist', 'isis', 'al-qaida', 'nsdap', 'mörder',
    'killer', 'death', 'kill', 'terror', 'bomb', 'gun', 'drugdealer', 'murder',
    'terrorist', 'anarchist', 'extremist', 'radikal', 'ns', 'ss', 'sa', 
    'reichsbürger', 'geheimdienst', 'hacker', 'scammer', 'phisher', 'illegal',
    'kommunist', 'sozialist', 'faschist', 'revolution', 'propaganda', 'linksextrem',
    'rechtsextrem', 'freikorps', 'patriot', 'fascho', 'stalinist', 'maoist',
    'salafist', 'jihad', 'islamist', 'antisemit', 'zionist', 'illuminati', 'qanon',
    'verschwörungstheoretiker', 'chemtrail', 'pirat', 'piracy', 'copyrights',

    // Begriffe mit sexuellem oder pornografischem Inhalt
    'penis', 'vagina', 'dildo', 'masturbation', 'sperm', 'ejaculation',
    'urinal', 'penispumpe', 'sexuell', 'erotik', 'intim', 'ficken', 'vergewaltigung',
    'schwanz', 'eier', 'muschi', 'titten', 'arschloch', 'pimmel', 'nuttensohn',
    'fickerei', 'spermabank', 'onanieren', 'analverkehr', 'oralsex', 'blowjob',
    'cumshot', 'gangbang', 'bdsm', 'kinky', 'porno', 'sexshop', 'hm', 'okr'

];

const SUSPICIOUS_USERNAME_WORDS = [
    // Administrative und offizielle Begriffe (Deutsch & Englisch)
    'support', 'hilfe', 'admin', 'team', 'service', 'administrator', 'root',  
    'kontakt', 'info', 'moderator', 'sysadmin', 'webmaster', 'system', 'helpdesk',
    'security', 'management', 'dev', 'developer', 'testuser', 'gast', 'guest',
    'demo', 'official', 'offiziell', 'betreiber', 'inhaber', 'owner', 'ceo',
    'operator', 'account', 'moderation', 'security', 'kundenservice', 'kundenbetreuung',
    'customerservice',

    // Abkürzungen und gängige Varianten
    'adm', 'mod', 'sup', 'syst', 'helpd', 'secu', 'mgmt', 'devl', 'offcl',
    'acct', 'kdnservice', 'supportteam', 'teammitglied', 'adminteam',
    
    // Anstößige und beleidigende Begriffe in Deutsch
    'arsch', 'fotze', 'hure', 'bastard', 'miststueck', 'wichser', 'ficker',
    'pisser', 'schaedel', 'vollidiot', 'trottel', 'spasti', 'schwuchtel',
    'kanake', 'nazi', 'scheisse', 'penner', 'saukerl', 'drecksau', 'huehnchen',
    'zicke', 'mongo', 'nutte', 'fresse', 'schlampe', 'luder', 'verrecker',
    'spacko', 'wichse', 'fotzen', 'arschloch', 'hurensohn', 'schwachkopf',
    'kotze', 'fickfotze', 'nuttensohn', 'schleimscheisser', 'pimmelkopf',
    'sackgesicht', 'vollpfosten', 'kotstulle', 'arschgeige', 'schwachmat',
    'spasti', 'kanacken', 'judenhasser', 'opfer', 'spinner', 'hirni', 'idiot',
    'mutterficker', 'schnauze', 'verpiss', 'leckmich', 'scheisskerl',
    'penner', 'mongo', 'spasti', 'wichser', 'penisneid', 'hm', 'h&m', 'okr',

    // Anstößige und beleidigende Begriffe in Englisch
    'asshole', 'bitch', 'cunt', 'dick', 'fuck', 'pussy', 'slut', 'whore',
    'bastard', 'motherfucker', 'douchebag', 'cock', 'twat', 'wanker', 'prick',
    'ass', 'anal', 'boob', 'tits', 'shit', 'crap', 'nigga', 'faggot', 'retard',
    'queer', 'pedo', 'pervert', 'sex', 'porn', 'basterd', 'fucking', 'bullshit',
    'damn', 'hell', 'suck', 'sucker', 'whorehouse', 'dickhead', 'piss', 'gay',
    'lesbo', 'tranny', 'thot', 'incest', 'necrophilia', 'childporn',

    // Begriffe, die auf gewalttätige, extremistische oder illegale Inhalte hinweisen
    'hitler', 'nazi', 'kpd', 'terrorist', 'isis', 'al-qaida', 'nsdap',
    'mörder', 'killer', 'death', 'kill', 'terror', 'bomb', 'gun', 'drugdealer',
    'murder', 'killer', 'death', 'bomb', 'terror', 'machete', 'knife',
    'drugs', 'cocaine', 'heroin', 'meth', 'deal', 'trafficker', 'smuggle',
    'pirat', 'hacker', 'phishing', 'scam', 'spam', 'botnet', 'trojan', 'virus',
    'malware', 'exploit', 'ddos', 'hackertools', 'illegal', 'anarchist', 'anarchy',
    'extremist', 'extrem', 'radikal', 'terroranschlag', 'amoklauf', 'geheimdienst',
    'ns', 'ss', 'sa', 'afdfraktion',

    // Begriffe, die sexuelle oder anatomische Inhalte beinhalten
    'penis', 'vagina', 'dildo', 'masturbation', 'sperm', 'ejaculation',
    'urinal', 'penispumpe', 'sexuell', 'erotik', 'intim', 'ficken', 'vergewaltigung',
    'schwanz', 'eier', 'muschi', 'titten', 'arschloch', 'pimmel', 'nuttensohn',
    'fickerei', 'spermabank', 'onanieren', 'analverkehr', 'oralsex', 'blowjob',
    'cumshot', 'gangbang', 'bdsm', 'kinky',

    // Häufige Fehl- und Halbschreibungen
    'supp0rt', '5upport', 'spport', 'supoort', 'admn', 'adm1n', 'team',
    'teem', 'hilfee', 'h1lfe', 'ad-min', 'a-dm-in', 'te4m', 'h3lp', 'fuckk',
    'fuk', 'scheiße', 'scheiss', 'scheis', 'arschh', 'arschhloch', 'wichser',
    'wixer', 'nuttte', 'schlammpe', 'spasti', 'spaasti', 'vollidddot',
    'p3nis', 'v4gina', 'd!ck', 'b!tch', '4sshole', 'fuk', 'suckk',

    // Politische und radikale Begriffe
    'kommunist', 'sozialist', 'faschist', 'revolution', 'propaganda', 'linksextrem',
    'rechtsextrem', 'freikorps', 'patriot', 'reichsbürger', 'reich', 'hitler',
    'fascho', 'stalinist', 'maoist', 'salafist', 'jihad', 'islamist', 'antisemit',
    'zionist', 'illuminati', 'qanon', 'chemtrail', 'verschwörung', 'verschwoerung',

    // Sonstige unerwünschte Begriffe
    'fake', 'official', 'offiziell', 'fakeaccount', 'fakeuser', 'fake-account',
    'noob', 'newbie', 'gamergate', 'scam', 'scammer', 'phish', 'phisher',
    'test', 'testaccount', 'tester',

     'sup', 'mod', 'adm', 'root', 'sec', 'dev', 'mgmt', 'sys', 'off', 'offcl',
    'pvt', 'priv', 'pub', 'publ', 'publ1c', 'acct', 'acc', 'reg', 'cust', 'cs',
    'kdn', 'serv', 'info', 'cont', 'contakt', 'supo', 'hel', 'admn', 'tm', 'team',
    'op', 'oprtr', 'ownr', 'web', 'wbmstr', 'sysad', 'modr8r', 'test', 'tst',
    'gost', 'gest', 'dem', 'demo',

    // Abkürzungen und Silben von anstößigen Begriffen (Deutsch & Englisch)
    'arsch', 'ars', 'fick', 'fck', 'wich', 'wix', 'hure', 'hur', 'nutte', 'nutt',
    'schei', 'scheiss', 'scheis', 'schlam', 'fick', 'fotz', 'fotze', 'nut',
    'pimm', 'piml', 'hurn', 'wichs', 'schlam', 'schaedel', 'voll', 'idiot',
    'trott', 'spasti', 'schwucht', 'kanake', 'nazi', 'penner', 'saukerl',
    'dreck', 'zicke', 'mongo', 'nutte', 'fresse', 'luder', 'verreck', 'sack',
    'fucker', 'fuck', 'fuk', 'mother', 'mfkr', 'mofo', 'bastard', 'bstrd', 'bitch',
    'btch', 'cunt', 'cnt', 'dick', 'dk', 'pussy', 'pss', 'slut', 'slt', 'whore',
    'whr', 'ass', 'anal', 'boob', 'tits', 'shit', 'shtt', 'crap', 'crp', 'nig',
    'niga', 'faggot', 'fgt', 'retard', 'rtrd', 'queer', 'pedo', 'p3d0', 'pervert',
    'sex', 'porn', 'prn', 'anal', 'ass', 'pen', 'vag', 'cum', 'sperm', 'erect',
    'erotic', 'erot', 'incest', 'incst', 'zoophil', 'zoophilie',

    // Abkürzungen und Silben von extremistischen/illegalen Begriffen
    'hitler', 'hitle', 'hitla', 'naz', 'nsd', 'kpd', 'terror', 'terr', 'isis',
    'alqa', 'morder', 'kill', 'kilr', 'death', 'bomb', 'gun', 'drug', 'dealer',
    'traff', 'smugg', 'pirat', 'pirate', 'hacker', 'phish', 'scam', 'spam',
    'trojan', 'virus', 'exploit', 'illegal', 'illeg', 'anarch', 'extrem', 'radik',
    'ns', 'ss', 'sa', 'reich', 'reichs', 'zion', 'jihad', 'isl', 'antisem',
    'völkisch', 'voelkisch',
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
  // Prüft das geladene Benutzerprofil auf das "isAdmin" Feld.
  return currentUserProfile && currentUserProfile.isAdmin === true;
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
const { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, updateProfile, sendEmailVerification, deleteUser, EmailAuthProvider, reauthenticateWithCredential } = window.firebaseAuth;
const { db, collection, addDoc, doc, onSnapshot, query, orderBy, deleteDoc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, where, getDocs, writeBatch, increment, limit } = window.firebaseDb;


document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("btn-back").addEventListener("click", () => showView(lastListView || 'home'));
    document.getElementById('auth-modal').style.display = 'none';
    document.getElementById('reset-confirm-modal').style.display = 'none';
    document.getElementById('verify-email-modal').style.display = 'none';
    
    // ===================================================================
    // ====== NEUE EVENT LISTENER FÜR CHAT-ANHÄNGE (22.09.2025) ======
    // ===================================================================
    const chatAttachBtn = document.getElementById('chat-attach-btn');
    const chatAttachMenu = document.getElementById('chat-attach-menu');
    const chatImageUpload = document.getElementById('chat-image-upload');

    // Öffnet/Schließt das Menü für Anhänge
   chatAttachBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Verhindert, dass der Klick das Menü sofort wieder schließt
    chatAttachMenu.classList.toggle('visible');
});
    // Klick auf "Bild senden" löst den versteckten file input aus
   document.addEventListener('click', (e) => {
    // Prüfen, ob das Menü sichtbar ist UND der Klick außerhalb des Menüs war
    if (chatAttachMenu.classList.contains('visible') && !chatAttachMenu.contains(e.target)) {
        chatAttachMenu.classList.remove('visible');
    }
});

    // Klick auf "Adresse senden" ruft die entsprechende Funktion auf
    document.getElementById('btn-send-address').addEventListener('click', () => {
        handleSendAddress();
        chatAttachMenu.hidden = true;
    });
    
    // Verarbeitet die ausgewählte Bilddatei
    chatImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleSendImage(file);
        }
        e.target.value = ''; // Input zurücksetzen, um selbe Datei erneut wählen zu können
    });
    
    // Schließt das Anhang-Menü, wenn irgendwo anders hingeklickt wird
    document.addEventListener('click', () => {
        if (!chatAttachMenu.hidden) {
            chatAttachMenu.hidden = true;
        }
    });
    // ===================================================================
    // ====== ENDE DER NEUEN EVENT LISTENER ======
    // ===================================================================

    document.getElementById('btn-back-to-chat-list').addEventListener('click', () => {
        document.querySelector('.chat-container').classList.remove('chat-active');
        if (unsubscribeMessagesListener) unsubscribeMessagesListener();
        activeChatId = null;
        document.getElementById('active-chat-panel').classList.remove('viewing-chat');
    });

    document.getElementById('chat-form').addEventListener('submit', handleSendMessage);

    const chatMenuBtn = document.getElementById('chat-menu-btn');
    const chatDetailMenu = document.getElementById('chat-detail-menu');
    document.addEventListener('click', () => chatDetailMenu.classList.remove('visible'), true);


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

    document.getElementById('btn-delete-account').addEventListener('click', handleDeleteAccount);
    document.getElementById('link-to-profile').addEventListener('click', (e) => {
        e.preventDefault();
        showView('profile');
    });
});

// --- STATE (Anwendungszustand) ---
let ads = [];
let watchlist = [];
let currentUserProfile = null;
let unsubscribeAdsListener = null;
let unsubscribeWatchlistListener = null;
let unsubscribeNotificationsListener = null;
let unsubscribeAdReportsListener = null; 
let unsubscribeUserReportsListener = null;
let unsubscribeChatsListener = null;
let unsubscribeMessagesListener = null;
let activeChatId = null; 
let editingAdId = null;
let reportingAd = { id: null, reason: null }; 
let reportingUser = { id: null, reason: null, fromChat: false, chatHistory: [] }; 
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
  reportReason: document.getElementById("view-report-reason"),
  reportDetails: document.getElementById("view-report-details"),
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

      if (name === 'new') {
        const warningBanner = document.getElementById('profile-incomplete-warning');
        const adForm = document.getElementById('ad-form');
        const formTitle = document.querySelector('#view-new h2');

        if (isProfileComplete()) {
            warningBanner.hidden = true;
            adForm.hidden = false;
        } else {
            warningBanner.hidden = false;
            adForm.hidden = true;
            formTitle.textContent = "Anzeige erstellen"; 
        }
    }

      if (name === 'nachrichten') {
      document.getElementById('active-chat-panel').classList.remove('viewing-chat');
      if (unsubscribeMessagesListener) unsubscribeMessagesListener();
      activeChatId = null;
    
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
        
        const viewCount = ad.viewCount || 0;
        const watchlistCount = ad.watchlistCount || 0;

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
          <div class="card-stats">
            <span class="stat-item" title="${viewCount} Aufrufe">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              ${viewCount}
            </span>
            <span class="stat-item" title="${watchlistCount} mal auf Beobachtungsliste">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              ${watchlistCount}
            </span>
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

   
   
    if (!isProfileComplete()) {
        showToast("Bitte vervollständige zuerst dein Profil.", true);
        showView('profile');
        return;
    }
    
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
            adData.viewCount = 0;
            adData.watchlistCount = 0;
            const newAdRef = await addDoc(collection(db, "ads"), adData);
            showToast("Anzeige erfolgreich erstellt!");
            
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

      if (e.target.matches('#btn-contact-author')) {
        const authorId = e.target.dataset.authorId;
        if (authorId) {
            startChatWithUser(authorId);
        }
    } 


     if (e.target.matches('.chat-item-menu-btn')) {
        e.stopPropagation();
        const menu = e.target.nextElementSibling;
        const isVisible = menu.classList.contains('visible');
        
        // Zuerst alle anderen offenen Menüs schließen
        document.querySelectorAll('.chat-item-menu.visible').forEach(m => m.classList.remove('visible'));

        if (!isVisible) {
            menu.classList.add('visible');
        }
    } 
    else if (e.target.closest('.btn-delete-chat')) {
        const chatId = e.target.closest('.btn-delete-chat').dataset.chatId;
        handleDeleteChat(chatId);
    }

    // ... der Rest deines Codes im Listener ...

    if (e.target.closest('.btn-block-chat-user')) {
        const button = e.target.closest('.btn-block-chat-user');
        const chatId = button.dataset.chatId;
        const currentUser = auth.currentUser;
        if (!chatId || !currentUser) return;
        const otherUserId = chatId.split('_').find(id => id !== currentUser.uid);
        if (otherUserId) {
            handleBlockUser(otherUserId);
        }
    } else if (e.target.closest('.btn-delete-chat')) {
        const chatId = e.target.closest('.btn-delete-chat').dataset.chatId;
        handleDeleteChat(chatId);
    }

 
// Stelle sicher, dass du auch einen Listener hast, der die Menüs schließt,
// wenn man irgendwo anders hinklickt.
document.addEventListener('click', (e) => {
    if (!e.target.matches('.chat-item-menu-btn')) {
        document.querySelectorAll('.chat-item-menu.visible').forEach(m => m.classList.remove('visible'));
    }
}, true); // `true` ist wichtig, damit dieser Listener vor anderen läuft.

    if (e.target.closest('.card-like-btn')) {
        const button = e.target.closest('.card-like-btn');
        const adId = button.dataset.id;
        const currentUser = auth.currentUser;
        if (!currentUser) {
            showToast("Bitte melde dich an.", true);
            openAuthModal();
            return;
        }

        button.disabled = true; // Sperre den Button
        const svg = button.querySelector('svg.card-like');
        
        const userDocRef = doc(db, "users", currentUser.uid);
        const adDocRef = doc(db, "ads", adId);
        
        try {
            if (watchlist.includes(adId)) {
                // Von Watchlist entfernen
                await updateDoc(userDocRef, { watchlist: arrayRemove(adId) });
                await updateDoc(adDocRef, { watchlistCount: increment(-1) });
                if (svg) svg.classList.remove('liked'); // UI sofort aktualisieren
                showToast("Von Beobachtungsliste entfernt");
            } else {
                // Zu Watchlist hinzufügen
                await setDoc(userDocRef, { watchlist: arrayUnion(adId) }, { merge: true });
                await updateDoc(adDocRef, { watchlistCount: increment(1) });
                if (svg) svg.classList.add('liked'); // UI sofort aktualisieren
                showToast("Zur Beobachtungsliste hinzugefügt");
            }
        } catch (error) {
            console.error("Fehler bei Watchlist-Update:", error);
            showToast("Aktion fehlgeschlagen.", true);
        } finally {
            button.disabled = false; // Gib den Button wieder frei
        }

    } else if (e.target.closest('.card-delete-btn')) {
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
    } else if (e.target.matches('#my-ads-list .my-ad-btn.reserve, #my-ads-list .my-ad-btn.unreserve')) {
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
    } else if (e.target.matches('#my-ads-list .my-ad-btn.delete')) {
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
    } else if (e.target.matches('#my-ads-list .my-ad-btn.edit')) {
        const adId = e.target.dataset.id;
        startEditAd(adId);
    } else if (e.target.matches('.btn-permanent-delete')) {
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
    } else if (e.target.matches('.btn-delete-unverified-user')) {
        if (!isUserAdmin()) return;

        const button = e.target;
        const userId = button.dataset.id;
        const username = button.dataset.username;

        const confirmed = await showConfirmModal(
            `Benutzer "${username}" löschen?`,
            "Möchtest du dieses unbestätigte Benutzerkonto wirklich aus der Datenbank entfernen?",
            "Ja, löschen"
        );

        if (confirmed) {
            try {
                // Löscht nur den Eintrag in der "users"-Collection in Firestore
                await deleteDoc(doc(db, "users", userId));
                showToast(`Benutzer "${username}" wurde gelöscht.`);
                renderUnverifiedUsers(); // Liste neu laden
            } catch (error) {
                console.error("Fehler beim Löschen des Benutzers:", error);
                showToast("Löschen fehlgeschlagen.", true);
            }
        }
    } else if (e.target.matches('.btn-approve-user')) {
        if (!isUserAdmin()) return;
        const button = e.target;
        const userId = button.dataset.id;
        const username = button.dataset.username;

        const confirmed = await showConfirmModal(
            `Benutzer "${username}" genehmigen?`,
            "Der Benutzername wird als unbedenklich markiert und verschwindet von dieser Liste.",
            "Ja, genehmigen"
        );

        if (confirmed) {
            try {
                await updateDoc(doc(db, "users", userId), {
                    reviewStatus: 'cleared'
                });
                showToast(`Benutzername "${username}" wurde genehmigt.`);
                renderPendingReviewUsers(); // Liste neu laden
            } catch (error) {
                console.error("Fehler beim Genehmigen:", error);
                showToast("Aktion fehlgeschlagen.", true);
            }
        }
    } else if (e.target.matches('.btn-block-user')) {
        if (!isUserAdmin()) return;
        const button = e.target;
        const userId = button.dataset.id;
        const username = button.dataset.username;
        // Wir können hier einfach die existierende Funktion zum Sperren aufrufen!
        await deactivateUserAccount(userId, username);
        // Nach der Sperrung die Liste neu laden, falls der User noch 'pending' war
        renderPendingReviewUsers();
    }
});


// --- Image Upload & Drag & Drop ---
const galleryInput = document.getElementById("f-images");
const cameraInput = document.getElementById("f-images-camera");
const preview = document.getElementById("preview-container");

document.getElementById("btn-pick-gallery").onclick = () => galleryInput.click();
document.getElementById("btn-pick-camera").onclick = () => cameraInput.click();

function addImages(files) {
    const previewContainer = document.getElementById("preview-container");
    const hint = document.getElementById('image-upload-hint');
    const currentImageCount = previewContainer.querySelectorAll('.preview-item').length;

    hint.hidden = true;

    if (currentImageCount >= MAX_IMAGES) {
        hint.textContent = `Das Maximum von ${MAX_IMAGES} Bildern ist bereits erreicht.`;
        hint.hidden = false;
        showToast(`Du kannst maximal ${MAX_IMAGES} Bilder hochladen.`, true);
        return;
    }

    if (previewContainer.querySelector('.drop-hint')) {
        previewContainer.innerHTML = '';
    }

    const filesToAdd = Array.from(files).slice(0, MAX_IMAGES - currentImageCount);

    if (filesToAdd.length < files.length) {
        hint.textContent = `Limit von ${MAX_IMAGES} Bildern erreicht. Einige Bilder wurden nicht hinzugefügt.`;
        hint.hidden = false;
        showToast(`Es konnten nur ${filesToAdd.length} von ${files.length} Bildern hinzugefügt werden.`, true);
    }

    filesToAdd.forEach(async (file) => {
        // Temporären Platzhalter für das hochladende Bild erstellen
        const placeholderId = `placeholder-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const placeholderItem = document.createElement("div");
        placeholderItem.className = "preview-item";
        placeholderItem.id = placeholderId;
        placeholderItem.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:0.9em;color:var(--muted);">Wird geladen...</div>`;
        previewContainer.appendChild(placeholderItem);

        // Bild zu Cloudinary hochladen
        const imageUrl = await uploadImageToCloudinary(file);
        
        const finalItem = document.getElementById(placeholderId);

        if (imageUrl && finalItem) {
            // Wenn der Upload erfolgreich war, ersetze den Platzhalter durch das Bild
            finalItem.draggable = true;
            finalItem.innerHTML = `<img src="${imageUrl}" alt="Vorschaubild"><button type="button" class="remove-btn" aria-label="Bild entfernen">&times;</button>`;
            finalItem.querySelector('.remove-btn').onclick = () => finalItem.remove();
        } else if (finalItem) {
            // Wenn der Upload fehlschlug, entferne den Platzhalter
            finalItem.remove();
            showToast("Ein Bild konnte nicht hochgeladen werden.", true);
        }
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


// in app.js

onAuthStateChanged(auth, user => {
    // Listener zurücksetzen (unverändert)
    if (unsubscribeWatchlistListener) unsubscribeWatchlistListener();
    if (unsubscribeNotificationsListener) unsubscribeNotificationsListener();
    if (unsubscribeAdReportsListener) unsubscribeAdReportsListener();
    if (unsubscribeUserReportsListener) unsubscribeUserReportsListener();
    if (unsubscribeChatsListener) unsubscribeChatsListener();
    if (unsubscribeMessagesListener) unsubscribeMessagesListener();

    // Hole UI-Elemente
    const authElements = document.querySelectorAll('[data-requires-auth]');
    const userProfileNav = document.getElementById('user-profile-nav');
    const userStatusText = document.getElementById('user-status-text');
    const navAvatar = document.getElementById('nav-avatar');

    // Setzt alles standardmäßig auf "ausgeblendet"
    authElements.forEach(el => el.hidden = true);
    // WICHTIG: Admin-Elemente werden jetzt in listenToUserProfile gesteuert
    document.querySelectorAll('[data-admin-only]').forEach(el => el.hidden = true);

    if (user && user.emailVerified) {
        // Zustand für ANGEMELDETE & VERIFIZIERTE Benutzer
        userProfileNav.style.display = 'flex';
        userStatusText.textContent = user.displayName || user.email;
        authBtn.textContent = 'Abmelden';
        authBtn.classList.add('logout');
        authElements.forEach(el => el.hidden = false);

        // Starte die Listener. Die UI für Admins wird im Profil-Listener aktualisiert.
        listenToUserProfile(user.uid);
        listenToNotifications(user.uid);
        listenToUserChats(user.uid);

    } else {
        // Zustand für ABGEMELDETE oder NICHT VERIFIZIERTE Benutzer
        userProfileNav.style.display = 'none';
        currentUserProfile = null;
        userStatusText.textContent = '';
        navAvatar.src = '';
        authBtn.textContent = 'Anmelden';
        authBtn.classList.remove('logout');
        watchlist = [];
        
        document.getElementById('notification-bell-container').hidden = true;
        document.getElementById('notifications-panel').hidden = true;
        document.getElementById('notifications-list').innerHTML = '';
        const counter = document.getElementById('notification-counter');
        counter.hidden = true;
        counter.textContent = '0';
        
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
    if (usernameTrimmed.length < 3 || usernameTrimmed.length > 20) {
        return { isValid: false, message: "Benutzername muss 3-20 Zeichen lang sein." };
    }
    const allowedCharsRegex = /^[a-zA-Z0-9_.]+$/;
    if (!allowedCharsRegex.test(usernameTrimmed)) {
        return { isValid: false, message: "Nur Buchstaben, Zahlen, '_' und '.' erlaubt." };
    }
    if (FORBIDDEN_USERNAMES.includes(usernameTrimmed.toLowerCase())) {
        return { isValid: false, message: "Dieser Benutzername ist nicht erlaubt." };
    }
    try {
        const q = query(collection(db, "users"), where("username_lowercase", "==", usernameTrimmed.toLowerCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            let isTaken = true;
            if (currentUserId) {
                querySnapshot.forEach(doc => {
                    if (doc.id === currentUserId) isTaken = false;
                });
            }
             if (isTaken) return { isValid: false, message: "Benutzername ist bereits vergeben." };
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

    const normalizedUsername = username.toLowerCase();
    const needsReview = SUSPICIOUS_USERNAME_WORDS.some(word => normalizedUsername.includes(word));
    const reviewStatus = needsReview ? 'pending' : 'cleared';

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            return updateProfile(userCredential.user, {
                    displayName: username
                })
                .then(() => sendEmailVerification(userCredential.user))
                .then(() => {
                    return setDoc(doc(db, "users", userCredential.user.uid), {
                        username: username,
                        username_lowercase: username.toLowerCase(),
                        email: email,
                        createdAt: serverTimestamp(),
                        isVerified: false,
                        watchlist: [],
                        firstName: "",
                        lastName: "",
                        address: "",
                        usernameLastChanged: null,
                        usernameChangeCount: 0,
                        avatarColor: null,
                        avatarUrl: '',
                        following: [],
                        followers: [],
                        reviewStatus: reviewStatus // NEUES FELD
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

  const adminUserSearchForm = document.getElementById('admin-user-search-form');
  adminUserSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = document.getElementById('admin-user-search-input');
      const searchTerm = searchInput.value.trim();
      if (!searchTerm) return;
      handleAdminUserSearch(searchTerm);
  });

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
  }   );

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
  setupPasswordToggle('reauth-password', 'toggle-reauth-password');

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

    const bellBtn = document.getElementById('notification-bell-btn');
    const notifPanel = document.getElementById('notifications-panel');

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPanel.hidden = !notifPanel.hidden;
    });

    document.addEventListener('click', (e) => {
        if (!notifPanel.hidden && !notifPanel.contains(e.target) && !bellBtn.contains(e.target)) {
            notifPanel.hidden = true;
        }
    });

    document.getElementById('btn-back-from-report-reason').addEventListener('click', () => {
        if (reportingAd && reportingAd.id) {
            renderDetail(reportingAd.id);
        } else if (reportingUser && reportingUser.id) {
            // Wenn aus einem Chat gemeldet wurde, zurück zum Chat
            if (reportingUser.fromChat && activeChatId) {
                showView('nachrichten');
                openChat(activeChatId);
            } else {
                 renderPublicProfileView(reportingUser.id);
            }
        } else {
            showView(lastListView || 'home');
        }
    });
    
    document.getElementById('btn-back-from-report-details').addEventListener('click', () => {
        showView('reportReason');
    });

    const cancelReportFlow = () => {
        const adToReturnTo = reportingAd.id;
        const userToReturnTo = reportingUser.id;
        
        const wasFromChat = reportingUser.fromChat;

        reportingAd = { id: null, reason: null };
        reportingUser = { id: null, reason: null, fromChat: false, chatHistory: [] };

        if (adToReturnTo) {
            renderDetail(adToReturnTo);
        } else if (wasFromChat && activeChatId) {
             showView('nachrichten');
             openChat(activeChatId);
        } else if (userToReturnTo) {
            renderPublicProfileView(userToReturnTo);
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

// in app.js

function listenToUserProfile(uid) {
    if (unsubscribeWatchlistListener) unsubscribeWatchlistListener();

    unsubscribeWatchlistListener = onSnapshot(doc(db, "users", uid), (doc) => {
        if (doc.exists()) {
            currentUserProfile = doc.data(); // Profildaten sind jetzt hier verfügbar
            watchlist = currentUserProfile.watchlist || [];

            // --- NEUE LOGIK START ---
            // Jetzt, wo wir das Profil haben, prüfen wir, ob der User Admin ist.
            const adminElements = document.querySelectorAll('[data-admin-only]');
            if (isUserAdmin()) {
                // Wenn ja, zeige die Admin-Elemente an...
                adminElements.forEach(el => el.hidden = false);
                // ...und starte die Listener, die nur für Admins sind.
                listenToAdReports();
                listenToUserReports();
            } else {
                // Sonst stelle sicher, dass sie ausgeblendet sind.
                adminElements.forEach(el => el.hidden = true);
            }
            // --- NEUE LOGIK ENDE ---

            const user = auth.currentUser;
            if (user && user.emailVerified && !currentUserProfile.isVerified) {
                updateDoc(doc.ref, { isVerified: true }).catch(err => {
                    console.error("Konnte isVerified-Status nicht aktualisieren:", err);
                });
            }
        } else {
            currentUserProfile = {};
            watchlist = [];
        }

        // Der Rest der Funktion bleibt gleich...
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
        if (!views.new.hidden) {
            showView('new');
        }
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

    document.getElementById('p-email').value = user.email || '';
    document.getElementById('p-username').value = user.displayName || '';
    document.getElementById('p-firstname').value = currentUserProfile.firstName || '';
    document.getElementById('p-lastname').value = currentUserProfile.lastName || '';
    document.getElementById('p-street').value = currentUserProfile.street || '';
    document.getElementById('p-zip').value = currentUserProfile.zip || '';
    document.getElementById('p-city').value = currentUserProfile.city || '';

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
async function renderStatsView() {
    const adminContainer = document.querySelector('.admin-container');
    const noAdminHint = document.getElementById('stats-no-admin-hint');

    if (!isUserAdmin()) {
        adminContainer.hidden = true;
        noAdminHint.hidden = false;
        return;
    }

    adminContainer.hidden = false;
    noAdminHint.hidden = true;

    const activeAdsCount = ads.filter(ad => ad.status === 'active').length;
    const totalAdsCount = ads.length;

    document.getElementById('stats-active-ads').textContent = activeAdsCount;
    document.getElementById('stats-total-ads').textContent = totalAdsCount;
    document.getElementById('stats-total-users').textContent = '...'; 

    try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const totalUsersCount = userSnapshot.size;
        document.getElementById('stats-total-users').textContent = totalUsersCount;
    } catch (error) {
        console.error("Fehler beim Zählen der Benutzer:", error);
        document.getElementById('stats-total-users').textContent = 'Fehler';
    }

    renderOpenUserReports(); 
    renderOpenAdReports();
    renderUnverifiedUsers();
    renderPendingReviewUsers(); // NEUER AUFRUF

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

// --- FOLGEN/ENTFOLGEN FUNKTION ---
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
        if (isCurrentlyFollowing) {
            const confirmed = await showConfirmModal(
                "Wirklich entfolgen?",
                "Bist du sicher, dass du diesem Nutzer nicht mehr folgen möchtest?",
                "Ja, entfolgen"
            );
            if (!confirmed) {
                if (followButton) followButton.disabled = false;
                return;
            }
        }

        const batch = writeBatch(db);

        if (isCurrentlyFollowing) {
            batch.update(currentUserRef, { following: arrayRemove(targetUserId) });
            batch.update(targetUserRef, { followers: arrayRemove(currentUser.uid) });
        } else {
            batch.set(currentUserRef, { following: arrayUnion(targetUserId) }, { merge: true });
            batch.set(targetUserRef, { followers: arrayUnion(currentUser.uid) }, { merge: true });
        }

        await batch.commit();

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
        showToast("Aktion fehlgeschlagen.", true);
    } finally {
        if (followButton) followButton.disabled = false;
    }
}

// --- HILFSFUNKTION (kann am Anfang der Datei platziert werden) ---
/**
 * Formatiert ein Firestore-Timestamp-Objekt in "Monat Jahr".
 * @param {object} timestamp - Das Timestamp-Objekt von Firestore.
 * @returns {string} Das formatierte Datum, z.B. "September 2025".
 */
function formatMemberSince(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Unbekannt';
    const date = timestamp.toDate();
    return date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric'
    });
}

// app.js

// --- HILFSFUNKTION (kann am Anfang der Datei platziert werden) ---
/**
 * Formatiert ein Firestore-Timestamp-Objekt in "Monat Jahr".
 * @param {object} timestamp - Das Timestamp-Objekt von Firestore.
 * @returns {string} Das formatierte Datum, z.B. "September 2025".
 */
function formatMemberSince(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Unbekannt';
    const date = timestamp.toDate();
    return date.toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric'
    });
}


// --- AKTUALISIERTE RENDER-FUNKTION ---
async function renderPublicProfileView(userId, fromAdId = null, authorName = null) {
    const userProfile = await getAuthorProfile(userId);

    if (!userProfile) {
        showToast("Nutzerprofil konnte nicht geladen werden.", true);
        return;
    }

    const userAds = ads.filter(ad => ad.authorId === userId && ad.status === 'active');

    const avatarEl = document.getElementById('public-profile-avatar');
    const usernameEl = document.getElementById('public-profile-username');
    const adCountEl = document.getElementById('public-profile-ad-count');
    const statsEl = document.getElementById('public-profile-stats'); // <- Das neue Element aus index.html
    const adsListEl = document.getElementById('public-profile-ads-list');
    const noAdsHint = document.getElementById('public-profile-no-ads');
    const backButton = document.getElementById('btn-back-from-profile');
    const followContainer = document.getElementById('follow-button-container');
    const menuContainer = document.getElementById('public-profile-menu-container');

    followContainer.innerHTML = '';
    menuContainer.innerHTML = '';
    statsEl.innerHTML = ''; // <- Den Statistik-Container leeren

    const username = authorName || userProfile.username || 'Unbekannter Nutzer';
    avatarEl.src = userProfile.avatarUrl ?
        userProfile.avatarUrl.replace('/upload/', '/upload/w_160,h_160,c_fill,g_face,r_max/') :
        createInitialAvatar(username, userProfile.avatarColor);
    usernameEl.textContent = username;
    adCountEl.textContent = `${userAds.length} ${userAds.length === 1 ? 'Anzeige' : 'Anzeigen'} online`;

    // --- NEU: Follower-Daten und "Aktiv seit" hinzufügen ---
    const followerCount = userProfile.followers?.length || 0;
    const followingCount = userProfile.following?.length || 0;
    const memberSince = formatMemberSince(userProfile.createdAt);

    statsEl.innerHTML = `
        <span><b>${followerCount}</b> Follower</span>
        <span><b>${followingCount}</b> Gefolgt</span>
        <span>Aktiv seit: <b>${memberSince}</b></span>
        <span>Zufriedenheit: <b>kommt bald</b></span>
    `;
    // --- ENDE DER NEUEN ÄNDERUNGEN ---


    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid !== userId) {
        const isFollowing = currentUserProfile?.following?.includes(userId);
        const followButton = document.createElement('button');
        followButton.id = 'follow-btn';
        followButton.className = 'button follow-btn';
        followButton.textContent = isFollowing ? 'Gefolgt' : 'Folgen';
        if (isFollowing) followButton.classList.add('following');
        followButton.addEventListener('click', () => toggleFollowUser(userId));
        followContainer.appendChild(followButton);
    }

    const menuHtml = `
      <button class="menu-toggle-btn" aria-label="Weitere Optionen">
   </button>
        <div class="detail-menu">
            <button class="detail-menu-item" id="profile-share-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                <span>Teilen</span>
            </button>
            <button class="detail-menu-item danger" id="profile-report-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <span>Melden</span>
            </button>
        </div>`;
    menuContainer.innerHTML = menuHtml;

    const menuToggle = menuContainer.querySelector('.menu-toggle-btn');
    const detailMenu = menuContainer.querySelector('.detail-menu');
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        detailMenu.classList.toggle('visible');
    });
    document.addEventListener('click', () => detailMenu.classList.remove('visible'), true);

    menuContainer.querySelector('#profile-share-btn').addEventListener('click', () => openShareModal(null, userId));
    menuContainer.querySelector('#profile-report-btn').addEventListener('click', () => startUserReportProcess(userId));


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

    backButton.onclick = fromAdId ? () => renderDetail(fromAdId) : () => showView(lastListView || 'home');
    showView('publicProfile');
    window.scrollTo(0, 0);
}

/**
 * Überprüft, ob die wesentlichen Profilfelder ausgefüllt sind.
 * @returns {boolean} True, wenn das Profil vollständig ist, sonst false.
 */
function isProfileComplete() {
    if (!currentUserProfile) return false;
    const { firstName, lastName, street, zip, city } = currentUserProfile;
    // Prüft, ob alle erforderlichen Felder einen nicht-leeren String enthalten
    return !!(firstName && lastName && street && zip && city);
}

// --- DETAIL-ANSICHT ---
async function renderDetail(adId) {
    const ad = ads.find(a => a.id === adId);
    if (!ad) {
        showToast("Anzeige nicht gefunden.", true);
        showView(lastListView || 'home');
        return;
    }
    
    // NEU: Logik zum Hochzählen der Aufrufe
    const viewedInSession = sessionStorage.getItem(adId);
    if (!viewedInSession) {
        try {
            const adRef = doc(db, "ads", adId);
            await updateDoc(adRef, { viewCount: increment(1) });
            sessionStorage.setItem(adId, 'true');
        } catch (error) {
            console.error("Fehler beim Hochzählen der Aufrufe:", error);
            // Kein Toast, um den Nutzer nicht zu stören
        }
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

    const liked = watchlist.includes(ad.id);
    const likeButtonClass = liked ? 'card-like liked' : 'card-like';
    const likeButtonTitle = liked ? 'Von Beobachtungsliste entfernen' : 'Zur Beobachtungsliste hinzufügen';

    const menuHtml = `
        <div class="detail-header-actions">
            <button class="card-like-btn" data-id="${ad.id}" title="${likeButtonTitle}">
                <svg class="${likeButtonClass}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
         <button class="menu-toggle-btn" aria-label="Weitere Optionen">
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

            <div class="detail-meta" style="margin-bottom: 20px; font-size: 0.95em; color: var(--muted);">
                <p style="margin: -3px 0;"><strong>Erstellt am:</strong> ${formatDate(ad.createdAt)}</p>
                <p style="margin: -3px 0;"><strong>Kategorie:</strong> ${ad.category}</p>
                <p style="margin: -3px 0;"><strong>Ort:</strong> ${ad.location}</p>
                ${ad.size ? `<p style="margin: -3px 0;"><strong>Dauer/Fläche:</strong> ${ad.size}</p>` : ''}
                <p style="margin: -3px 0;"><strong>Geräte gestellt:</strong> ${ad.tools}</p>
            </div>
            <p class="detail-desc">${ad.desc.replace(/\n/g, '<br>')}</p>
            <div class="detail-footer">
                <span class="detail-payment">${paymentText}</span>
                ${ad.displayId ? `<span class="detail-ad-id">ID: ${ad.displayId}</span>` : ''}
            </div>
            <div class="detail-actions">
                 <button id="btn-contact-author" class="button" data-author-id="${ad.authorId}">Nachricht senden</button>

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
                 const confirmed = await showConfirmModal("Endgültig löschen?", "Diese Aktion kann nicht rückgängig gemacht werden!", "Ja, endgültig löschen");
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
    detailCard.querySelector('#detail-report-btn').addEventListener('click', () => startAdReportProcess(ad.id));


    showView("detail");
    window.scrollTo(0, 0);
}


// --- BENACHRICHTIGUNGS-FUNKTIONEN ---
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

function listenToNotifications(uid) {
    if (unsubscribeNotificationsListener) unsubscribeNotificationsListener();

    const q = query(collection(db, "notifications"), where("recipientId", "==", uid), orderBy("createdAt", "desc"));

    unsubscribeNotificationsListener = onSnapshot(q, (snapshot) => {
        const notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        renderNotifications(notifications);
    }, (error) => console.error("Fehler beim Lauschen auf Benachrichtigungen:", error));
}

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
            <div class="notification-avatar"><img src="${avatarSrc}" alt="Avatar"></div>
            <div class="notification-content">
                <p><strong>${notif.fromUserName}</strong> hat eine neue Anzeige erstellt: "${notif.adTitle}"</p>
                <span>${formatDate(notif.createdAt)}</span>
            </div>`;
        item.addEventListener('click', async () => {
            document.getElementById('notifications-panel').hidden = true;
            renderDetail(notif.adId);
            try {
                await updateDoc(doc(db, "notifications", notif.id), { isRead: true });
            } catch (error) {
                console.error("Konnte Benachrichtigung nicht als gelesen markieren:", error);
            }
        });
        list.appendChild(item);
    });
}

// --- SHARE MODAL LOGIC ---
const shareModal = document.getElementById('share-modal');
const closeShareModalBtn = document.getElementById('close-share-modal-btn');

async function openShareModal(adId = null, userId = null) {
    let shareLink, shareText, title;

    if (adId) {
        const ad = ads.find(a => a.id === adId);
        if (!ad) return;
        shareLink = `${window.location.origin}${window.location.pathname}#detail=${adId}`;
        shareText = `Schau dir diese Anzeige an: ${ad.title}`;
        title = ad.title;
        document.getElementById('share-modal-title').textContent = 'Anzeige teilen';
    } else if (userId) {
        const user = await getAuthorProfile(userId);
        if (!user) return;
        shareLink = `${window.location.origin}${window.location.pathname}#profile=${userId}`;
        shareText = `Schau dir das Profil von ${user.username} an.`;
        title = `Profil von ${user.username}`;
        document.getElementById('share-modal-title').textContent = 'Profil teilen';
    } else {
        return;
    }
    
    document.getElementById('share-link-input').value = shareLink;
    document.getElementById('share-whatsapp').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + "\n" + shareLink)}`;
    document.getElementById('share-email').href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + "\n\n" + shareLink)}`;

    shareModal.style.display = 'flex';
}
closeShareModalBtn.onclick = () => shareModal.style.display = 'none';
shareModal.onclick = (e) => { if (e.target === shareModal) shareModal.style.display = 'none'; };
document.getElementById('copy-share-link-btn').onclick = () => {
    const input = document.getElementById('share-link-input');
    input.select();
    navigator.clipboard.writeText(input.value).then(() => showToast("Link kopiert!")).catch(() => showToast("Kopieren fehlgeschlagen.", true));
};

// --- HILFSFUNKTION FÜR CHATVERLAUF ---
async function getChatHistory(chatId, messageLimit = 10) {
    const messages = [];
    try {
        const messagesQuery = query(
            collection(db, "chats", chatId, "messages"),
            orderBy("timestamp", "desc"),
            limit(messageLimit)
        );
        const snapshot = await getDocs(messagesQuery);
        snapshot.forEach(doc => {
            const data = doc.data();
            messages.push({
                text: data.text,
                senderId: data.senderId,
                timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString()
            });
        });
        return messages.reverse(); // Älteste Nachricht zuerst
    } catch (error) {
        console.error("Fehler beim Abrufen des Chatverlaufs:", error);
        return [];
    }
}

// --- REPORTING LOGIC ---
function startAdReportProcess(adId) {
    if (!auth.currentUser) { showToast("Du musst angemeldet sein.", true); openAuthModal(); return; }
    reportingAd = { id: adId, reason: null };
    reportingUser = { id: null, reason: null, fromChat: false, chatHistory: [] };
    document.getElementById('report-reason-form').reset();
    document.getElementById('report-reason-title').textContent = 'Anzeige melden';
    document.getElementById('report-chat-warning').hidden = true;
    
    document.getElementById('report-reasons-ad').classList.remove('report-group-hidden');
    document.getElementById('report-reasons-user').classList.add('report-group-hidden');
    
    document.querySelectorAll('#report-reasons-ad input[type="radio"]').forEach(input => input.required = true);
    document.querySelectorAll('#report-reasons-user input[type="radio"]').forEach(input => input.required = false);

    showView('reportReason');
}

async function startUserReportProcess(userId, fromChat = false) {
    if (!auth.currentUser) { showToast("Du musst angemeldet sein.", true); openAuthModal(); return; }
    
    let chatHistory = [];
    if (fromChat && activeChatId) {
        chatHistory = await getChatHistory(activeChatId, 10);
    }

    reportingUser = { id: userId, reason: null, fromChat, chatHistory };
    reportingAd = { id: null, reason: null };
    document.getElementById('report-reason-form').reset();
    document.getElementById('report-reason-title').textContent = 'Benutzer melden';
    document.getElementById('report-chat-warning').hidden = !fromChat;

    document.getElementById('report-reasons-ad').classList.add('report-group-hidden');
    document.getElementById('report-reasons-user').classList.remove('report-group-hidden');

    document.querySelectorAll('#report-reasons-user input[type="radio"]').forEach(input => input.required = true);
    document.querySelectorAll('#report-reasons-ad input[type="radio"]').forEach(input => input.required = false);

    showView('reportReason');
}

document.getElementById('report-reason-form').addEventListener('submit', (e) => {
    e.preventDefault();
    let selectedReason;
    if (reportingAd.id) {
        selectedReason = new FormData(e.target).get('report-reason');
        reportingAd.reason = selectedReason;
    } else if (reportingUser.id) {
        selectedReason = new FormData(e.target).get('report-reason-user');
        reportingUser.reason = selectedReason;
    }
    
    if (selectedReason) {
        document.getElementById('report-details-form').reset();
        showView('reportDetails');
    }
});

document.getElementById('report-details-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    const description = document.getElementById('report-description').value.trim();

    if (reportingAd.id && reportingAd.reason) {
        const reportData = { adId: reportingAd.id, reason: reportingAd.reason, description, reporterId: currentUser.uid, status: 'open', createdAt: serverTimestamp() };
        try {
            await addDoc(collection(db, "reports"), reportData);
            showToast("Vielen Dank, deine Meldung wurde übermittelt.");
            showView('home');
        } catch (error) { console.error("Fehler beim Senden der Anzeigen-Meldung:", error); showToast("Meldung konnte nicht gesendet werden.", true); }
    } else if (reportingUser.id && reportingUser.reason) {
        const reportData = { 
            reportedUserId: reportingUser.id, 
            reason: reportingUser.reason, 
            description, 
            reporterId: currentUser.uid, 
            status: 'open', 
            createdAt: serverTimestamp(),
            chatHistory: reportingUser.chatHistory || []
        };
        try {
            await addDoc(collection(db, "user_reports"), reportData);
            showToast("Vielen Dank, deine Meldung wurde übermittelt.");
            if (reportingUser.fromChat && activeChatId) {
                showView('nachrichten');
                openChat(activeChatId);
            } else {
                showView('home');
            }
        } catch (error) { console.error("Fehler beim Senden der Benutzer-Meldung:", error); showToast("Meldung konnte nicht gesendet werden.", true); }
    }
    
    reportingAd = { id: null, reason: null };
    reportingUser = { id: null, reason: null, fromChat: false, chatHistory: [] };
});


// --- ADMIN REPORTING LOGIC ---
let openAdReports = [];
let openUserReports = [];

function listenToAdReports() {
    if (!isUserAdmin() || unsubscribeAdReportsListener) return;
    const q = query(collection(db, "reports"), where("status", "==", "open"), orderBy("createdAt", "desc"));
    unsubscribeAdReportsListener = onSnapshot(q, (snapshot) => {
        openAdReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!views.stats.hidden) renderOpenAdReports();
    });
}

function listenToUserReports() {
    if (!isUserAdmin() || unsubscribeUserReportsListener) return;
    const q = query(collection(db, "user_reports"), where("status", "==", "open"), orderBy("createdAt", "desc"));
    unsubscribeUserReportsListener = onSnapshot(q, (snapshot) => {
        openUserReports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (!views.stats.hidden) renderOpenUserReports();
    });
}

function renderOpenAdReports() {
    if (!isUserAdmin()) return;
    const list = document.getElementById('reported-ads-list');
    const empty = document.getElementById('reported-ads-empty');
    list.innerHTML = '';
    empty.hidden = openAdReports.length > 0;
    openAdReports.forEach(report => {
        const ad = ads.find(a => a.id === report.adId);
        if (!ad) return;
        const item = document.createElement('div');
        item.className = 'reported-ad-item';
        item.innerHTML = `<div class="reported-ad-info"><span class="title">${ad.title} (${ad.displayId})</span><span class="reason">Grund: ${report.reason}</span></div><span class="badge">Neu</span>`;
        item.onclick = () => openAdminAdReportModal(report);
        list.appendChild(item);
    });
}

async function renderOpenUserReports() {
    if (!isUserAdmin()) return;
    const list = document.getElementById('reported-users-list');
    const empty = document.getElementById('reported-users-empty');
    list.innerHTML = '';
    empty.hidden = openUserReports.length > 0;

    for (const report of openUserReports) {
        const user = await getAuthorProfile(report.reportedUserId);
        if (!user) continue;
        const item = document.createElement('div');
        item.className = 'reported-user-item';
        item.innerHTML = `<div class="reported-user-info"><span class="title">${user.username}</span><span class="reason">Grund: ${report.reason}</span></div><span class="badge">Neu</span>`;
        item.onclick = () => openAdminUserReportModal(report);
        list.appendChild(item);
    }
}


const adminReportModal = document.getElementById('admin-report-modal');
const closeAdminReportModalBtn = document.getElementById('close-admin-report-modal-btn');
let currentAdReport = null;

function openAdminAdReportModal(report) {
    currentAdReport = report;
    const ad = ads.find(a => a.id === report.adId);
    if (!ad) { showToast("Zugehörige Anzeige nicht gefunden.", true); return; }
    document.getElementById('admin-report-ad-title').textContent = ad.title;
    document.getElementById('admin-report-reason').textContent = report.reason;
    document.getElementById('admin-report-description').textContent = report.description || 'Keine Beschreibung.';
    document.getElementById('admin-view-ad-btn').onclick = () => { adminReportModal.style.display = 'none'; currentAdReport = null; renderDetail(ad.id); };
    adminReportModal.style.display = 'flex';
}
closeAdminReportModalBtn.onclick = () => { adminReportModal.style.display = 'none'; currentAdReport = null; };
adminReportModal.onclick = (e) => { if (e.target === adminReportModal) { adminReportModal.style.display = 'none'; currentAdReport = null; } };

document.getElementById('admin-delete-ad-btn').onclick = async () => {
    if (!currentAdReport) return;
    const confirmed = await showConfirmModal("Anzeige löschen & Meldung schließen?", "Die Anzeige wird deaktiviert und die Meldung als erledigt markiert.", "Ja, löschen");
    if (confirmed) {
        try {
            const batch = writeBatch(db);
            batch.update(doc(db, "ads", currentAdReport.adId), { status: 'deleted', updatedAt: serverTimestamp() });
            batch.update(doc(db, "reports", currentAdReport.id), { status: 'resolved_deleted' });
            await batch.commit();
            showToast("Anzeige gelöscht und Meldung geschlossen.");
        } catch (error) { showToast("Aktion fehlgeschlagen.", true); } finally { adminReportModal.style.display = 'none'; }
    }
};
document.getElementById('admin-dismiss-report-btn').onclick = async () => {
    if (!currentAdReport) return;
    try {
        await updateDoc(doc(db, "reports", currentAdReport.id), { status: 'resolved_dismissed' });
        showToast("Meldung als erledigt markiert.");
    } catch (error) { showToast("Aktion fehlgeschlagen.", true); } finally { adminReportModal.style.display = 'none'; }
};

// --- ADMIN USER REPORT MODAL LOGIK ---
const adminUserReportModal = document.getElementById('admin-user-report-modal');
const closeAdminUserReportModalBtn = document.getElementById('close-admin-user-report-modal-btn');
let currentUserReport = null;

async function openAdminUserReportModal(report) {
    currentUserReport = report;
    const user = await getAuthorProfile(report.reportedUserId);
    const reporter = await getAuthorProfile(report.reporterId);
    if (!user) { 
        showToast("Gemeldeter Benutzer nicht gefunden.", true); 
        return; 
    }

    const userNameLink = document.getElementById('admin-report-user-name-link');
    userNameLink.textContent = user.username || 'Unbekannter Nutzer';
    userNameLink.onclick = (e) => {
        e.preventDefault();
        adminUserReportModal.style.display = 'none';
        currentUserReport = null;
        renderPublicProfileView(report.reportedUserId, null, user.username);
    };

    document.getElementById('admin-report-user-email').textContent = user.email || 'Nicht hinterlegt';
    document.getElementById('admin-report-user-reason').textContent = report.reason;
    document.getElementById('admin-report-user-description').textContent = report.description || 'Keine Beschreibung.';
    
    document.getElementById('admin-deactivate-user-btn').onclick = () => deactivateUserAccount(report.reportedUserId, user.username);
    
    // Chatverlauf rendern
    const chatHistoryContainer = document.getElementById('admin-report-chat-history-container');
    const chatHistoryList = document.getElementById('admin-report-chat-history');
    chatHistoryList.innerHTML = '';
    if (report.chatHistory && report.chatHistory.length > 0) {
        chatHistoryContainer.hidden = false;
        report.chatHistory.forEach(msg => {
            const isReportedUser = msg.senderId === report.reportedUserId;
            const senderName = isReportedUser ? user.username : reporter.username;
            const bubble = document.createElement('div');
            bubble.className = 'chat-history-bubble';
            bubble.classList.add(isReportedUser ? 'reported' : 'reporter');
            bubble.innerHTML = `<strong>${senderName}:</strong> ${msg.text}`;
            chatHistoryList.appendChild(bubble);
        });
    } else {
        chatHistoryContainer.hidden = true;
    }

    adminUserReportModal.style.display = 'flex';
}
closeAdminUserReportModalBtn.onclick = () => { adminUserReportModal.style.display = 'none'; currentUserReport = null; };
adminUserReportModal.onclick = (e) => { if (e.target === adminUserReportModal) { adminUserReportModal.style.display = 'none'; currentUserReport = null; } };

document.getElementById('admin-dismiss-user-report-btn').onclick = async () => {
    if (!currentUserReport) return;
    try {
        await updateDoc(doc(db, "user_reports", currentUserReport.id), { status: 'resolved_dismissed' });
        showToast("Meldung als erledigt markiert.");
    } catch (error) { showToast("Aktion fehlgeschlagen.", true); } finally { adminUserReportModal.style.display = 'none'; }
};

// FUNKTION ZUM SPERREN VON KONTEN
async function deactivateUserAccount(userId, username) {
    if (!isUserAdmin()) return;

    const confirmed = await showConfirmModal(
        `Konto von "${username}" sperren?`,
        `Hiermit wird das Konto im System als "gesperrt" markiert. Du musst den Nutzer zusätzlich manuell in der Firebase Authentication Konsole deaktivieren, um den Login zu verhindern.`,
        "Ja, Konto sperren"
    );

    if (confirmed) {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                accountStatus: 'deactivated',
                deactivatedAt: serverTimestamp()
            });
            showToast(`Konto von "${username}" wurde als gesperrt markiert.`);
            
            if (currentUserReport && currentUserReport.reportedUserId === userId) {
                await updateDoc(doc(db, "user_reports", currentUserReport.id), { status: 'resolved_deactivated' });
            }
            
            adminUserReportModal.style.display = 'none';

        } catch (error) {
            console.error("Fehler beim Deaktivieren des Kontos:", error);
            showToast("Konto konnte nicht gesperrt werden.", true);
        }
    }
}

async function handleAdminUserSearch(username) {
    const resultsContainer = document.getElementById('admin-user-search-results');
    const emptyHint = document.getElementById('admin-user-search-empty');
    resultsContainer.innerHTML = 'Suche...';
    emptyHint.hidden = true;

    try {
        const q = query(collection(db, "users"), where("username_lowercase", "==", username.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            resultsContainer.innerHTML = '';
            emptyHint.hidden = false;
            return;
        }

        resultsContainer.innerHTML = '';
        querySnapshot.forEach(doc => {
            const user = { id: doc.id, ...doc.data() };
            const item = document.createElement('div');
            item.className = 'admin-user-result-item';

            item.innerHTML = `
                <div class="info">
                    <span class="username">${user.username}</span>
                    <span class="email">${user.email}</span>
                </div>
                <button class="button small danger">Konto sperren</button>
            `;

            item.querySelector('.username').addEventListener('click', () => {
                renderPublicProfileView(user.id, null, user.username);
            });

            item.querySelector('button').addEventListener('click', () => {
                deactivateUserAccount(user.id, user.username);
            });

            resultsContainer.appendChild(item);
        });

    } catch (error) {
        console.error("Fehler bei der Benutzersuche:", error);
        showToast("Benutzersuche fehlgeschlagen.", true);
        resultsContainer.innerHTML = '';
        emptyHint.hidden = false;
    }
}

// KONTO LÖSCHEN FUNKTION
// app.js
/**
 * Zeigt ein Modal zur erneuten Passworteingabe an.
 * @returns {Promise<string|null>} 
 */
function promptForPassword() {
    const modal = document.getElementById('reauth-modal');
    const form = document.getElementById('reauth-form');
    const passwordInput = document.getElementById('reauth-password');
    const cancelBtn = document.getElementById('reauth-modal-cancel-btn');

    modal.style.display = 'flex';
    passwordInput.value = '';
    passwordInput.focus();

    return new Promise((resolve) => {
        const close = (result) => {
            modal.style.display = 'none';
            form.onsubmit = null;
            cancelBtn.onclick = null;
            resolve(result);
        };

        form.onsubmit = (e) => {
            e.preventDefault();
            close(passwordInput.value);
        };
        cancelBtn.onclick = () => close(null);
    });
}


async function handleDeleteAccount() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const confirmed = await showConfirmModal(
        "Konto endgültig löschen?",
        "Bist du absolut sicher? Alle deine Daten, inklusive deiner Anzeigen, werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.",
        "Ja, Konto löschen"
    );

    if (!confirmed) return;

    showToast("Lösche Kontodaten...");

    try {
        // Schritt 1: Erst die Daten aus Firestore löschen
        const userAdsQuery = query(collection(db, "ads"), where("authorId", "==", currentUser.uid));
        const userAdsSnapshot = await getDocs(userAdsQuery);
        if (!userAdsSnapshot.empty) {
            const deleteBatch = writeBatch(db);
            userAdsSnapshot.forEach(adDoc => deleteBatch.delete(adDoc.ref));
            await deleteBatch.commit();
        }
        await deleteDoc(doc(db, "users", currentUser.uid));

        // Schritt 2: Versuchen, den Auth-Account zu löschen
        await deleteUser(currentUser);
        showToast("Dein Konto wurde erfolgreich gelöscht.");

    } catch (error) {
        // ==========================================================
        // HIER IST DIE NEUE, VERBESSERTE LOGIK
        // ==========================================================
        if (error.code === 'auth/requires-recent-login') {
            showToast("Zur Sicherheit bitte Passwort erneut eingeben.", true);
            const password = await promptForPassword();

            if (!password) {
                showToast("Löschvorgang abgebrochen. Deine Anzeigen wurden bereits gelöscht.", true);
                return;
            }

            try {
                // Anmeldeinformationen erstellen
                const credential = EmailAuthProvider.credential(currentUser.email, password);
                
                // Erneute Authentifizierung durchführen
                await reauthenticateWithCredential(currentUser, credential);

                // Erneut versuchen, den Account zu löschen (diesmal wird es klappen)
                await deleteUser(currentUser);
                showToast("Dein Konto wurde erfolgreich gelöscht.");

            } catch (reauthError) {
                console.error("Fehler bei der Re-Authentifizierung:", reauthError);
                showToast("Falsches Passwort. Dein Account wurde nicht gelöscht.", true);
            }
        } else {
            console.error("Fehler beim Löschen des Kontos:", error);
            showToast("Das Konto konnte nicht gelöscht werden. Versuche es später erneut.", true);
        }
    }
}
// ===================================================================
// =================== CHAT FUNKTIONALITÄT ===================
// ===================================================================

/**
 * Erzeugt eine eindeutige, sortierte Chat-ID aus zwei Benutzer-IDs.
 * @param {string} uid1 - Die UID des ersten Benutzers.
 * @param {string} uid2 - Die UID des zweiten Benutzers.
 * @returns {string} Die kombinierte Chat-ID.
 */
function createChatId(uid1, uid2) {
    return [uid1, uid2].sort().join('_');
}

/**
 * Startet den Prozess, um einen Chat mit einem anderen Benutzer zu beginnen.
 * Erstellt einen neuen Chat, falls noch keiner existiert.
 * @param {string} targetUserId - Die UID des Benutzers, mit dem gechattet werden soll.
 */
async function startChatWithUser(targetUserId) {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        showToast("Bitte melde dich an, um eine Nachricht zu senden.", true);
        openAuthModal();
        return;
    }
    if (currentUser.uid === targetUserId) {
        showToast("Du kannst dir nicht selbst schreiben.", true);
        return;
    }

    const targetUserProfile = await getAuthorProfile(targetUserId);
    if (targetUserProfile?.blockedUsers?.includes(currentUser.uid)) {
        showToast("Dieser Benutzer hat dich blockiert.", true);
        return;
    }

    if (currentUserProfile?.blockedUsers?.includes(targetUserId)) {
        showToast("Du hast diesen Benutzer blockiert.", true);
        return;
    }

    const chatId = createChatId(currentUser.uid, targetUserId);
    const chatDocRef = doc(db, "chats", chatId);

    try {
        const chatDoc = await getDoc(chatDocRef);
        
        if (chatDoc.exists()) {
            // FALL 1: Chat existiert bereits.
            // Prüfen, ob er für den aktuellen Nutzer ausgeblendet ist.
            const chatData = chatDoc.data();
            if (chatData.hiddenFor?.includes(currentUser.uid)) {
                // Ja, er ist ausgeblendet. Wir blenden ihn wieder ein.
                await updateDoc(chatDocRef, {
                    hiddenFor: arrayRemove(currentUser.uid)
                });
                showToast("Chat wurde wieder in deiner Liste eingeblendet.");
            }
        } else {
            // FALL 2: Chat existiert nicht. Wir erstellen ihn neu.
            const targetUserProfile = await getAuthorProfile(targetUserId);
            await setDoc(chatDocRef, {
                participants: [currentUser.uid, targetUserId],
                participantDetails: {
                    [currentUser.uid]: {
                        username: currentUserProfile.username,
                        avatar: currentUserProfile.avatarUrl || createInitialAvatar(currentUserProfile.username, currentUserProfile.avatarColor)
                    },
                    [targetUserId]: {
                        username: targetUserProfile.username,
                        avatar: targetUserProfile.avatarUrl || createInitialAvatar(targetUserProfile.username, targetUserProfile.avatarColor)
                    }
                },
                lastMessage: "Chat gestartet...",
                lastMessageTimestamp: serverTimestamp(),
                lastMessageSenderId: null,
                hiddenFor: [], // Initial leeres Array
                unreadCount: {
                    [currentUser.uid]: 0,
                    [targetUserId]: 0
                }
            });
        }
        
        // Unabhängig davon, ob der Chat neu oder reaktiviert wurde:
        // Navigiere zur Nachrichten-Ansicht und öffne den Chat.
        showView('nachrichten');
        await openChat(chatId);

    } catch (error) {
        console.error("Fehler beim Starten des Chats:", error);
        showToast("Der Chat konnte nicht gestartet werden.", true);
    }
}


/**
 * Lauscht auf Änderungen in der Chat-Sammlung des aktuellen Benutzers.
 * @param {string} uid - Die UID des aktuellen Benutzers.
 */


// in app.js
// ERSETZEN Sie Ihre bestehende 'listenToUserChats' Funktion komplett mit dieser Version.

// in app.js
// ERSETZEN Sie Ihre bestehende 'listenToUserChats' Funktion mit dieser

function listenToUserChats(uid) {
    if (unsubscribeChatsListener) unsubscribeChatsListener();

    const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", uid),
        orderBy("lastMessageTimestamp", "desc")
    );

    unsubscribeChatsListener = onSnapshot(q, async (snapshot) => {
        const userDoc = await getDoc(doc(db, "users", uid));
        const blockedByCurrentUser = userDoc.data()?.blockedUsers || [];

        const chatPromises = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(chat => !chat.hiddenFor?.includes(uid))
            .map(async chat => {
                const otherUserId = chat.participants.find(p => p !== uid);
                if (!otherUserId) return null;
                if (blockedByCurrentUser.includes(otherUserId)) return null;

                const otherUserProfile = await getAuthorProfile(otherUserId);
                if (otherUserProfile?.blockedUsers?.includes(uid)) return null;
                
                return chat;
            });

        const chats = (await Promise.all(chatPromises)).filter(Boolean);
        
        // === START DER KORREKTUR FÜR DEN GLOBALEN ZÄHLER ===
        let totalUnreadMessages = 0;
        
        // 1. Alle ungelesenen Nachrichten zusammenzählen
        if (chats) {
            chats.forEach(chat => {
                if (chat.unreadCount && chat.unreadCount[uid]) {
                    totalUnreadMessages += chat.unreadCount[uid];
                }
            });
        }
        
        const navCounter = document.getElementById('nav-message-counter');
        
        // 2. Den Zähler in der Navigation steuern
        if (totalUnreadMessages > 0) {
            // Wenn es Nachrichten gibt: Zähler anzeigen und Wert setzen
            navCounter.textContent = totalUnreadMessages;
            navCounter.hidden = false;
        } else {
            // Wenn es KEINE Nachrichten gibt: Zähler komplett ausblenden
            navCounter.hidden = true;
            navCounter.textContent = '0'; // Zur Sicherheit zurücksetzen
        }
        // === ENDE DER KORREKTUR ===

        renderChatList(chats);
    }, (error) => {
        console.error("Fehler beim Lauschen auf Chats:", error);
    });
}

/**
 * Rendert die Liste der Chats in der linken Spalte.
 * @param {Array<object>} chats - Ein Array von Chat-Objekten.
 */
function renderChatList(chats) {
    const listContainer = document.getElementById('chat-list-container');
    const emptyHint = document.getElementById('chat-list-empty');
    listContainer.innerHTML = '';
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    if (chats.length === 0) {
        emptyHint.hidden = false;
        return;
    }
    emptyHint.hidden = true;

    chats.forEach(chat => {
        const otherUserId = chat.participants.find(p => p !== currentUser.uid);
        if (!otherUserId || !chat.participantDetails || !chat.participantDetails[otherUserId]) return;

        const details = chat.participantDetails[otherUserId];
        const lastMessagePrefix = chat.lastMessageSenderId === currentUser.uid ? "Du: " : "";

        const unreadMessages = chat.unreadCount ? (chat.unreadCount[currentUser.uid] || 0) : 0;
        const hasUnread = unreadMessages > 0;

        
        const item = document.createElement('div');
        item.className = 'chat-list-item';
        if (chat.id === activeChatId) {
            item.classList.add('active');
        }

        if (hasUnread) {
        item.classList.add('has-unread');
        }

        item.dataset.chatId = chat.id;

        // Das HTML für den Chat-Eintrag, inklusive des neuen Menüs
        item.innerHTML = `
            <div class="chat-list-clickable-area">
                <img src="${details.avatar}" alt="Avatar" class="chat-list-avatar">
                <div class="chat-list-info">
                    <span class="username">${details.username}</span>
                    <span class="last-message">${lastMessagePrefix}${chat.lastMessage}</span>
                </div>

                 <div class="chat-list-meta">
                <span class="timestamp">${formatDate(chat.lastMessageTimestamp)}</span>
                ${hasUnread ? `<span class="unread-indicator">${unreadMessages}</span>` : ''}
            </div>
            </div>
            <div class="chat-header-actions">
                <button class="menu-toggle-btn chat-item-menu-btn" aria-label="Weitere Optionen"></button>
                <div class="detail-menu chat-item-menu">
                <button class="detail-menu-item danger btn-block-chat-user" data-chat-id="${chat.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                    <span>Benutzer blockieren</span>
                </button>
                    <button class="detail-menu-item danger btn-delete-chat" data-chat-id="${chat.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        <span>Chat löschen</span>
                    </button>
                </div>
            </div>
        `;
        // Event-Listener, um den Chat beim Klick zu öffnen
        item.querySelector('.chat-list-clickable-area').addEventListener('click', () => openChat(chat.id));
        listContainer.appendChild(item);
    });
}

/**
 * Öffnet einen spezifischen Chat, zeigt die Nachrichten an und lauscht auf neue.
 * @param {string} chatId - Die ID des zu öffnenden Chats.
 */
async function openChat(chatId) {
    if (unsubscribeMessagesListener) unsubscribeMessagesListener();
    activeChatId = chatId;
    
    // UI-Zustand aktualisieren
    document.querySelectorAll('.chat-list-item.active').forEach(el => el.classList.remove('active'));
    document.querySelector(`.chat-list-item[data-chat-id="${chatId}"]`)?.classList.add('active');

    document.getElementById('active-chat-panel').classList.add('viewing-chat');
    document.querySelector('.chat-container').classList.add('chat-active');
    
    const currentUser = auth.currentUser;

    try {
        const chatDocRef = doc(db, "chats", chatId);
        const unreadCountReset = {};
        // Dot-Notation, um nur das Feld des aktuellen Nutzers im 'unreadCount'-Objekt zu ändern
        unreadCountReset[`unreadCount.${currentUser.uid}`] = 0;
        await updateDoc(chatDocRef, unreadCountReset);
    } catch (error) {
        console.error("Fehler beim Zurücksetzen des Zählers für gelesene Nachrichten:", error);
    }

    const chatDocRef = doc(db, "chats", chatId);


    const unreadCountReset = {};
    unreadCountReset[`unreadCount.${currentUser.uid}`] = 0;
    await updateDoc(chatDocRef, unreadCountReset);


    const chatDoc = await getDoc(doc(db, "chats", chatId));
    const chatData = chatDoc.data();
    const otherUserId = chatData.participants.find(p => p !== currentUser.uid);
    const otherUserDetails = await getAuthorProfile(otherUserId);
    
    document.getElementById('chat-block-btn').onclick = () => {
        chatDetailMenu.classList.remove('visible');
        handleBlockUser(otherUserId);
    };


    // Header mit Infos des Chatpartners füllen
    const headerAvatar = document.getElementById('chat-header-avatar');
    headerAvatar.src = otherUserDetails.avatarUrl || createInitialAvatar(otherUserDetails.username, otherUserDetails.avatarColor);
    document.getElementById('chat-header-username').textContent = otherUserDetails.username;
    
    const userInfoHeader = document.getElementById('chat-header-userinfo');
    userInfoHeader.onclick = () => renderPublicProfileView(otherUserId);
    
    // Event Listener für das Melden-Menü im Chat
    const chatMenuBtn = document.getElementById('chat-menu-btn');
    const chatDetailMenu = document.getElementById('chat-detail-menu');
    chatMenuBtn.onclick = (e) => {
        e.stopPropagation();
        chatDetailMenu.classList.toggle('visible');
    };
    document.getElementById('chat-report-btn').onclick = () => {
        chatDetailMenu.classList.remove('visible');
        startUserReportProcess(otherUserId, true); // true signalisiert, dass es aus einem Chat kommt
    };

    // Nachrichten lauschen und rendern
    const messagesContainer = document.getElementById('chat-messages');
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));

    unsubscribeMessagesListener = onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = '';
    snapshot.forEach(doc => {
        const message = doc.data();
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.classList.add(message.senderId === currentUser.uid ? 'sent' : 'received');

        // === KORRIGIERTE LOGIK FÜR NACHRICHTENTYPEN ===
        
        // Fall 1: Es ist eine Bild-Nachricht mit einer gültigen URL
        if (message.type === 'image' && message.imageUrl) {
            bubble.classList.add('image-message');
            // Cloudinary-URL für eine kleinere, optimierte Version anpassen
            const thumbnailUrl = message.imageUrl.replace('/upload/', '/upload/w_300,h_300,c_limit,q_auto/');
            bubble.innerHTML = `<img src="${thumbnailUrl}" alt="Gesendetes Bild" loading="lazy">`;
            // Klick öffnet das Bild in voller Größe in einem neuen Tab
            bubble.onclick = () => window.open(message.imageUrl, '_blank');
        
        // Fall 2: Es ist eine Text-Nachricht mit Inhalt
        } else if (message.type === 'text' && message.text) {
            bubble.textContent = message.text;
        
        // Fall 3 (Fallback): Wenn etwas schiefgeht, wird nichts gerendert.
        } else {
            return; // Überspringt das Hinzufügen einer leeren Blase
        }
        
        messagesContainer.appendChild(bubble);
    });
    // Nach dem Rendern ans Ende scrollen
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});
}

/**
 * Sendet eine Nachricht im aktuell geöffneten Chat.
 * @param {Event} e - Das Formular-Submit-Event.
 */
async function handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-message-input');
    const messageText = input.value.trim();

    if (!messageText || !activeChatId) return;
    
    input.value = ''; // Input-Feld sofort leeren

    const messageData = {
        type: 'text',
        text: messageText,
    };
    
    await sendMessage(messageData);
}

// ===================================================================
// ====== NEUE FUNKTIONEN ZUM SENDEN VON ANHÄNGEN (22.09.2025) ======
// ===================================================================

/**
 * Behandelt das Senden der eigenen Adresse im Chat.
 */
async function handleSendAddress() {
    if (!isProfileComplete()) {
        showToast("Bitte vervollständige dein Profil, um deine Adresse zu senden.", true);
        showView('profile');
        return;
    }
    const { firstName, lastName, street, zip, city } = currentUserProfile;
    const addressText = `Hier ist meine Adresse:\n${firstName} ${lastName}\n${street}\n${zip} ${city}`;

    const confirmed = await showConfirmModal(
        "Adresse senden?",
        `Möchtest du die folgende Adresse wirklich senden?\n\n${addressText}`,
        "Ja, senden"
    );

    if (confirmed) {
        const messageData = {
            type: 'text',
            text: addressText
        };
        sendMessage(messageData);
    }
}


/**
 * Behandelt das Hochladen und Senden eines Bildes im Chat.
 * @param {File} file - Die vom Benutzer ausgewählte Bilddatei.
 */
async function handleSendImage(file) {
    if (file.size > 10 * 1024 * 1024) { // 10 MB Limit
        showToast("Die Bilddatei ist zu groß (max. 10MB).", true);
        return;
    }

    const previewModal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('image-preview-content');
    const confirmBtn = document.getElementById('confirm-send-image-btn');
    const cancelBtn = document.getElementById('cancel-send-image-btn');

    const reader = new FileReader();
    reader.onload = e => {
        previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    previewModal.style.display = 'flex';

    const close = () => {
        previewModal.style.display = 'none';
        previewImage.src = "";
        // Wichtig: Event-Listener entfernen, um Memory-Leaks zu vermeiden
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
    };

    cancelBtn.onclick = close;

    confirmBtn.onclick = async () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Lädt hoch...';
        showToast("Lade Bild hoch...");
        const imageUrl = await uploadImageToCloudinary(file);

        if (imageUrl) {
            const messageData = {
                type: 'image',
                imageUrl: imageUrl
            };
            await sendMessage(messageData);
            showToast("Bild gesendet!");
        }
        
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Senden';
        close();
    };
}
/**
 * Zentrale Funktion zum Senden einer Nachricht, egal welchen Typs.
 * @param {object} messagePayload - Das Objekt mit den Nachrichtendaten (z.B. {type: 'text', text: '...'} oder {type: 'image', imageUrl: '...'}).
 */
async function sendMessage(messagePayload) {
    const currentUser = auth.currentUser;
    if (!activeChatId || !currentUser) return;

    const finalMessageData = {
        ...messagePayload,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
    };
    
    const lastMessageText = messagePayload.type === 'image' ? 'Bild gesendet' : messagePayload.text;

    try {
        const chatDocRef = doc(db, "chats", activeChatId);
        
        // HIER WAR DER FEHLER: Die ID des Chatpartners muss erst ermittelt werden.
        const chatDoc = await getDoc(chatDocRef);
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants.find(p => p !== currentUser.uid);

        const messagesColRef = collection(db, "chats", activeChatId, "messages");
        const batch = writeBatch(db);

        // 1. Neue Nachricht zur Subcollection hinzufügen
        batch.set(doc(messagesColRef), finalMessageData);

        // Update für den Zähler der ungelesenen Nachrichten
        const unreadCountUpdate = {};
        unreadCountUpdate[`unreadCount.${otherUserId}`] = increment(1);

        // 2. Haupt-Chat-Dokument für die Listenansicht aktualisieren
        batch.update(chatDocRef, {
            lastMessage: lastMessageText,
            lastMessageTimestamp: serverTimestamp(),
            lastMessageSenderId: currentUser.uid,
            ...unreadCountUpdate // Fügt das Inkrement-Update hinzu
        });

        await batch.commit();

    } catch (error) {
        console.error("Fehler beim Senden der Nachricht:", error);
        showToast("Nachricht konnte nicht gesendet werden.", true);
    }
}
// ===================================================================
// ====== ENDE DER NEUEN SENDEN-FUNKTIONEN ======
// ===================================================================


/**
 * Behandelt das Ausblenden eines Chats für den aktuellen Benutzer.
 * @param {string} chatId - Die ID des auszublendenden Chats.
 */
async function handleDeleteChat(chatId) {
    const confirmed = await showConfirmModal(
        "Chat löschen?",
        "Der Chatverlauf wird nur für dich ausgeblendet und aus dieser Liste entfernt. Der andere Teilnehmer sieht den Chat weiterhin.",
        "Ja, ausblenden"
    );

    if (confirmed) {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const chatDocRef = doc(db, "chats", chatId);
        try {
            // Fügt die UID des aktuellen Nutzers zum 'hiddenFor'-Array im Chat-Dokument hinzu
            await updateDoc(chatDocRef, {
                hiddenFor: arrayUnion(currentUser.uid)
            });
            showToast("Chat wurde ausgeblendet.");
            
            // Wenn der ausgeblendete Chat gerade aktiv war, setze die Ansicht zurück
            if (activeChatId === chatId) {
                // ERSETZT: Alte .hidden Logik
                document.getElementById('active-chat-panel').classList.remove('viewing-chat');
                if (unsubscribeMessagesListener) unsubscribeMessagesListener();
                activeChatId = null;
            }
        } catch (error) {
            console.error("Fehler beim Ausblenden des Chats:", error);
            showToast("Aktion fehlgeschlagen.", true);
        }
    }
}

async function renderUnverifiedUsers() {
    if (!isUserAdmin()) return;

    const list = document.getElementById('unverified-users-list');
    const empty = document.getElementById('unverified-users-empty');
    list.innerHTML = '';

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const q = query(
            collection(db, "users"),
            where("isVerified", "==", false),
            where("createdAt", "<", twentyFourHoursAgo)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            empty.hidden = false;
            return;
        }

        empty.hidden = true;
        querySnapshot.forEach(doc => {
            const user = { id: doc.id, ...doc.data() };
            const item = document.createElement('div');
            item.className = 'unverified-user-item';
            
            const creationDate = user.createdAt ? formatDate(user.createdAt) : 'unbekannt';

            item.innerHTML = `
                <div class="info">
                    <span class="username">${user.username}</span>
                    <span class="email">${user.email}</span>
                    <span class="email">Erstellt: ${creationDate}</span>
                    </div>
                <button class="button small danger btn-delete-unverified-user" data-id="${user.id}" data-username="${user.username}">Löschen</button>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error("Fehler beim Abrufen unbestätigter Benutzer:", error);
        showToast("Unbestätigte Benutzer konnten nicht geladen werden.", true);
    }
}

// NEUE FUNKTION FÜR BENUTZERNAMEN-ÜBERPRÜFUNG
async function renderPendingReviewUsers() {
    if (!isUserAdmin()) return;

    const list = document.getElementById('pending-review-users-list');
    const empty = document.getElementById('pending-review-users-empty');
    list.innerHTML = '';

    try {
        const q = query(collection(db, "users"), where("reviewStatus", "==", "pending"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            empty.hidden = false;
            return;
        }

        empty.hidden = true;
        querySnapshot.forEach(doc => {
            const user = { id: doc.id, ...doc.data() };
            const item = document.createElement('div');
            item.className = 'pending-review-item';
            
            item.innerHTML = `
                <div class="info">
                    <span class="username">${user.username}</span>
                    <span class="email">${user.email}</span>
                </div>
                <div class="actions">
                    <button class="button small success btn-approve-user" data-id="${user.id}" data-username="${user.username}">Genehmigen</button>
                    <button class="button small danger btn-block-user" data-id="${user.id}" data-username="${user.username}">Sperren</button>
                </div>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error("Fehler beim Abrufen der zu prüfenden Benutzer:", error);
        showToast("Benutzer zur Prüfung konnten nicht geladen werden.", true);
    }
}

async function handleBlockUser(userIdToBlock) {
    const currentUser = auth.currentUser;
    if (!currentUser || !userIdToBlock || currentUser.uid === userIdToBlock) return;

    const userToBlockProfile = await getAuthorProfile(userIdToBlock);
    const usernameToBlock = userToBlockProfile?.username || 'diesen Benutzer';

    const confirmed = await showConfirmModal(
        `"${usernameToBlock}" blockieren?`,
        `Du wirst die Chats und Anzeigen dieses Benutzers nicht mehr sehen und er kann dich nicht mehr kontaktieren. Du kannst dies später in deinen Profileinstellungen rückgängig machen.`,
        "Ja, Benutzer blockieren"
    );

    if (confirmed) {
        const currentUserDocRef = doc(db, "users", currentUser.uid);
        try {
            await updateDoc(currentUserDocRef, {
                blockedUsers: arrayUnion(userIdToBlock)
            });
            showToast(`"${usernameToBlock}" wurde blockiert.`);

            if (activeChatId && activeChatId.includes(userIdToBlock)) {
                document.querySelector('.chat-container').classList.remove('chat-active');
                if (unsubscribeMessagesListener) unsubscribeMessagesListener();
                activeChatId = null;
                document.getElementById('active-chat-panel').classList.remove('viewing-chat');
            }
        } catch (error) {
            console.error("Fehler beim Blockieren des Benutzers:", error);
            showToast("Benutzer konnte nicht blockiert werden.", true);
        }
    }
}