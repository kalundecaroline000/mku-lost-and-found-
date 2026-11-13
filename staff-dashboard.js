// Load active staff session
const currentStaff = JSON.parse(localStorage.getItem('mku_current_user')) || { name: 'University Staff', userId: 'STF-001', role: 'STAFF' };

document.addEventListener('DOMContentLoaded', () => {
    const nameDisplay = document.getElementById('staff-name-display');
    const idDisplay = document.getElementById('staff-id-display');

    if (nameDisplay) nameDisplay.textContent = currentStaff.name;
    if (idDisplay) idDisplay.textContent = currentStaff.userId || 'STF';

    updateStaffMetrics();
});

// Update Staff Metric Cards
function updateStaffMetrics() {
    const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

    const staffLost = items.filter(i => i.reporter === currentStaff.name && i.reportType === 'LOST').length;
    const staffFound = items.filter(i => i.reporter === currentStaff.name && i.reportType === 'FOUND').length;
    const staffRecovered = items.filter(i => i.reporter === currentStaff.name && i.reportType && i.reportType.includes('CLAIMED')).length;

    document.getElementById('staff-count-lost').textContent = staffLost;
    document.getElementById('staff-count-found').textContent = staffFound;
    document.getElementById('staff-count-recovered').textContent = staffRecovered;
}

