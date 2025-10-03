// Importiere die benötigten Firebase-Funktionen
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut,
    sendEmailVerification,
    updateProfile,
    sendPasswordResetEmail,
    deleteUser, 
    EmailAuthProvider, 
    reauthenticateWithCredential 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
// Firestore importieren
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc,
    deleteDoc,
    // NEUE IMPORTE FÜR BESTELLUNGEN
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// !!! HIER DEINE FIREBASE KONFIGURATION EINFÜGEN !!!
const firebaseConfig = {
    apiKey: "AIzaSyCNXQuFW6SLR_w5x1NxlLScp17LjppAuCA",
    authDomain: "schulmensa-9de80.firebaseapp.com",
    projectId: "schulmensa-9de80",
    storageBucket: "schulmensa-9de80.firebasestorage.app",
    messagingSenderId: "930393675999",
    appId: "1:930393675999:web:cb4bb79f7a448b86efb16a",
    measurementId: "G-5TXS661SFP"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Zustand für den Warenkorb ---
let cart = {};
let currentUserProfile = null;

// ===================================================================
// ====== NEUE LOGIK FÜR HAMBURGER-MENÜ ======
// ===================================================================
const hamburgerMenu = document.getElementById('hamburger-menu');
const navLinksContainer = document.getElementById('nav-links');

hamburgerMenu.addEventListener('click', () => {
    navLinksContainer.classList.toggle('nav-active');
});

// Schließt das Menü, wenn ein Link darin geklickt wird
navLinksContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        navLinksContainer.classList.remove('nav-active');
    }
});


// ===================================================================
// ====== NEUE LOGIK FÜR CUSTOM DROPDOWNS ======
// ===================================================================

function setupCustomSelect(selectElement) {
    const trigger = selectElement.querySelector('.custom-select-trigger');
    const options = selectElement.querySelector('.custom-options');

    // Öffnen und Schließen des Dropdowns
    trigger.addEventListener('click', () => {
        selectElement.classList.toggle('open');
    });

    // Option auswählen
    options.addEventListener('click', (e) => {
        if (e.target.classList.contains('custom-option')) {
            // Alten "selected" Status entfernen
            const currentlySelected = options.querySelector('.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            
            // Neue Option als "selected" markieren
            e.target.classList.add('selected');
            
            // Angezeigten Text und Datenwert aktualisieren
            trigger.querySelector('span').textContent = e.target.textContent;
            selectElement.setAttribute('data-value', e.target.dataset.value);
            
            // Dropdown schließen
            selectElement.classList.remove('open');

            // Manuelle Auslösung des 'change'-Events, damit der Rest der App reagiert
            selectElement.dispatchEvent(new Event('change'));
        }
    });
}

// Schließt das Dropdown, wenn man daneben klickt
window.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select').forEach(select => {
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });
});

// --- Funktion für benutzerdefinierte Benachrichtigungen ---
const showNotification = (message, type = 'error') => {
    const oldNotifier = document.querySelector('.notification');
    if (oldNotifier) oldNotifier.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
};

// --- Elemente aus dem HTML holen ---
const authModal = document.getElementById('auth-modal');
const authButton = document.getElementById('auth-button');
const closeModalButton = document.querySelector('.close-button');

// Seiten-Sektionen
const welcomeSection = document.getElementById('welcome-section');
const orderSection = document.getElementById('order-section');
const profileSection = document.getElementById('profile-section');
const userOrdersSection = document.getElementById('user-orders-section');
const managementOrdersSection = document.getElementById('management-orders-section');
const adminAreaSection = document.getElementById('admin-area-section');
const adminToolsSection = document.getElementById('admintools-section');

// Container für die Bestell-Listen
const userOrdersListContainer = document.getElementById('user-orders-list');
const managementOrdersListContainer = document.getElementById('management-orders-list');
const reportedOrdersListContainer = document.getElementById('reported-orders-list');

// Navigations- und CTA-Elemente
const homeLink = document.getElementById('home-link');
const orderLink = document.getElementById('order-link');
const orderCtaButton = document.getElementById('order-cta-button');
const userProfileLink = document.getElementById('user-profile-link');
const userOrdersLink = document.getElementById('user-orders-link');
const managementOrdersLink = document.getElementById('management-orders-link');
const adminAreaLink = document.getElementById('admin-area-link');
const adminToolsLink = document.getElementById('admintools-link');

// Ansichten im Modal
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const verificationMessage = document.getElementById('verification-message');
const passwordResetView = document.getElementById('password-reset-view'); 
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const showPasswordResetLink = document.getElementById('show-password-reset'); 
const backToLoginLink = document.getElementById('back-to-login'); 

// Login-Formular
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');

// Registrierungs-Formular
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerBtn = document.getElementById('register-btn');

// Passwort-Reset Formular
const resetEmailInput = document.getElementById('reset-email'); 
const sendResetEmailBtn = document.getElementById('send-reset-email-btn'); 

// Profil-Formular
const profileEmail = document.getElementById('profile-email');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const profileUsername = document.getElementById('profile-username');
const profileFirstname = document.getElementById('profile-firstname');
const profileLastname = document.getElementById('profile-lastname');
const saveProfileBtn = document.getElementById('save-profile-btn');
const usernameLimitInfo = document.getElementById('username-limit-info');
const fullnameLimitInfo = document.getElementById('fullname-limit-info');
const discardProfileBtn = document.getElementById('discard-profile-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn'); 

