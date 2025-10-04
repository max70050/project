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
    reauthenticateWithCredential,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCNXQuFW6SLR_w5x1NxlLScp17LjppAuCA",
    authDomain: "schulmensa-9de80.firebaseapp.com",
    projectId: "schulmensa-9de80",
    storageBucket: "schulmensa-9de80.firebasestorage.app",
    messagingSenderId: "930393675999",
    appId: "1:930393675999:web:cb4bb79f7a448b86efb16a",
    measurementId: "G-5TXS661SFP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();


const forbiddenUsernameFragments = [
    
    'admin', 'administrator', 'root', 'support', 'hilfe', 'gast',
    'moderator', 'system', 'info', 'kontakt', 'webmaster', 'sysadmin',
    'postmaster', 'staff', 'team', 'bot', 'robot', 'official',
    'offiziell', 'test', 'user', 'master', 'superuser', 'chef',

    
    'arsch', 'fick', 'hure', 'nazi', 'hitler', 'scheisse', 'penis', 'vagina',
    'arschloch', 'fotze', 'muschi', 'wixer', 'wichser', 'schlampe',
    'nutte', 'miststück', 'bastard', 'depp', 'idiot', 'trottel', 'vollidiot',
    'spast', 'spasst', 'behinderte', 'kanake', 'neger', 'mistgeburt',

    
    'bitch', 'fuck', 'shit', 'asshole', 'cunt', 'dick', 'pussy',
    'slut', 'whore', 'nigger', 'faggot', 'retard', 'douchebag',

    
    'heil', 'ss', 'wehrmacht', 'gestapo', 'hakenkreuz', 'hknkrz',
    '88', '18', 'siegheil', 'is', 'isis', 'terrorist', 'alqaida',

    
    'kaufen', 'verkaufen', 'sale', 'shop', 'angebot', 'deal',
    'cialis', 'viagra', 'casino', 'wett', 'poker',

    
    'www', 'http', 'https', 'com', 'net', 'org', 'de', 'io',

    
    'schwarz', 'dæli', 'mensa', 'hm', 'HM', 'Hm', 'hM'
];

let cart = {};
let currentUserProfile = null;
let selectedPickupDay = null;

const authModal = document.getElementById('auth-modal');
const authButton = document.getElementById('auth-button');
const closeModalButton = document.querySelector('.close-button');
const welcomeSection = document.getElementById('welcome-section');
const orderSection = document.getElementById('order-section');
const profileSection = document.getElementById('profile-section');
const userOrdersSection = document.getElementById('user-orders-section');
const managementOrdersSection = document.getElementById('management-orders-section');
const adminAreaSection = document.getElementById('admin-area-section');
const adminToolsSection = document.getElementById('admintools-section');
const userOrdersListContainer = document.getElementById('user-orders-list');
const managementOrdersListContainer = document.getElementById('management-orders-list');
const reportedOrdersListContainer = document.getElementById('reported-orders-list');
const homeLink = document.getElementById('home-link');
const orderLink = document.getElementById('order-link');
const orderCtaButton = document.getElementById('order-cta-button');
const userProfileLink = document.getElementById('user-profile-link');
const userOrdersLink = document.getElementById('user-orders-link');
const managementOrdersLink = document.getElementById('management-orders-link');
const adminAreaLink = document.getElementById('admin-area-link');
const adminToolsLink = document.getElementById('admintools-link');
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const googleUsernameView = document.getElementById('google-username-view');
const verificationMessage = document.getElementById('verification-message');
const passwordResetView = document.getElementById('password-reset-view'); 
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const showPasswordResetLink = document.getElementById('show-password-reset'); 
const backToLoginLink = document.getElementById('back-to-login'); 
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerBtn = document.getElementById('register-btn');
const googleSignInBtn = document.getElementById('google-signin-btn');
const googleUsernameInput = document.getElementById('google-username-input');
const googleUsernameSubmitBtn = document.getElementById('google-username-submit-btn');
const googleRegisterBtn = document.getElementById('google-register-btn');
const resetEmailInput = document.getElementById('reset-email'); 
const sendResetEmailBtn = document.getElementById('send-reset-email-btn'); 
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
const reauthDeleteModal = document.getElementById('reauth-delete-modal'); 
const closeReauthButton = document.querySelector('.close-reauth-button'); 
const reauthPasswordInput = document.getElementById('reauth-password'); 
const confirmDeleteBtn = document.getElementById('confirm-delete-btn'); 
const menuContainer = document.querySelector('.menu-container');
const cartItemsList = document.getElementById('cart-items-list');
const cartPlaceholder = document.getElementById('cart-placeholder');
const totalPriceValue = document.getElementById('total-price-value');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckoutButton = document.querySelector('.close-checkout-button');
const cancelOrderBtn = document.getElementById('cancel-order-btn');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const checkoutTotalPrice = document.getElementById('checkout-total-price');
const checkoutPickupDay = document.getElementById('checkout-pickup-day');
const checkoutPickupTime = document.getElementById('checkout-pickup-time');
const statsUserCount = document.getElementById('stats-user-count');
const statsOpenOrdersCount = document.getElementById('stats-open-orders-count');
const reportedOrderDetailModal = document.getElementById('reported-order-detail-modal');
const reportedOrderDetailContent = document.getElementById('reported-order-detail-content');
const deleteOldOrdersBtn = document.getElementById('delete-old-orders-btn');
const hamburgerMenu = document.getElementById('hamburger-menu');
const navLinksContainer = document.getElementById('nav-links');
const customHourSelect = document.getElementById('custom-hour-select');
const customMinuteSelect = document.getElementById('custom-minute-select');
const customHourOptions = document.getElementById('custom-hour-options');
const customMinuteOptions = document.getElementById('custom-minute-options');
const lengthCheck = document.getElementById('length-check');
const uppercaseCheck = document.getElementById('uppercase-check');
const numberCheck = document.getElementById('number-check');
const pickupDaySelector = document.getElementById('pickup-day-selector');