// Switch Sidebar Tabs
function switchStaffTab(tabName) {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
            link.classList.add('active');
        }
    });

    const overviewSection = document.getElementById('tab-overview');
    const contentArea = document.getElementById('staff-content-area');

    if (tabName === 'overview') {
        overviewSection.style.display = 'block';
        contentArea.innerHTML = '';
    } else if (tabName === 'report-lost' || tabName === 'report-found') {
        overviewSection.style.display = 'none';

        const isLost = tabName === 'report-lost';
        const formTitle = isLost ? 'Report Lost Staff / Departmental Property' : 'Log Found Item on Campus';
        const selectedType = isLost ? 'LOST' : 'FOUND';

        contentArea.innerHTML = `
            <div class="card-section">
                <div class="card-header">
                    <h2>${formTitle}</h2>
                    <p>Logged under Staff Account: <strong>${currentStaff.name} (${currentStaff.userId})</strong></p>
                </div>

                <form id="staff-report-form" class="report-form-grid" onsubmit="handleStaffReportSubmission(event)">
                    <div class="form-group">
                        <label for="staff-report-type">Report Type:</label>
                        <select id="staff-report-type" required>
                            <option value="LOST" ${selectedType === 'LOST' ? 'selected' : ''}>Lost Property</option>
                            <option value="FOUND" ${selectedType === 'FOUND' ? 'selected' : ''}>Found Property</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="staff-item-title">Item Name / Asset Description:</label>
                        <input type="text" id="staff-item-title" placeholder="e.g. Staff ID Badge, Office Keys, Dell Latitude..." required>
                    </div>

                    <div class="form-group">
                        <label for="staff-item-category">Category:</label>
                        <select id="staff-item-category" required>
                            <option value="Staff / Departmental Asset">Staff / Departmental Asset</option>
                            <option value="Electronics">Electronics & ICT</option>
                            <option value="Documents">Documents, Files & Keys</option>
                            <option value="Personal Items">Personal Items</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="staff-item-reg">Staff ID / Serial No. (Optional):</label>
                        <input type="text" id="staff-item-reg" placeholder="e.g. STF-092 or Asset Tag">
                    </div>

                    <div class="form-group">
                        <label for="staff-item-campus">Campus Location:</label>
                        <select id="staff-item-campus" required>
                            <option value="Thika Main Campus">Thika Main Campus</option>
                            <option value="Nairobi Campus">Nairobi Campus</option>
                            <option value="Parklands Law Campus">Parklands Law Campus</option>
                            <option value="Nakuru Campus">Nakuru Campus</option>
                            <option value="Eldoret Campus">Eldoret Campus</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="staff-item-location">Office / Lecture Hall Location:</label>
                        <input type="text" id="staff-item-location" placeholder="e.g. Alumni Plaza 3rd Floor, Staff Room..." required>
                    </div>

                    <div class="form-group" style="grid-column: 1 / -1;">
                        <label for="staff-item-description">Identifying Details / Confidentiality Notes:</label>
                        <textarea id="staff-item-description" rows="3" placeholder="Provide distinct features, serial numbers, or custody instructions..." required style="padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;"></textarea>
                    </div>

                    <div style="grid-column: 1 / -1;">
                        <button type="submit" class="btn btn-primary">Submit Staff Report</button>
                    </div>
                </form>
            </div>
        `;
    } else if (tabName === 'my-reports') {
        overviewSection.style.display = 'none';
        const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
        const myItems = items.filter(i => i.reporter === currentStaff.name);

        if (myItems.length === 0) {
            contentArea.innerHTML = `
                <div class="card-section">
                    <h3>My Submitted Staff Reports</h3>
                    <p style="color: #666; margin-top: 1rem;">You have not logged any lost or found items yet.</p>
                </div>
            `;
            return;
        }

        let html = `<div class="card-section"><h3>My Submitted Staff Reports</h3><div class="items-grid" style="margin-top: 1rem;">`;
        myItems.forEach(item => {
            html += `
                <div class="item-card">
                    <div>
                        <span class="item-badge ${item.reportType === 'FOUND' ? 'badge-found' : 'badge-claimed'}">${item.reportType}</span>
                        <h4>${item.title}</h4>
                        <p><strong>Campus:</strong> ${item.campus}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Status:</strong> ${item.approvalStatus || 'PENDING'}</p>
                        <p style="font-size: 0.8rem; color: #888; margin-top: 0.5rem;">Date: ${item.date}</p>
                    </div>
                </div>
            `;
        });
        html += `</div></div>`;
        contentArea.innerHTML = html;
    } else if (tabName === 'staff-notices') {
        overviewSection.style.display = 'none';
        contentArea.innerHTML = `
            <div class="card-section" style="border-top: 4px solid #137333;">
                <h3>📢 Restricted Faculty & Staff Security Notices</h3>
                <p style="color: #666; margin: 0.5rem 0 1.5rem 0;">These announcements are visible strictly to verified MKU Staff accounts.</p>
                
                <div style="background: #f0fdf4; border-left: 4px solid #137333; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
                    <h4 style="color: #137333;">1. End-of-Semester Exam Script Custody</h4>
                    <p style="font-size: 0.9rem; color: #333; margin-top: 0.3rem;">Any misplaced examination booklets or attendance sheets discovered in classrooms should be handed directly to the Examinations Office rather than the general student desk.</p>
                </div>
                <div style="background: #fffbeb; border-left: 4px solid var(--mku-gold); padding: 1rem; border-radius: 4px;">
                    <h4 style="color: #92400e;">2. Staff Smartcard & Parking Pass Replacement</h4>
                    <p style="font-size: 0.9rem; color: #333; margin-top: 0.3rem;">If your staff access card is logged as lost here for more than 48 hours without recovery, request a temporary override pass from HR & Security.</p>
                </div>
            </div>
        `;
    }
}

// Handle Staff Report Form Submission
function handleStaffReportSubmission(e) {
    e.preventDefault();

    let itemsDatabase = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

    const newItem = {
        id: 'ITEM-' + Date.now(),
        reportType: document.getElementById('staff-report-type').value,
        title: document.getElementById('staff-item-title').value.trim(),
        category: document.getElementById('staff-item-category').value,
        regNo: document.getElementById('staff-item-reg').value.trim().toUpperCase(),
        campus: document.getElementById('staff-item-campus').value,
        location: document.getElementById('staff-item-location').value.trim(),
        description: document.getElementById('staff-item-description').value.trim(),
        reporter: currentStaff.name,
        reporterRole: 'STAFF',
        approvalStatus: 'PENDING',
        date: new Date().toISOString().split('T')[0]
    };

    itemsDatabase.unshift(newItem);
    localStorage.setItem('mku_lost_found_items', JSON.stringify(itemsDatabase));

    alert('Staff report logged and forwarded to the Security Officer queue.');
    switchStaffTab('overview');
    updateStaffMetrics();
}