// Re-Authentifizierungs-Modal für Löschung
const reauthDeleteModal = document.getElementById('reauth-delete-modal'); 
const closeReauthButton = document.querySelector('.close-reauth-button'); 
const reauthPasswordInput = document.getElementById('reauth-password'); 
const confirmDeleteBtn = document.getElementById('confirm-delete-btn'); 

// Bestell- und Warenkorb-Elemente
const menuContainer = document.querySelector('.menu-container');
const cartItemsList = document.getElementById('cart-items-list');
const cartPlaceholder = document.getElementById('cart-placeholder');
const totalPriceValue = document.getElementById('total-price-value');
const checkoutBtn = document.getElementById('checkout-btn');
const pickupHourSelect = document.getElementById('pickup-hour');
const pickupMinuteSelect = document.getElementById('pickup-minute');

// Checkout-Modal Elemente
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutButton = document.querySelector('.close-checkout-button');
const cancelOrderBtn = document.getElementById('cancel-order-btn');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const checkoutPickupTime = document.getElementById('checkout-pickup-time');

// NEU: Admin-Tools Elemente
const statsUserCount = document.getElementById('stats-user-count');
const statsOpenOrdersCount = document.getElementById('stats-open-orders-count');
const reportedOrderDetailModal = document.getElementById('reported-order-detail-modal');
const reportedOrderDetailContent = document.getElementById('reported-order-detail-content');


// --- Passwort-Sichtbarkeit umschalten ---
function togglePasswordVisibility(passwordInput, toggleIcon) {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    }
}
document.getElementById('toggle-login-password').addEventListener('click', (e) => togglePasswordVisibility(loginPasswordInput, e.target));
document.getElementById('toggle-register-password').addEventListener('click', (e) => togglePasswordVisibility(registerPasswordInput, e.target));
document.getElementById('toggle-reauth-password').addEventListener('click', (e) => togglePasswordVisibility(reauthPasswordInput, e.target)); 


// --- Passwort-Stärke validieren ---
const lengthCheck = document.getElementById('length-check');
const uppercaseCheck = document.getElementById('uppercase-check');
const numberCheck = document.getElementById('number-check');

registerPasswordInput.addEventListener('input', () => {
    const pass = registerPasswordInput.value;
    const hasLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);

    lengthCheck.classList.toggle('valid', hasLength);
    uppercaseCheck.classList.toggle('valid', hasUppercase);
    numberCheck.classList.toggle('valid', hasNumber);

    registerBtn.disabled = !(hasLength && hasUppercase && hasNumber);
});

// --- Formulare mit Enter-Taste absenden ---
const handleLoginOnEnter = (event) => { if (event.key === 'Enter') { event.preventDefault(); loginBtn.click(); } };
loginEmailInput.addEventListener('keydown', handleLoginOnEnter);
loginPasswordInput.addEventListener('keydown', handleLoginOnEnter);

const handleRegisterOnEnter = (event) => { if (event.key === 'Enter' && !registerBtn.disabled) { event.preventDefault(); registerBtn.click(); } };
registerUsernameInput.addEventListener('keydown', handleRegisterOnEnter);
registerEmailInput.addEventListener('keydown', handleRegisterOnEnter);
registerPasswordInput.addEventListener('keydown', handleRegisterOnEnter);

const handlePasswordResetOnEnter = (event) => { if (event.key === 'Enter') { event.preventDefault(); sendResetEmailBtn.click(); } };
resetEmailInput.addEventListener('keydown', handlePasswordResetOnEnter);

const handleConfirmDeleteOnEnter = (event) => { if (event.key === 'Enter') { event.preventDefault(); confirmDeleteBtn.click(); } };
reauthPasswordInput.addEventListener('keydown', handleConfirmDeleteOnEnter);


// --- Seiten-Navigations-Funktionen ---
const showPage = (pageToShow) => {
    [welcomeSection, orderSection, profileSection, userOrdersSection, managementOrdersSection, adminAreaSection, adminToolsSection].forEach(page => {
        const displayStyle = (page.id === 'order-section') ? 'grid' : 'flex';
        page.style.display = page === pageToShow ? displayStyle : 'none';
    });
};

const showHomePage = () => showPage(welcomeSection);

const showOrderPage = async () => {
    const user = auth.currentUser;
    if (user && user.emailVerified) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            currentUserProfile = userDocSnap.data();
            if (currentUserProfile.isBlocked) {
                showNotification("Dein Konto wurde für Bestellungen gesperrt.");
                showHomePage();
                return;
            }
        }
        
        showPage(orderSection);
        renderCart();
    } else {
        openModal();
    }
};

const showUserOrdersPage = () => {
    if (auth.currentUser) {
        showPage(userOrdersSection);
        renderUserOrders();
    } else {
        openModal();
    }
};
const showManagementOrdersPage = () => {
    if (auth.currentUser) {
        showPage(managementOrdersSection);
        renderManagementOrders();
    } else {
        openModal();
    }
};
const showAdminAreaPage = () => showPage(adminAreaSection);
const showAdminToolsPage = () => {
    if (auth.currentUser) {
        showPage(adminToolsSection);
        renderReportedOrders();
        renderAdminStats(); // NEU: Statistiken laden
    } else {
        openModal();
    }
};


