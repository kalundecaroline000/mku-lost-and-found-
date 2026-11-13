// 1. INITIALIZE DATA FROM LOCALSTORAGE
let itemsDatabase = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
let currentUser = JSON.parse(localStorage.getItem('mku_current_user')) || null;

// DOM ELEMENTS SELECTION
const itemsGrid = document.getElementById('items-grid');
const searchInput = document.getElementById('search-input');
const campusFilter = document.getElementById('campus-filter');
const categoryFilter = document.getElementById('category-filter');
const lookupForm = document.getElementById('lookup-form');
const regInput = document.getElementById('reg-number');
const lookupResult = document.getElementById('lookup-result');
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const sessionContainer = document.getElementById('user-session-container');

// 2. AUTH MODAL CONTROLS & ACCOUNT CREATION
function openAuthModal() {
    if (authModal) authModal.classList.remove('hidden');
}

function closeAuthModal() {
    if (authModal) authModal.classList.add('hidden');
}

// Handle Login / Account Creation & Role-Based Redirection
if (authForm) {
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('auth-name').value.trim();
        const userId = document.getElementById('auth-id').value.trim().toUpperCase();
        const role = document.getElementById('auth-role').value;

        // Save active session state
        currentUser = { name, userId, role };
        localStorage.setItem('mku_current_user', JSON.stringify(currentUser));

        // Register/Update user in directory for System Admin management
        let registeredUsers = JSON.parse(localStorage.getItem('mku_registered_users')) || [];
        const existingIndex = registeredUsers.findIndex(u => u.userId === userId);

        if (existingIndex === -1) {
            registeredUsers.push({
                ...currentUser,
                status: 'ACTIVE',
                joined: new Date().toISOString().split('T')[0]
            });
        } else {
            registeredUsers[existingIndex] = {...registeredUsers[existingIndex], name, role };
        }
        localStorage.setItem('mku_registered_users', JSON.stringify(registeredUsers));

        closeAuthModal();
        redirectToDashboard(role);
    });
}

function redirectToDashboard(role) {
    switch (role) {
        case 'STUDENT':
            window.location.href = 'student-dashboard.html';
            break;
        case 'STAFF':
            window.location.href = 'staff-dashboard.html';
            break;
        case 'OFFICER':
            window.location.href = 'officer-dashboard.html';
            break;
        case 'ADMIN':
            window.location.href = 'admin-dashboard.html';
            break;
        default:
            window.location.href = 'student-dashboard.html';
    }
}

// Keep Header UI clean on index.html for public visitors
function updateSessionUI() {
    if (!sessionContainer) return;

    sessionContainer.innerHTML = `
        <button onclick="openAuthModal()" class="btn-sm btn-resolve" style="padding: 0.5rem 1rem;">Sign In / Create Account</button>
    `;
}

// 3. RENDER PUBLIC ITEMS TO HTML
function renderItems(items) {
    if (!itemsGrid) return;
    itemsGrid.innerHTML = '';

    // Only display items that haven't been rejected by an Officer
    const publicItems = items.filter(item => item.approvalStatus !== 'REJECTED');

    if (publicItems.length === 0) {
        itemsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777; padding: 2rem;">No items currently logged in the system.</p>';
        return;
    }

    publicItems.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'item-card';

        let badgeClass = item.reportType === 'FOUND' ? 'badge-found' : 'badge-claimed';
        if (item.reportType && item.reportType.includes('CLAIMED')) {
            badgeClass = 'badge-claimed';
        }

        const regDisplay = item.regNo ? `<p><strong>Reg No:</strong> ${item.regNo}</p>` : '';

        card.innerHTML = `
            <div>
                <span class="item-badge ${badgeClass}">${item.reportType}: ${item.title}</span>
                ${regDisplay}
                <p><strong>Campus:</strong> ${item.campus}</p>
                <p><strong>Location:</strong> ${item.location}</p>
                <p><strong>Details:</strong> ${item.description}</p>
                <p style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">Reported on: ${item.date}</p>
            </div>
            <div style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 0.75rem;">
                <button onclick="handleClaimPrompt('${item.id}')" class="btn-sm btn-resolve" style="width: 100%;">Claim This Item</button>
            </div>
        `;
        itemsGrid.appendChild(card);
    });
}

// Gate claims behind account sign-in
function handleClaimPrompt(itemId) {
    alert('Please sign in or create an account to submit an ownership claim.');
    openAuthModal();
}

// 4. FILTER ITEMS
function filterItems() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCampus = campusFilter ? campusFilter.value : 'all';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    const filtered = itemsDatabase.filter(item => {
        const matchesQuery =
            item.title.toLowerCase().includes(query) ||
            (item.regNo && item.regNo.toLowerCase().includes(query)) ||
            item.description.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query);

        const matchesCampus = (selectedCampus === 'all') || (item.campus === selectedCampus);
        const matchesCategory = (selectedCategory === 'all') || (item.category === selectedCategory);

        return matchesQuery && matchesCampus && matchesCategory;
    });

    renderItems(filtered);
}

// Event Listeners for Filters
if (searchInput) searchInput.addEventListener('input', filterItems);
if (campusFilter) campusFilter.addEventListener('change', filterItems);
if (categoryFilter) categoryFilter.addEventListener('change', filterItems);

// 5. QUICK ID / CITATION LOOKUP FORM HANDLER
if (lookupForm) {
    lookupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const userReg = regInput.value.trim().toUpperCase();
        lookupResult.classList.remove('hidden');

        const foundRecord = itemsDatabase.find(item => item.regNo && item.regNo === userReg);

        if (foundRecord) {
            lookupResult.style.borderLeft = "4px solid #137333";
            lookupResult.innerHTML = `
                <h4 style="color: #137333; margin-bottom: 0.3rem;">Matching Record Found!</h4>
                <p><strong>Item:</strong> ${foundRecord.title}</p>
                <p><strong>Status:</strong> ${foundRecord.reportType}</p>
                <p><strong>Campus Location:</strong> ${foundRecord.campus} (${foundRecord.location})</p>
                <p style="margin-top: 0.5rem; font-size: 0.85rem; color: #555;">Sign in to your dashboard to initiate an official collection claim.</p>
            `;
        } else {
            lookupResult.style.borderLeft = "4px solid #d93025";
            lookupResult.innerHTML = `
                <h4 style="color: #d93025; margin-bottom: 0.3rem;">No Records Found</h4>
                <p>No records matching Registration No. <strong>${userReg}</strong> are currently logged.</p>
            `;
        }
    });
}

// Initialize on Page Load
updateSessionUI();
filterItems();