const usernameErrorMessage = document.getElementById('username-error-message'); // NEU
const googleUsernameErrorMessage = document.getElementById('google-username-error-message'); // NEU


const dayMapping = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const dayIndexMapping = { "Montag": 1, "Dienstag": 2, "Mittwoch": 3, "Donnerstag": 4, "Freitag": 5 };

document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept-btn');

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieBanner.classList.add('show');
    }

    acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieBanner.classList.remove('show');
    });

    setupCustomSelect(customHourSelect);
    setupCustomSelect(customMinuteSelect);
    populateHours();
    populateMinutes();
    setupDaySelector();
    setupOrderTabs();
});

hamburgerMenu.addEventListener('click', () => {
    navLinksContainer.classList.toggle('nav-active');
    hamburgerMenu.classList.toggle('is-active');
});

navLinksContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        navLinksContainer.classList.remove('nav-active');
        hamburgerMenu.classList.remove('is-active');
    }
});

document.addEventListener('click', (e) => {
    const isClickInsideNav = navLinksContainer.contains(e.target);
    const isClickOnHamburger = hamburgerMenu.contains(e.target);

    if (navLinksContainer.classList.contains('nav-active') && !isClickInsideNav && !isClickOnHamburger) {
        navLinksContainer.classList.remove('nav-active');
        hamburgerMenu.classList.remove('is-active');
    }
});

function setupCustomSelect(selectElement) {
    const trigger = selectElement.querySelector('.custom-select-trigger');
    const options = selectElement.querySelector('.custom-options');

    trigger.addEventListener('click', () => {
        selectElement.classList.toggle('open');
    });

    options.addEventListener('click', (e) => {
        if (e.target.classList.contains('custom-option')) {
            const currentlySelected = options.querySelector('.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }
            
            e.target.classList.add('selected');
            trigger.querySelector('span').textContent = e.target.textContent;
            selectElement.setAttribute('data-value', e.target.dataset.value);
            selectElement.classList.remove('open');
            selectElement.dispatchEvent(new Event('change'));
        }
    });
}

function setupDaySelector() {
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0=So, 1=Mo, ..., 6=Sa

    const buttons = pickupDaySelector.querySelectorAll('button');
    let defaultDaySet = false;

    buttons.forEach(button => {
        const buttonDay = button.dataset.day;
        const buttonDayIndex = dayIndexMapping[buttonDay];
        
        // At weekend, all days are for the next week and enabled
        if (currentDayIndex === 6 || currentDayIndex === 0) {
            button.disabled = false;
            // Set Monday as default
            if (buttonDayIndex === 1 && !defaultDaySet) {
                button.classList.add('active');
                selectedPickupDay = buttonDay;
                defaultDaySet = true;
            }
        } else { // During the week
            if (buttonDayIndex < currentDayIndex) {
                button.disabled = true;
            } else {
                button.disabled = false;
                if (buttonDayIndex === currentDayIndex && !defaultDaySet) {
                    button.classList.add('active');
                    selectedPickupDay = buttonDay;
                    defaultDaySet = true;
                }
            }
        }
    });
    renderCart();
}

function setupOrderTabs() {
    document.querySelectorAll('.orders-display-section').forEach(section => {
        const tabs = section.querySelector('.order-day-tabs');
        if (tabs) {
            tabs.addEventListener('click', e => {
                if (e.target.tagName === 'BUTTON') {
                    const day = e.target.dataset.day;
                    tabs.querySelector('.active')?.classList.remove('active');
                    e.target.classList.add('active');

                    if (section.id === 'user-orders-section') {
                        renderUserOrders(day);
                    } else if (section.id === 'management-orders-section') {
                        renderManagementOrders(day);
                    }
                }
            });
        }
    });
}

pickupDaySelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
        pickupDaySelector.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        selectedPickupDay = e.target.dataset.day;
        renderCart();
    }
});