const showProfilePage = async () => {
    if (auth.currentUser) {
        showPage(profileSection);
        profileEmail.value = auth.currentUser.email;

        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            profileUsername.value = auth.currentUser.displayName || '';
            profileFirstname.value = data.firstName || '';
            profileLastname.value = data.lastName || '';

            const currentMonth = new Date().toISOString().slice(0, 7);
            const changesThisMonth = data.usernameLastChangeMonth === currentMonth ? data.usernameChangesThisMonth : 0;
            usernameLimitInfo.textContent = `Kann noch ${2 - changesThisMonth} Mal diesen Monat geändert werden.`;

            const firstNameChanges = data.firstNameChangeCount || 0;
            const lastNameChanges = data.lastNameChangeCount || 0;
            fullnameLimitInfo.textContent = `Vorname kann noch ${2 - firstNameChanges} Mal, Nachname noch ${2 - lastNameChanges} Mal geändert werden.`;
        }
    } else {
        openModal();
    }
};

// --- Modal-Funktionen ---
const openModal = () => {
    loginView.style.display = 'block';
    registerView.style.display = 'none';
    verificationMessage.style.display = 'none';
    passwordResetView.style.display = 'none'; 
    authModal.style.display = 'flex'; 
};
const closeModal = () => { authModal.style.display = 'none'; };

closeModalButton.addEventListener('click', closeModal);
window.addEventListener('click', (event) => { if (event.target === authModal) closeModal(); });
homeLink.addEventListener('click', (e) => { e.preventDefault(); showHomePage(); });
orderLink.addEventListener('click', (e) => { e.preventDefault(); showOrderPage(); });
orderCtaButton.addEventListener('click', showOrderPage);
userProfileLink.addEventListener('click', (e) => { e.preventDefault(); showProfilePage(); });
userOrdersLink.addEventListener('click', (e) => { e.preventDefault(); showUserOrdersPage(); });
managementOrdersLink.addEventListener('click', (e) => { e.preventDefault(); showManagementOrdersPage(); });
adminAreaLink.addEventListener('click', (e) => { e.preventDefault(); showAdminAreaPage(); });
adminToolsLink.addEventListener('click', (e) => { e.preventDefault(); showAdminToolsPage(); });


discardProfileBtn.addEventListener('click', async () => {
    await showProfilePage(); 
    showNotification("Änderungen verworfen.", "success");
});

const switchModalView = (viewToShow) => {
    [loginView, registerView, passwordResetView, verificationMessage].forEach(view => {
        view.style.display = view === viewToShow ? 'block' : 'none';
    });
};
showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(registerView); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(loginView); });
showPasswordResetLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(passwordResetView); }); 
backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(loginView); }); 


// --- Firebase Authentifizierungs-Logik ---
registerBtn.addEventListener('click', async () => {
    const username = registerUsernameInput.value.trim();
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    if (!username || !email || !password) {
        showNotification("Bitte fülle alle Felder aus.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: username });
        
        await setDoc(doc(db, "users", user.uid), {
            username: username, email: email, createdAt: new Date(),
            firstName: "", lastName: "", usernameChangesThisMonth: 0,
            usernameLastChangeMonth: "none", 
            firstNameChangeCount: 0,
            lastNameChangeCount: 0,
            isCoAdmin: false, isAdmin: false, isBlocked: false
        });

        await sendEmailVerification(user);
        switchModalView(verificationMessage);

    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            showNotification('Diese E-Mail-Adresse wird bereits verwendet.');
        } else {
            showNotification('Fehler bei der Registrierung: ' + error.message);
        }
    }
});

loginBtn.addEventListener('click', () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    if (!email || !password) {
        showNotification("Bitte gib E-Mail und Passwort ein.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            if (userCredential.user.emailVerified) {
                closeModal();
                showNotification(`Willkommen zurück, ${userCredential.user.displayName}!`, 'success');
            } else {
                showNotification("Bitte bestätige zuerst deine E-Mail-Adresse.");
                signOut(auth);
            }
        })
        .catch((error) => {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                 showNotification('E-Mail oder Passwort ist falsch.');
            } else {
                 showNotification('Fehler bei der Anmeldung: ' + error.message);
            }
        });
});

onAuthStateChanged(auth, async (user) => {
    const optionalLinks = [userProfileLink, userOrdersLink, managementOrdersLink, adminToolsLink];
    optionalLinks.forEach(link => link.style.display = 'none');
    adminAreaLink.style.display = 'none';

    if (user && user.emailVerified) {
        authButton.textContent = 'Abmelden';
        authButton.onclick = () => signOut(auth);

        userProfileLink.textContent = user.displayName || "Profil";
        userProfileLink.style.display = 'block';

        userOrdersLink.style.display = 'block';

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            currentUserProfile = userDocSnap.data();

            if (currentUserProfile.isCoAdmin === true || currentUserProfile.isAdmin === true) {
                managementOrdersLink.style.display = 'block';
            }

            if (currentUserProfile.isAdmin === true) {
                adminToolsLink.style.display = 'block';
            }
        }
    } else {
        const wasJustLoggedOut = authButton.textContent === 'Abmelden';
        if (wasJustLoggedOut) {
            showNotification("Du wurdest erfolgreich abgemeldet.", "success");
        }
        
        currentUserProfile = null;

        authButton.textContent = 'Anmelden';
        authButton.onclick = openModal;
        
        loginEmailInput.value = '';
        loginPasswordInput.value = '';
        
        showHomePage();
    }
    renderCart();
});

