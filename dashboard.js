// Load active user session
const currentUser = JSON.parse(localStorage.getItem('mku_current_user')) || { name: 'Student User', role: 'STUDENT' };

document.addEventListener('DOMContentLoaded', () => {
    const nameDisplay = document.getElementById('student-name-display');
    if (nameDisplay) {
        nameDisplay.textContent = currentUser.name;
    }

    updateMetrics();
});

// Update Metric Summary Cards
function updateMetrics() {
    const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

    const userLost = items.filter(i => i.reporter === currentUser.name && i.reportType === 'LOST').length;
    const userFound = items.filter(i => i.reporter === currentUser.name && i.reportType === 'FOUND').length;
    const userClaims = items.filter(i => i.claimedBy === currentUser.name).length;
    const userRecovered = items.filter(i => i.reporter === currentUser.name && i.reportType && i.reportType.includes('CLAIMED')).length;

    const lostEl = document.getElementById('count-lost');
    const foundEl = document.getElementById('count-found');
    const claimsEl = document.getElementById('count-claims');
    const recoveredEl = document.getElementById('count-recovered');

    if (lostEl) lostEl.textContent = userLost;
    if (foundEl) foundEl.textContent = userFound;
    if (claimsEl) claimsEl.textContent = userClaims;
    if (recoveredEl) recoveredEl.textContent = userRecovered;
}