window.addEventListener('click', (e) => {
    document.querySelectorAll('.custom-select').forEach(select => {
        if (!select.contains(e.target)) {
            select.classList.remove('open');
        }
    });
});

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

const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await setDoc(userDocRef, {
                username: user.displayName,
                email: user.email,
                createdAt: new Date(),
                firstName: "", 
                lastName: "", 
                usernameChangesThisMonth: 0,
                usernameLastChangeMonth: "none", 
                firstNameChangeCount: 0,
                lastNameChangeCount: 0,
                isCoAdmin: false, 
                isAdmin: false, 
                isBlocked: false
            });
            showNotification(`Willkommen, ${user.displayName}! Dein Konto wurde erstellt.`, 'success');
        } else {
            showNotification(`Willkommen zurück, ${user.displayName}!`, 'success');
        }
        closeModal();
    } catch (error) {
        console.error("Google Authentifizierungsfehler:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            showNotification('Die Anmeldung wurde abgebrochen.', 'error');
        } else {
            showNotification('Ein Fehler bei der Google-Anmeldung ist aufgetreten.', 'error');
        }
    }
};

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
        const today = new Date().getDay(); // 0-6
        const defaultDay = (today === 0 || today === 6) ? "Montag" : dayMapping[today];
        const tabs = userOrdersSection.querySelector('.order-day-tabs');
        tabs.querySelector('.active')?.classList.remove('active');
        tabs.querySelector(`[data-day="${defaultDay}"]`).classList.add('active');
        renderUserOrders(defaultDay);
    } else {
        openModal();
    }
};

const showManagementOrdersPage = () => {
    if (auth.currentUser) {
        showPage(managementOrdersSection);
        const today = new Date().getDay(); // 0-6
        const defaultDay = (today === 0 || today === 6) ? "Montag" : dayMapping[today];
        const tabs = managementOrdersSection.querySelector('.order-day-tabs');
        tabs.querySelector('.active')?.classList.remove('active');
        tabs.querySelector(`[data-day="${defaultDay}"]`).classList.add('active');
        renderManagementOrders(defaultDay);
    } else {
        openModal();
    }
};

const showAdminAreaPage = () => showPage(adminAreaSection);