sendResetEmailBtn.addEventListener('click', () => {
    const email = resetEmailInput.value;
    if (!email) {
        showNotification("Bitte gib deine E-Mail-Adresse ein.", "error");
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            closeModal();
            authModal.style.display = 'flex';
            switchModalView(null); 
            verificationMessage.style.display = 'block';
            verificationMessage.innerHTML = `
                <i class="fa-solid fa-envelope-circle-check"></i>
                <h2>E-Mail versendet!</h2>
                <p>Eine E-Mail zum Zurücksetzen deines Passworts wurde an <strong>${email}</strong> gesendet. Bitte klicke auf den Link in der E-Mail.</p>
                <p><strong>Bitte schau auch in deinem Spam-Ordner nach!</strong></p>
            `;
        })
        .catch(error => {
            showNotification("Fehler: " + error.message, "error");
        });
});


// --- Profil speichern und Passwort zurücksetzen ---
resetPasswordBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        sendPasswordResetEmail(auth, user.email)
            .then(() => {
                showNotification("E-Mail zum Zurücksetzen wurde an dein Postfach gesendet.", "success");
            })
            .catch((error) => {
                showNotification("Fehler: " + error.message);
            });
    }
});

saveProfileBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    try {
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            showNotification("Benutzerprofil nicht gefunden.", "error");
            return;
        }

        const data = userDocSnap.data();
        const newUsername = profileUsername.value.trim();
        const newFirstName = profileFirstname.value.trim();
        const newLastName = profileLastname.value.trim();
        const updates = {};
        let errorOccurred = false;
        
        if (newUsername !== user.displayName) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const changesThisMonth = data.usernameLastChangeMonth === currentMonth ? data.usernameChangesThisMonth : 0;
            
            if (changesThisMonth < 2) {
                await updateProfile(user, { displayName: newUsername });
                updates.username = newUsername;
                updates.usernameChangesThisMonth = changesThisMonth + 1;
                updates.usernameLastChangeMonth = currentMonth;
            } else {
                showNotification("Du kannst deinen Benutzernamen nur 2 Mal pro Monat ändern.", "error");
                profileUsername.value = user.displayName;
                errorOccurred = true;
            }
        }

        if (newFirstName !== (data.firstName || '')) {
            const changeCount = data.firstNameChangeCount || 0;
            if (changeCount < 2) {
                updates.firstName = newFirstName;
                updates.firstNameChangeCount = changeCount + 1;
            } else {
                showNotification("Du kannst deinen Vornamen nur 2 Mal ändern.", "error");
                profileFirstname.value = data.firstName || '';
                errorOccurred = true;
            }
        }

        if (newLastName !== (data.lastName || '')) {
            const changeCount = data.lastNameChangeCount || 0;
            if (changeCount < 2) {
                updates.lastName = newLastName;
                updates.lastNameChangeCount = changeCount + 1;
            } else {
                showNotification("Du kannst deinen Nachnamen nur 2 Mal ändern.", "error");
                profileLastname.value = data.lastName || '';
                errorOccurred = true;
            }
        }
        
        if (errorOccurred) return;

        if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates);
            
            const updatedDoc = await getDoc(userDocRef);
            if (updatedDoc.exists()) {
                currentUserProfile = updatedDoc.data();
            }

            showNotification("Dein Profil wurde erfolgreich aktualisiert!", "success");
            userProfileLink.textContent = user.displayName;
        } else {
            showNotification("Es wurden keine Änderungen vorgenommen.", "success");
        }
        
        await showProfilePage();

    } catch (error) {
        console.error("Fehler beim Aktualisieren des Profils:", error);
        showNotification("Ein Fehler ist aufgetreten: " + error.message, "error");
        await showProfilePage();
    }
});


// --- Konto löschen Logik ---
deleteAccountBtn.addEventListener('click', () => {
    reauthDeleteModal.style.display = 'flex';
});

closeReauthButton.addEventListener('click', () => {
    reauthDeleteModal.style.display = 'none';
    reauthPasswordInput.value = ''; 
});

confirmDeleteBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    const password = reauthPasswordInput.value;

    if (!user || !password) {
        showNotification("Bitte gib dein Passwort ein.", "error");
        return;
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    const userDocRef = doc(db, "users", user.uid);

    try {
        await reauthenticateWithCredential(user, credential);

        try {
            const ordersQuery = query(collection(db, "orders"), where("userId", "==", user.uid));
            const querySnapshot = await getDocs(ordersQuery);
            
            const deletePromises = [];
            querySnapshot.forEach((doc) => {
                deletePromises.push(deleteDoc(doc.ref));
            });
            
            await Promise.all(deletePromises);

        } catch (orderError) {
            console.error("Fehler beim Löschen der Bestellungen:", orderError);
            showNotification("Die Bestellungen konnten nicht gelöscht werden. Das Konto wird nicht gelöscht.", "error");
            return;
        }

        try {
            await deleteDoc(userDocRef);
        } catch (dbError) {
            console.error("Fehler beim Löschen des Firestore-Dokuments:", dbError);
            showNotification("Konto konnte nicht vollständig gelöscht werden (DB-Fehler). Bitte kontaktiere den Support.", "error");
            return; 
        }

        await deleteUser(user);

        reauthDeleteModal.style.display = 'none';
        showNotification("Dein Konto und alle zugehörigen Bestellungen wurden endgültig gelöscht.", "success");

    } catch (authError) {
        if (authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
            showNotification("Das eingegebene Passwort ist falsch.", "error");
        } else {
            console.error("Fehler bei Authentifizierung oder dem Löschen des Kontos:", authError);
            showNotification("Ein Fehler ist aufgetreten: " + authError.message, "error");
        }
    } finally {
        reauthPasswordInput.value = '';
    }
});