// Handle Sidebar Tab Navigation & Content Rendering
function switchTab(tabName) {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
            link.classList.add('active');
        }
    });

    let contentArea = document.getElementById('tab-content-area');
    if (!contentArea) {
        contentArea = document.createElement('div');
        contentArea.id = 'tab-content-area';
        document.querySelector('.dashboard-main').appendChild(contentArea);
    }

    const overviewSection = document.getElementById('tab-overview');

    if (tabName === 'overview') {
        if (overviewSection) overviewSection.style.display = 'block';
        contentArea.innerHTML = '';
    } else if (tabName === 'report-lost' || tabName === 'report-found') {
        if (overviewSection) overviewSection.style.display = 'none';

        const isLost = tabName === 'report-lost';
        const formTitle = isLost ? 'Report a Lost Item' : 'Report a Found Item';
        const selectedType = isLost ? 'LOST' : 'FOUND';

        contentArea.innerHTML = `
            <div class="card-section">
                <div class="card-header">
                    <h2>${formTitle}</h2>
                    <p>Provide accurate details to help security officers or fellow students verify ownership.</p>
                </div>

                <form id="student-report-form" class="report-form-grid" onsubmit="handleStudentReportSubmission(event)">
                    <div class="form-group">
                        <label for="dash-report-type">Report Type:</label>
                        <select id="dash-report-type" required>
                            <option value="LOST" ${selectedType === 'LOST' ? 'selected' : ''}>I Lost an Item</option>
                            <option value="FOUND" ${selectedType === 'FOUND' ? 'selected' : ''}>I Found an Item</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="dash-item-title">Item Name / Title:</label>
                        <input type="text" id="dash-item-title" placeholder="e.g. Student ID Card, HP Pavilion Laptop" required>
                    </div>

                    <div class="form-group">
                        <label for="dash-item-category">Category:</label>
                        <select id="dash-item-category" required>
                            <option value="Student ID / Citation">Student ID / Citation</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Documents">Documents & Keys</option>
                            <option value="Personal Items">Personal Items / Bags</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="dash-item-reg">Registration Number (If ID/Citation):</label>
                        <input type="text" id="dash-item-reg" placeholder="e.g. BIT/2024/52267">
                    </div>

                    <div class="form-group">
                        <label for="dash-item-campus">Campus Location:</label>
                        <select id="dash-item-campus" required>
                            <option value="Thika Main Campus">Thika Main Campus</option>
                            <option value="Nairobi Campus">Nairobi Campus</option>
                            <option value="Parklands Law Campus">Parklands Law Campus</option>
                            <option value="Nakuru Campus">Nakuru Campus</option>
                            <option value="Eldoret Campus">Eldoret Campus</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="dash-item-location">Exact Location Lost/Found:</label>
                        <input type="text" id="dash-item-location" placeholder="e.g. Science Complex Room 104, Library..." required>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="dash-item-description">Identifying Details / Description:</label>
                        <textarea id="dash-item-description" rows="3" placeholder="Provide distinct features (color, brand, scratches, sticker marks)..." required style="padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;"></textarea>
                    </div>

                    <div style="grid-column: 1 / -1;">
                        <button type="submit" class="btn btn-primary">Submit Report to Security Desk</button>
                    </div>
                </form>
            </div>
        `;
    } else if (tabName === 'browse') {
        if (overviewSection) overviewSection.style.display = 'none';
        const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
        const approvedItems = items.filter(i => i.approvalStatus !== 'REJECTED');

        let html = `
            <div class="card-section">
                <h3>Browse Active Campus Items</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">All verified lost and found property across MKU campuses.</p>
        `;

        if (approvedItems.length === 0) {
            html += `<p style="color: #777;">No items currently logged.</p>`;
        } else {
            html += `<div class="items-grid">`;
            approvedItems.forEach(item => {
                html += `
                    <div class="item-card">
                        <div>
                            <span class="item-badge badge-found">${item.reportType}: ${item.title}</span>
                            <p><strong>Campus:</strong> ${item.campus}</p>
                            <p><strong>Location:</strong> ${item.location}</p>
                            <p><strong>Details:</strong> ${item.description}</p>
                        </div>
                        <div style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 0.75rem;">
                            <button onclick="claimItem('${item.id}')" class="btn-sm btn-resolve" style="width: 100%;">Claim Item</button>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
        contentArea.innerHTML = html;

    } else if (tabName === 'my-reports') {
        if (overviewSection) overviewSection.style.display = 'none';
        const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
        const myReports = items.filter(i => i.reporter === currentUser.name);

        let html = `
            <div class="card-section">
                <h3>My Submitted Reports</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">Track the approval status of your filed items.</p>
        `;

        if (myReports.length === 0) {
            html += `<p style="color: #777;">You haven't submitted any reports yet.</p>`;
        } else {
            html += `<div class="items-grid">`;
            myReports.forEach(item => {
                const statusColor = item.approvalStatus === 'APPROVED' ? '#137333' : item.approvalStatus === 'REJECTED' ? '#d93025' : '#e37400';
                html += `
                    <div class="item-card">
                        <div>
                            <span class="item-badge" style="background: #f1f3f4; color: #333;">${item.reportType}</span>
                            <h4>${item.title}</h4>
                            <p><strong>Campus:</strong> ${item.campus}</p>
                            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 700;">${item.approvalStatus || 'PENDING'}</span></p>
                        </div>
                        <div style="margin-top: 1rem; border-top: 1px solid #eee; padding-top: 0.75rem;">
                            <button onclick="deleteMyReport('${item.id}')" class="btn-sm btn-delete" style="width: 100%;">Delete Report</button>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
        contentArea.innerHTML = html;

    } else if (tabName === 'my-claims') {
        if (overviewSection) overviewSection.style.display = 'none';
        const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
        const myClaims = items.filter(i => i.claimedBy === currentUser.name);

        let html = `
            <div class="card-section">
                <h3>My Ownership Claims</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">Items you have initiated a recovery claim for.</p>
        `;

        if (myClaims.length === 0) {
            html += `<p style="color: #777;">You have no active claims. Browse items and click 'Claim Item' to start a request.</p>`;
        } else {
            html += `<div class="items-grid">`;
            myClaims.forEach(item => {
                html += `
                    <div class="item-card">
                        <div>
                            <span class="item-badge badge-claimed">CLAIM SUBMITTED</span>
                            <h4>${item.title}</h4>
                            <p><strong>Campus Desk:</strong> ${item.campus} Security Desk</p>
                            <p style="margin-top: 0.5rem; font-size: 0.85rem; color: #137333;">Visit security desk with your student ID to complete physical pickup.</p>
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        html += `</div>`;
        contentArea.innerHTML = html;

    } else if (tabName === 'notifications') {
        if (overviewSection) overviewSection.style.display = 'none';
        contentArea.innerHTML = `
            <div class="card-section">
                <h3>Notifications & Security Alerts</h3>
                <div style="margin-top: 1rem;">
                    <div style="background: #f0fdf4; border-left: 4px solid #137333; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                        <h4 style="color: #137333;">Welcome to MKU Lost & Found Portal</h4>
                        <p style="font-size: 0.9rem; color: #333; margin-top: 0.3rem;">Your account is active. You can report missing identification cards or browse retrieved campus assets securely.</p>
                    </div>
                </div>
            </div>
        `;
    } else if (tabName === 'profile') {
        if (overviewSection) overviewSection.style.display = 'none';
        contentArea.innerHTML = `
            <div class="card-section">
                <h3>My Student Profile</h3>
                <div style="margin-top: 1rem; font-size: 0.95rem; line-height: 1.8;">
                    <p><strong>Full Name:</strong> ${currentUser.name}</p>
                    <p><strong>Account Role:</strong> Student</p>
                    <p><strong>Portal Session:</strong> Active</p>
                </div>
            </div>
        `;
    }
}

// Handle Student Report Form Submission
function handleStudentReportSubmission(e) {
    e.preventDefault();

    let itemsDatabase = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

    const newItem = {
        id: 'ITEM-' + Date.now(),
        reportType: document.getElementById('dash-report-type').value,
        title: document.getElementById('dash-item-title').value.trim(),
        category: document.getElementById('dash-item-category').value,
        regNo: document.getElementById('dash-item-reg').value.trim().toUpperCase(),
        campus: document.getElementById('dash-item-campus').value,
        location: document.getElementById('dash-item-location').value.trim(),
        description: document.getElementById('dash-item-description').value.trim(),
        reporter: currentUser.name,
        approvalStatus: 'PENDING',
        date: new Date().toISOString().split('T')[0]
    };

    itemsDatabase.unshift(newItem);
    localStorage.setItem('mku_lost_found_items', JSON.stringify(itemsDatabase));

    alert('Success! Your report has been submitted to the MKU Security & Lost Found queue.');
    switchTab('overview');
    updateMetrics();
}

// Claim an item as student
function claimItem(itemId) {
    let itemsDatabase = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
    itemsDatabase = itemsDatabase.map(item => {
        if (item.id === itemId) {
            item.claimedBy = currentUser.name;
        }
        return item;
    });
    localStorage.setItem('mku_lost_found_items', JSON.stringify(itemsDatabase));
    alert('Ownership claim registered! Check your "My Claims & Status" tab for pickup instructions.');
    updateMetrics();
}

// Delete student's own report
function deleteMyReport(itemId) {
    if (confirm('Are you sure you want to delete this report?')) {
        let itemsDatabase = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
        itemsDatabase = itemsDatabase.filter(item => item.id !== itemId);
        localStorage.setItem('mku_lost_found_items', JSON.stringify(itemsDatabase));
        switchTab('my-reports');
        updateMetrics();
    }
}