const showAdminToolsPage = () => {
    if (auth.currentUser) {
        showPage(adminToolsSection);
        renderReportedOrders();
        renderAdminStats();
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

const openModal = () => {
    loginView.style.display = 'block';
    registerView.style.display = 'none';
    verificationMessage.style.display = 'none';
    passwordResetView.style.display = 'none'; 
    authModal.style.display = 'flex'; 
};

const closeModal = () => { authModal.style.display = 'none'; };

const switchModalView = (viewToShow) => {
    [loginView, registerView, passwordResetView, verificationMessage, googleUsernameView].forEach(view => {
        view.style.display = view === viewToShow ? 'block' : 'none';
    });
};

const populateMinutes = (isFourteen = false) => {
    customMinuteOptions.innerHTML = '';
    const minutes = isFourteen ? ['00'] : ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    
    minutes.forEach(m => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('custom-option');
        optionDiv.dataset.value = m;
        optionDiv.textContent = m;
        customMinuteOptions.appendChild(optionDiv);
    });
};

const populateHours = () => {
    customHourOptions.innerHTML = '';
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
    const selectDayNotice = document.getElementById('select-day-notice');
    const selectTimeNotice = document.getElementById('select-time-notice');
    
    let totalPrice = 0;
    const itemIds = Object.keys(cart);

    if (itemIds.length === 0) {
        cartItemsList.appendChild(cartPlaceholder);
        cartPlaceholder.style.display = 'block';
    } else {
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
    let dayNoticeVisible = false;
    let timeNoticeVisible = false;

    const hour = customHourSelect.getAttribute('data-value');
    const minute = customMinuteSelect.getAttribute('data-value');

    if (totalPrice === 0) {
        isButtonDisabled = true;
    } 
    
    if (!selectedPickupDay) {
        dayNoticeVisible = true;
        isButtonDisabled = true;
    }

    if (!hour || !minute) {
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
    selectDayNotice.style.display = dayNoticeVisible ? 'block' : 'none';
    selectTimeNotice.style.display = timeNoticeVisible ? 'block' : 'none';
    checkoutBtn.disabled = isButtonDisabled;
};

const resetOrder = () => {
    cart = {};
    setupDaySelector(); // Resets day to default
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

const renderUserOrders = async (day) => {
    const user = auth.currentUser;
    if (!user || !day) return;

    userOrdersListContainer.innerHTML = "<p>Lade Bestellungen...</p>";

    const q = query(
        collection(db, "orders"), 
        where("userId", "==", user.uid),
        where("userAcknowledged", "==", false),
        where("pickupDay", "==", day)
    );
    const querySnapshot = await getDocs(q);
    
    const orders = [];
    querySnapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    
    // Sort by pickup time
    orders.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
    
    if (orders.length === 0) {
        userOrdersListContainer.innerHTML = `<p>Du hast für ${day} keine offenen Bestellungen.</p>`;
        return;
    }

    userOrdersListContainer.innerHTML = "";
    orders.forEach(order => {
        const orderId = order.id;
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

const renderManagementOrders = async (day) => {
    if (!day) return;
    managementOrdersListContainer.innerHTML = "<p>Lade Bestellungen...</p>";

    const q = query(
        collection(db, "orders"), 
        where("adminCompleted", "==", false), 
        where("isReported", "==", false),
        where("pickupDay", "==", day)
    );
    const querySnapshot = await getDocs(q);

    const orders = [];
    querySnapshot.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));

    // Sort by pickup time
    orders.sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));

    if (orders.length === 0) {
        managementOrdersListContainer.innerHTML = `<p>Für ${day} sind keine offenen Bestellungen vorhanden.</p>`;
        return;
    }

    managementOrdersListContainer.innerHTML = "";
    orders.forEach(order => {
        const orderId = order.id;
        const orderDate = order.timestamp.toDate();
        const formattedDate = `${orderDate.toLocaleDateString('de-DE')} um ${orderDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr`;
        const fullName = [order.userFirstName, order.userLastName].filter(Boolean).join(' ') || order.userName;

        const itemsHtml = Object.values(order.items).map(item => 
            `<li><span>${item.quantity}x ${item.name}</span> <span>${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span></li>`
        ).join('');

        const orderCard = document.createElement('div');
        orderCard.className = `order-card ${order.isPrepared ? 'prepared' : ''}`;
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
            <div class="order-details-bar"></div>
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
                    <button class="prepare-order-btn" data-id="${orderId}" ${order.isPrepared ? 'disabled' : ''}>
                        ${order.isPrepared ? 'Vorbereitet' : 'Vorbereiten'}
                    </button>
                    <button class="finish-order-btn" data-id="${orderId}">
                        <i class="fa-solid fa-check"></i> Fertig
                    </button>
                </div>
            </div>
        `;
        managementOrdersListContainer.appendChild(orderCard);
    });
};

const renderAdminStats = async () => {
    try {
        const usersQuery = query(collection(db, "users"));
        const usersSnapshot = await getDocs(usersQuery);
        statsUserCount.textContent = usersSnapshot.size;

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
        compactItem.dataset.id = orderId;
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

const openReportedOrderDetailModal = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
        showNotification("Bestellung nicht gefunden.", "error");
        return;
    }
    const order = orderSnap.data();
    const userDocRef = doc(db, "users", order.userId);
    const userDocSnap = await getDoc(userDocRef);
    const userData = userDocSnap.exists() ? userDocSnap.data() : null;
    const orderDate = order.timestamp.toDate();
    const formattedDate = `${orderDate.toLocaleDateString('de-DE')} um ${orderDate.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr`;

    const itemsHtml = Object.values(order.items).map(item => 
        `<li><span>${item.quantity}x ${item.name}</span> <span>${(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span></li>`
    ).join('');
    
    reportedOrderDetailContent.innerHTML = `
        <div class="order-header">
            <div class="order-header-info">
                <strong>Bestellnr: ${order.orderNumber}</strong>
                <span>${formattedDate}</span>
            </div>
            <div class="order-pickup-time">
                <span>Abholung am ${order.pickupDay} um:</span>
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
    reportedOrderDetailModal.style.display = 'flex';
};

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






// NEU: Event-Listener für die Echtzeit-Validierung des Benutzernamens
registerUsernameInput.addEventListener('input', () => {
    const username = registerUsernameInput.value.trim().toLowerCase();
    const isForbidden = forbiddenUsernameFragments.some(fragment => username.includes(fragment));

    if (isForbidden && username.length > 0) {
        usernameErrorMessage.textContent = 'Dieser Benutzername ist nicht verfügbar.';
        usernameErrorMessage.style.display = 'block';
        registerUsernameInput.classList.add('invalid');
        registerBtn.disabled = true;
    } else {
        usernameErrorMessage.style.display = 'none';
        registerUsernameInput.classList.remove('invalid');
        // Re-evaluiere den Button-Status basierend auf den Passwort-Kriterien
        const pass = registerPasswordInput.value;
        const hasLength = pass.length >= 8;
        const hasUppercase = /[A-Z]/.test(pass);
        const hasNumber = /[0-9]/.test(pass);
        registerBtn.disabled = !(hasLength && hasUppercase && hasNumber);
    }
});

// NEU: Dieselbe Logik für das Google-Registrierungs-Formular
googleUsernameInput.addEventListener('input', () => {
    const username = googleUsernameInput.value.trim().toLowerCase();
    const isForbidden = forbiddenUsernameFragments.some(fragment => username.includes(fragment));

    if (isForbidden && username.length > 0) {
        googleUsernameErrorMessage.textContent = 'Dieser Benutzername ist nicht verfügbar.';
        googleUsernameErrorMessage.style.display = 'block';
        googleUsernameInput.classList.add('invalid');
        googleUsernameSubmitBtn.disabled = true;
    } else {
        googleUsernameErrorMessage.style.display = 'none';
        googleUsernameInput.classList.remove('invalid');
        googleUsernameSubmitBtn.disabled = false;
    }
});


registerPasswordInput.addEventListener('input', () => {
    const pass = registerPasswordInput.value;
    const hasLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);

    lengthCheck.classList.toggle('valid', hasLength);
    uppercaseCheck.classList.toggle('valid', hasUppercase);
    numberCheck.classList.toggle('valid', hasNumber);

    // Prüfe auch den Benutzernamen-Status, bevor der Button aktiviert wird
    const isUsernameInvalid = registerUsernameInput.classList.contains('invalid');
    
    registerBtn.disabled = !(hasLength && hasUppercase && hasNumber) || isUsernameInvalid;
});

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

document.getElementById('toggle-login-password').addEventListener('click', (e) => togglePasswordVisibility(loginEmailInput, e.target));
document.getElementById('toggle-register-password').addEventListener('click', (e) => togglePasswordVisibility(registerPasswordInput, e.target));
document.getElementById('toggle-reauth-password').addEventListener('click', (e) => togglePasswordVisibility(reauthPasswordInput, e.target)); 

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

showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(registerView); });
showLoginLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(loginView); });
showPasswordResetLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(passwordResetView); }); 
backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); switchModalView(loginView); }); 

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

googleSignInBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            switchModalView(googleUsernameView);
            googleUsernameInput.value = user.displayName || '';

            googleUsernameSubmitBtn.addEventListener('click', async () => {
                const username = googleUsernameInput.value.trim();
                if (!username) {
                    showNotification("Bitte gib einen Benutzernamen ein.");
                    return;
                }

                try {
                    await updateProfile(user, { displayName: username });
                    await setDoc(doc(db, "users", user.uid), {
                        username: username,
                        email: user.email,
                        createdAt: new Date(),
                        firstName: result.user.displayName.split(' ')[0] || "",
                        lastName: result.user.displayName.split(' ').slice(1).join(' ') || "",
                        usernameChangesThisMonth: 0,
                        usernameLastChangeMonth: "none", 
                        firstNameChangeCount: 0,
                        lastNameChangeCount: 0,
                        isCoAdmin: false,
                        isAdmin: false,
                        isBlocked: false
                    });

                    closeModal();
                    showNotification(`Willkommen, ${username}! Dein Konto wurde erstellt.`, 'success');

                } catch (error) {
                    showNotification('Fehler beim Speichern des Benutzernamens: ' + error.message);
                }
            }, { once: true });

        } else {
            closeModal();
            showNotification(`Willkommen zurück, ${user.displayName}!`, 'success');
        }
    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user') {
            showNotification('Anmeldung abgebrochen.', 'success');
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            showNotification('Ein Konto mit dieser E-Mail existiert bereits. Bitte melde dich auf dem ursprünglichen Weg an.');
        } else {
            showNotification('Fehler bei der Google-Anmeldung: ' + error.message);
        }
    }
});