// ===================================================================
// ====== BESTELL-LOGIK (mit Custom Dropdowns) ======
// ===================================================================

const customHourSelect = document.getElementById('custom-hour-select');
const customMinuteSelect = document.getElementById('custom-minute-select');
const customHourOptions = document.getElementById('custom-hour-options');
const customMinuteOptions = document.getElementById('custom-minute-options');


// --- FUNKTIONEN ---
// Diese müssen zuerst definiert werden, bevor sie aufgerufen werden.

const populateMinutes = (isFourteen = false) => {
    customMinuteOptions.innerHTML = ''; // Optionen leeren
    const minutes = isFourteen ? ['00'] : ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
    
    minutes.forEach(m => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('custom-option');
        optionDiv.dataset.value = m;
        optionDiv.textContent = m;
        customMinuteOptions.appendChild(optionDiv);
    });
};

const populateHours = () => {
    customHourOptions.innerHTML = ''; // Optionen leeren
    for (let h = 11; h <= 14; h++) {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('custom-option');
        optionDiv.dataset.value = h;
        optionDiv.textContent = h;
        customHourOptions.appendChild(optionDiv);
    }
};

const renderCart = () => {
    cartItemsList.innerHTML = '';
    const profileCompletionNotice = document.getElementById('profile-completion-notice');
    const maxOrderValueNotice = document.getElementById('max-order-value-notice');
    const selectTimeNotice = document.getElementById('select-time-notice');
    
    let totalPrice = 0;
    const itemIds = Object.keys(cart);

    if (itemIds.length === 0) {
        cartItemsList.appendChild(cartPlaceholder);
        cartPlaceholder.style.display = 'block';
    } else {
        // ... (der Rest dieser Funktion bleibt identisch)
        cartPlaceholder.style.display = 'none';
        itemIds.forEach(id => {
            const item = cart[id];
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.quantity}x ${item.name}</div>
                    <div class="cart-item-price">${item.price.toFixed(2).replace('.', ',')} €</div>
                </div>
                <div class="cart-item-total">${itemTotal.toFixed(2).replace('.', ',')} €</div>
            `;
            cartItemsList.appendChild(li);
        });
    }

    totalPriceValue.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
    checkoutTotalPrice.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;
    
    let isButtonDisabled = false;
    let profileNoticeVisible = false;
    let maxOrderNoticeVisible = false;
    let timeNoticeVisible = false;

    // Auslesen der Werte aus den Custom Dropdowns
    const hour = customHourSelect.getAttribute('data-value');
    const minute = customMinuteSelect.getAttribute('data-value');

    if (totalPrice === 0) {
        isButtonDisabled = true;
    } else if (!hour || !minute) {
        timeNoticeVisible = true;
        isButtonDisabled = true;
    }

    if (totalPrice > 150) {
        maxOrderValueNotice.textContent = 'Der maximale Bestellwert von 150,00 € darf nicht überschritten werden.';
        maxOrderNoticeVisible = true;
        isButtonDisabled = true;
    }

    if (currentUserProfile && totalPrice >= 10) {
        if (!currentUserProfile.firstName || !currentUserProfile.lastName) {
            profileCompletionNotice.textContent = 'Vervollständige dein Profil für Bestellungen über 10,00 €.';
            profileNoticeVisible = true;
            isButtonDisabled = true;
        }
    }
    
    profileCompletionNotice.style.display = profileNoticeVisible ? 'block' : 'none';
    maxOrderValueNotice.style.display = maxOrderNoticeVisible ? 'block' : 'none';
    selectTimeNotice.style.display = timeNoticeVisible ? 'block' : 'none';
    checkoutBtn.disabled = isButtonDisabled;
};

const resetOrder = () => {
    cart = {};
    // Custom Dropdowns zurücksetzen
    customHourSelect.setAttribute('data-value', '');
    customHourSelect.querySelector('span').textContent = '--';
    populateMinutes();
    customMinuteSelect.setAttribute('data-value', '');
    customMinuteSelect.querySelector('span').textContent = '--';

    document.querySelectorAll('.menu-item .quantity').forEach(q => {
        q.textContent = '0';
    });
    renderCart();
};


// --- EVENT-LISTENER ---
// Diese werden ausgeführt, nachdem die Seite geladen und die Funktionen definiert sind.

document.addEventListener('DOMContentLoaded', () => {
    // Custom Dropdowns initialisieren
    setupCustomSelect(customHourSelect);
    setupCustomSelect(customMinuteSelect);
    
    // Optionen befüllen
    populateHours();
    populateMinutes();
});

customHourSelect.addEventListener('change', () => {
    const selectedHour = customHourSelect.getAttribute('data-value');
    populateMinutes(selectedHour === '14');
    
    // Minute zurücksetzen, falls die Auswahl ungültig wird
    customMinuteSelect.setAttribute('data-value', '');
    customMinuteSelect.querySelector('span').textContent = '--';
    
    renderCart();
});

customMinuteSelect.addEventListener('change', renderCart);

menuContainer.addEventListener('click', (e) => {
    const target = e.target;
    const menuItem = target.closest('.menu-item');
    if (!menuItem) return;

    const id = menuItem.dataset.id;
    const name = menuItem.dataset.name;
    const price = parseFloat(menuItem.dataset.price);

    if (!cart[id]) {
        cart[id] = { name, price, quantity: 0 };
    }

    if (target.classList.contains('plus-btn')) {
        cart[id].quantity++;
    } else if (target.classList.contains('minus-btn')) {
        if (cart[id].quantity > 0) {
            cart[id].quantity--;
        }
    }

    if (cart[id].quantity === 0) {
        delete cart[id];
    }

    const quantityDisplay = menuItem.querySelector('.quantity');
    quantityDisplay.textContent = cart[id] ? cart[id].quantity : 0;
    
    renderCart();
});

checkoutBtn.addEventListener('click', () => {
    const hour = customHourSelect.getAttribute('data-value');
    const minute = customMinuteSelect.getAttribute('data-value');
    checkoutPickupTime.textContent = hour && minute ? `${hour}:${minute}` : '--:--';
    checkoutModal.style.display = 'flex';
});

closeCheckoutButton.addEventListener('click', () => checkoutModal.style.display = 'none');
cancelOrderBtn.addEventListener('click', () => checkoutModal.style.display = 'none');

confirmOrderBtn.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) {
        showNotification("Du musst angemeldet sein, um zu bestellen.");
        return;
    }
    const hour = customHourSelect.getAttribute('data-value');
    const minute = customMinuteSelect.getAttribute('data-value');

    if (Object.keys(cart).length === 0) {
        showNotification("Dein Warenkorb ist leer.");
        return;
    }
    if (!hour || !minute) {
        showNotification("Bitte wähle eine vollständige Abholzeit aus.");
        return;
    }

    const pickupTime = `${hour}:${minute}`;
    const totalPrice = Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);

    confirmOrderBtn.disabled = true;
    confirmOrderBtn.textContent = 'Wird gesendet...';
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        let userFirstName = userDocSnap.exists() ? userDocSnap.data().firstName || "" : "";
        let userLastName = userDocSnap.exists() ? userDocSnap.data().lastName || "" : "";
        
        const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
        
        const orderData = {
            orderNumber: orderNumber,
            userId: user.uid,
            userName: user.displayName,
            userFirstName: userFirstName,
            userLastName: userLastName, 
            items: cart,
            totalPrice: totalPrice,
            pickupTime: pickupTime,
            timestamp: Timestamp.now(),
            status: 'pending',
            adminCompleted: false,
            userAcknowledged: false,
            isReported: false
        };

        await addDoc(collection(db, "orders"), orderData);

        checkoutModal.style.display = 'none';
        showNotification("Bestellung wurde erfolgreich abgeschickt!", "success");
        resetOrder();
        showUserOrdersPage();

    } catch (error) {
        console.error("Fehler beim Senden der Bestellung: ", error);
        if (error.message.includes("PERMISSION_DENIED")) {
            showNotification("Dein Konto ist für Bestellungen gesperrt.");
        } else {
            showNotification("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
        }
    } finally {
        confirmOrderBtn.disabled = false;
        confirmOrderBtn.textContent = 'Abschicken';
    }
});


// ===================================================================
// ====== FUNKTIONEN ZUM ANZEIGEN DER BESTELLUNGEN ======
// ===================================================================

const renderUserOrders = async () => {
    const user = auth.currentUser;
    if (!user) return;

    userOrdersListContainer.innerHTML = "<p>Lade Bestellungen...</p>";

    const q = query(
        collection(db, "orders"), 
        where("userId", "==", user.uid),
        where("userAcknowledged", "==", false),
        orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        userOrdersListContainer.innerHTML = "<p>Du hast aktuell keine offenen Bestellungen.</p>";
        return;
    }

    userOrdersListContainer.innerHTML = "";
    querySnapshot.forEach(doc => {
        const order = doc.data();
        const orderId = doc.id;
        const orderDate = order.timestamp.toDate();
        const formattedDate = `${orderDate.toLocaleDateString('de-DE')} um ${orderDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr`;

        const itemsHtml = Object.values(order.items).map(item => 
            `<li><span>${item.quantity}x ${item.name}</span> <span>${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span></li>`
        ).join('');

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-header-info">
                    <strong>Bestellnr: ${order.orderNumber}</strong>
                    <span>${formattedDate}</span>
                   
                </div>
                <div class="order-pickup-time">
                    <span>Abholung um:</span>
                    <strong>${order.pickupTime} Uhr</strong>
                </div>
            </div>
            <div class="order-items-container">
                 <ul class="order-items-list">${itemsHtml}</ul>
            </div>
            <div class="order-footer">
                <div class="order-total">
                    Gesamt: ${order.totalPrice.toFixed(2).replace('.', ',')} €
                </div>
                <button class="received-order-btn" data-id="${orderId}">Bestellung erhalten</button>
            </div>
        `;
        userOrdersListContainer.appendChild(orderCard);
    });
};

const renderManagementOrders = async () => {
    managementOrdersListContainer.innerHTML = "<p>Lade Bestellungen...</p>";

    const q = query(
        collection(db, "orders"), 
        where("adminCompleted", "==", false), 
        where("isReported", "==", false),
        orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        managementOrdersListContainer.innerHTML = "<p>Es sind keine offenen Bestellungen vorhanden.</p>";
        return;
    }

    managementOrdersListContainer.innerHTML = "";
    querySnapshot.forEach(doc => {
        const order = doc.data();
        const orderId = doc.id;
        const orderDate = order.timestamp.toDate();
        const formattedDate = `${orderDate.toLocaleDateString('de-DE')} um ${orderDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr`;
        
        const fullName = [order.userFirstName, order.userLastName].filter(Boolean).join(' ') || 'Noch kein Name eingetragen';

        const itemsHtml = Object.values(order.items).map(item => 
            `<li><span>${item.quantity}x ${item.name}</span> <span>${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span></li>`
        ).join('');

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div class="order-header-info">
                    <strong>Bestellnr: ${order.orderNumber}</strong>
                    <span>${formattedDate}</span>
                </div>
                <div class="order-user-info">
                    <span>Bestellt von:</span>
                    <strong>${fullName}</strong> 
                
                </div>
                <div class="order-pickup-time">
                    <span>Abholung um:</span>
                    <strong>${order.pickupTime} Uhr</strong>
                </div>
            </div>
            <div class="order-details-bar">
                
            </div>
            <div class="order-items-container">
                 <p><strong>Inhalt:</strong></p>
                 <ul class="order-items-list">${itemsHtml}</ul>
            </div>
            <div class="order-footer">
                 <div class="order-total">
                    Gesamt: ${order.totalPrice.toFixed(2).replace('.', ',')} €
                </div>
                <div class="order-actions">
                    <button class="report-order-btn danger-button" data-id="${orderId}">Melden</button>
                    <button class="finish-order-btn" data-id="${orderId}">
                        <i class="fa-solid fa-check"></i> Fertig
                    </button>
                </div>
            </div>
        `;
        managementOrdersListContainer.appendChild(orderCard);
    });
};


// ===================================================================
// ====== NEUE ADMIN-TOOLS FUNKTIONEN ======
// ===================================================================

// NEU: Statistiken abrufen und anzeigen
const renderAdminStats = async () => {
    try {
        // Anzahl der Nutzer
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        statsUserCount.textContent = usersSnapshot.size;

        // Anzahl der offenen Bestellungen
        const openOrdersQuery = query(
            collection(db, "orders"),
            where("adminCompleted", "==", false),
            where("isReported", "==", false)
        );
        const openOrdersSnapshot = await getDocs(openOrdersQuery);
        statsOpenOrdersCount.textContent = openOrdersSnapshot.size;

    } catch (error) {
        console.error("Fehler beim Laden der Admin-Statistiken:", error);
        statsUserCount.textContent = "Fehler";
        statsOpenOrdersCount.textContent = "Fehler";
    }
};


// ÜBERARBEITET: Zeigt gemeldete Bestellungen in einer kompakten Liste an
const renderReportedOrders = async () => {
    reportedOrdersListContainer.innerHTML = "<p>Lade gemeldete Bestellungen...</p>";

    const q = query(
        collection(db, "orders"), 
        where("isReported", "==", true),
        orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        reportedOrdersListContainer.innerHTML = "<p>Keine gemeldeten Bestellungen vorhanden.</p>";
        return;
    }

    reportedOrdersListContainer.innerHTML = "";
    for (const docSnapshot of querySnapshot.docs) {
        const order = docSnapshot.data();
        const orderId = docSnapshot.id;

        const orderDate = order.timestamp.toDate();
        const formattedDate = `${orderDate.toLocaleDateString('de-DE')} um ${orderDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr`;
        const fullName = [order.userFirstName, order.userLastName].filter(Boolean).join(' ') || order.userName;

        const compactItem = document.createElement('div');
        compactItem.className = 'reported-order-item-compact';
        compactItem.dataset.id = orderId; // Wichtig für den Klick-Event
        compactItem.innerHTML = `
            <div class="reported-order-info">
                <strong>Bestellnr: ${order.orderNumber}</strong>
                <span>Von: ${fullName}</span>
            </div>
            <div class="reported-order-date">
                <span>${formattedDate}</span>
            </div>
        `;
        reportedOrdersListContainer.appendChild(compactItem);
    }
};

// NEU: Funktion zum Öffnen und Befüllen des Detail-Modals
const openReportedOrderDetailModal = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        showNotification("Bestellung nicht gefunden.", "error");
        return;
    }
    const order = orderSnap.data();

    // Zusätzliche Benutzerdaten abrufen
    const userDocRef = doc(db, "users", order.userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.exists() ? userDocSnap.data() : null;

    const orderDate = order.timestamp.toDate();
    const formattedDate = `${orderDate.toLocaleDateString('de-DE')} um ${orderDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr`;

    const itemsHtml = Object.values(order.items).map(item => 
        `<li><span>${item.quantity}x ${item.name}</span> <span>${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span></li>`
    ).join('');
    
    // HTML-Inhalt für das Modal generieren
    reportedOrderDetailContent.innerHTML = `
        <div class="order-header">
            <div class="order-header-info">
                <strong>Bestellnr: ${order.orderNumber}</strong>
                <span>${formattedDate}</span>
            </div>
            <div class="order-pickup-time">
                <span>Abholung um:</span>
                <strong>${order.pickupTime} Uhr</strong>
            </div>
        </div>
        <div class="order-items-container">
             <ul class="order-items-list">${itemsHtml}</ul>
        </div>
        <div class="order-footer">
            <div class="order-total">
                Gesamt: ${order.totalPrice.toFixed(2).replace('.', ',')} €
            </div>
        </div>
        ${userData ? `
        <div class="reported-user-details">
            <h4>Nutzerinformationen</h4>
            <p><strong>Name:</strong> ${[userData.firstName, userData.lastName].filter(Boolean).join(' ') || 'N/A'}</p>
            <p><strong>E-Mail:</strong> ${userData.email}</p>
        </div>
        ` : '<p>Nutzerdaten nicht gefunden.</p>'}
        <div class="reported-order-modal-actions">
            <button class="resolve-report-btn secondary-button" data-order-id="${orderId}">Meldung aufheben</button>
            <button class="block-user-btn danger-button" data-user-id="${order.userId}" ${userData && userData.isBlocked ? 'disabled' : ''}>
                ${userData && userData.isBlocked ? 'Nutzer ist gesperrt' : 'Nutzer sperren'}
            </button>
        </div>
    `;

    // Modal anzeigen
    reportedOrderDetailModal.style.display = 'flex';
};

// --- Event Listeners für Admin-Aktionen ---

// Schließt das Detail-Modal
reportedOrderDetailModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-button')) {
        reportedOrderDetailModal.style.display = 'none';
    }
});


managementOrdersListContainer.addEventListener('click', async (e) => {
    const target = e.target;
    const orderCard = target.closest('.order-card');
    if (!orderCard) return;

    // Logik für "Fertig"-Button
    if (target.matches('.finish-order-btn')) {
        const orderId = target.dataset.id;
        const orderRef = doc(db, "orders", orderId);
        try {
            target.disabled = true;
            await updateDoc(orderRef, { adminCompleted: true });
            orderCard.style.transition = 'opacity 0.3s ease';
            orderCard.style.opacity = '0';
            setTimeout(() => orderCard.remove(), 300);
            showNotification("Bestellung als fertig markiert.", "success");
        } catch (error) {
            console.error("Fehler bei Admin-Aktion 'Fertig': ", error);
            showNotification("Aktion fehlgeschlagen.", "error");
            target.disabled = false;
        }
    }

    // Logik für "Melden"-Button
    if (target.matches('.report-order-btn')) {
        const orderId = target.dataset.id;
        const orderRef = doc(db, "orders", orderId);
        try {
            target.disabled = true;
            await updateDoc(orderRef, { isReported: true });
            orderCard.style.transition = 'opacity 0.3s ease';
            orderCard.style.opacity = '0';
            setTimeout(() => orderCard.remove(), 300);
            showNotification("Bestellung wurde gemeldet und zur Überprüfung verschoben.", "success");
        } catch (error) {
            console.error("Fehler bei Admin-Aktion 'Melden': ", error);
            showNotification("Melden fehlgeschlagen.", "error");
            target.disabled = false;
        }
    }
});


userOrdersListContainer.addEventListener('click', async (e) => {
    const target = e.target.closest('.received-order-btn');
    if (!target) return;

    const orderId = target.dataset.id;
    const orderCard = target.closest('.order-card');
    const orderRef = doc(db, "orders", orderId);

    try {
        target.disabled = true;
        await updateDoc(orderRef, { userAcknowledged: true });
        
        orderCard.style.transition = 'opacity 0.3s ease';
        orderCard.style.opacity = '0';
        setTimeout(() => orderCard.remove(), 300);
        showNotification("Bestellung als erhalten markiert.", "success");

        const updatedDoc = await getDoc(orderRef);
        if (updatedDoc.exists() && updatedDoc.data().adminCompleted === true) {
            await deleteDoc(orderRef);
        }
    } catch (error) {
        console.error("Fehler bei Nutzer-Aktion: ", error);
        showNotification("Aktion fehlgeschlagen.", "error");
        target.disabled = false;
    }
});


// ÜBERARBEITET: Event Listener für die Admin-Tools-Seite
reportedOrdersListContainer.addEventListener('click', (e) => {
    const target = e.target.closest('.reported-order-item-compact');
    if (!target) return;

    const orderId = target.dataset.id;
    openReportedOrderDetailModal(orderId);
});

// NEU: Event-Listener für Aktionen IM DETAIL-MODAL
reportedOrderDetailContent.addEventListener('click', async (e) => {
    // Nutzer sperren
    if (e.target.matches('.block-user-btn') && !e.target.disabled) {
        const userId = e.target.dataset.userId;
        const userRef = doc(db, "users", userId);
        try {
            e.target.disabled = true;
            await updateDoc(userRef, { isBlocked: true });
            e.target.textContent = 'Nutzer gesperrt';
            showNotification("Nutzer wurde erfolgreich für Bestellungen gesperrt.", "success");
        } catch (error) {
            console.error("Fehler beim Sperren des Nutzers:", error);
            showNotification("Sperren des Nutzers fehlgeschlagen.", "error");
            e.target.disabled = false;
        }
    }

    // Meldung aufheben
    if (e.target.matches('.resolve-report-btn')) {
        const orderId = e.target.dataset.orderId;
        const orderRef = doc(db, "orders", orderId);
        try {
            e.target.disabled = true;
            await updateDoc(orderRef, { isReported: false });
            showNotification("Meldung wurde aufgehoben. Die Bestellung ist wieder normal sichtbar.", "success");
            reportedOrderDetailModal.style.display = 'none';
            // Lade Listen neu, um die Änderung zu reflektieren
            renderReportedOrders();
            renderAdminStats();
        } catch (error) {
            console.error("Fehler beim Aufheben der Meldung:", error);
            showNotification("Aktion fehlgeschlagen.", "error");
            e.target.disabled = false;
        }
    }
});