googleRegisterBtn.addEventListener('click', handleGoogleAuth);

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

customHourSelect.addEventListener('change', () => {
    const selectedHour = customHourSelect.getAttribute('data-value');
    populateMinutes(selectedHour === '14');
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
    checkoutPickupDay.textContent = selectedPickupDay || '--';
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
    if (!selectedPickupDay) {
        showNotification("Bitte wähle einen Abholtag aus.");
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
            pickupDay: selectedPickupDay,
            pickupTime: pickupTime,
            timestamp: Timestamp.now(),
            status: 'pending',
            adminCompleted: false,
            userAcknowledged: false,
            isReported: false,
            isPrepared: false // Neuer Status
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

reportedOrderDetailModal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('close-button')) {
        reportedOrderDetailModal.style.display = 'none';
    }
});

managementOrdersListContainer.addEventListener('click', async (e) => {
    const target = e.target;
    const orderCard = target.closest('.order-card');
    if (!orderCard) return;

    const orderId = target.dataset.id;
    const orderRef = doc(db, "orders", orderId);

    if (target.matches('.finish-order-btn')) {
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

    if (target.matches('.report-order-btn')) {
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
    
    if (target.matches('.prepare-order-btn') && !target.disabled) {
        try {
            target.disabled = true;
            await updateDoc(orderRef, { isPrepared: true });
            orderCard.classList.add('prepared');
            target.textContent = 'Vorbereitet';
            showNotification("Bestellung als vorbereitet markiert.", "success");
        } catch (error) {
            console.error("Fehler bei Admin-Aktion 'Vorbereiten': ", error);
            showNotification("Aktion fehlgeschlagen.", "error");
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

reportedOrdersListContainer.addEventListener('click', (e) => {
    const target = e.target.closest('.reported-order-item-compact');
    if (!target) return;
    const orderId = target.dataset.id;
    openReportedOrderDetailModal(orderId);
});

reportedOrderDetailContent.addEventListener('click', async (e) => {
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

    if (e.target.matches('.resolve-report-btn')) {
        const orderId = e.target.dataset.orderId;
        const orderRef = doc(db, "orders", orderId);
        try {
            e.target.disabled = true;
            await updateDoc(orderRef, { isReported: false });
            showNotification("Meldung wurde aufgehoben. Die Bestellung ist wieder normal sichtbar.", "success");
            reportedOrderDetailModal.style.display = 'none';
            renderReportedOrders();
            renderAdminStats();
        } catch (error) {
            console.error("Fehler beim Aufheben der Meldung:", error);
            showNotification("Aktion fehlgeschlagen.", "error");
            e.target.disabled = false;
        }
    }
});

deleteOldOrdersBtn.addEventListener('click', async () => {
    const confirmation = confirm("Möchtest du wirklich alle Bestellungen, die älter als 7 Tage sind, endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.");
    if (!confirmation) return;

    deleteOldOrdersBtn.disabled = true;
    deleteOldOrdersBtn.textContent = "Lösche...";

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);
        const q = query(collection(db, "orders"), where("timestamp", "<", sevenDaysAgoTimestamp));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            showNotification("Keine alten Bestellungen zum Löschen gefunden.", "success");
            return;
        }

        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });
        
        await Promise.all(deletePromises);
        
        showNotification(`${deletePromises.length} alte Bestellungen wurden erfolgreich gelöscht.`, "success");

    } catch (error) {
        console.error("Fehler beim Löschen alter Bestellungen:", error);
        showNotification("Ein Fehler ist beim Löschen aufgetreten.", "error");
    } finally {
        deleteOldOrdersBtn.disabled = false;
        deleteOldOrdersBtn.textContent = "Alte Bestellungen löschen";
    }
});