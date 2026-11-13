// Load active officer session
const currentOfficer = JSON.parse(localStorage.getItem('mku_current_user')) || { name: 'Security Officer', role: 'OFFICER' };

document.addEventListener('DOMContentLoaded', () => {
    const nameDisplay = document.getElementById('officer-name-display');
    if (nameDisplay) {
        nameDisplay.textContent = currentOfficer.name;
    }

    updateOfficerMetrics();
    loadOfficerQueue('queue');
});

// Update Metric Counts
function updateOfficerMetrics() {
    const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

    const pending = items.filter(i => i.approvalStatus === 'PENDING' || !i.approvalStatus).length;
    const active = items.filter(i => i.approvalStatus === 'APPROVED').length;
    const resolved = items.filter(i => i.reportType && i.reportType.includes('CLAIMED')).length;

    document.getElementById('count-pending').textContent = pending;
    document.getElementById('count-active').textContent = active;
    document.getElementById('count-officer-claims').textContent = '0';
    document.getElementById('count-resolved').textContent = resolved;
}

// Switch Sidebar Tabs
function switchOfficerTab(tabName) {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
            link.classList.add('active');
        }
    });

    loadOfficerQueue(tabName);
}

// Load Content based on Selected Tab
function loadOfficerQueue(tabName) {
    const contentArea = document.getElementById('officer-content-area');
    const sectionTitle = document.getElementById('section-title');
    let items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

    if (tabName === 'queue') {
        sectionTitle.textContent = 'Pending Student Reports (Approval Queue)';
        const pendingItems = items.filter(i => i.approvalStatus === 'PENDING' || !i.approvalStatus);

        if (pendingItems.length === 0) {
            contentArea.innerHTML = '<p style="color: #666; padding: 1rem 0;">No pending reports awaiting approval.</p>';
            return;
        }

        let html = '<div class="items-grid">';
        pendingItems.forEach(item => {
            html += `
                <div class="item-card" style="border-left: 4px solid var(--mku-gold);">
                    <div>
                        <span class="item-badge" style="background: #fef3c7; color: #92400e;">PENDING REVIEW</span>
                        <h4>${item.title} (${item.reportType})</h4>
                        <p><strong>Reporter:</strong> ${item.reporter || 'Student'}</p>
                        <p><strong>Campus:</strong> ${item.campus}</p>
                        <p><strong>Location:</strong> ${item.location}</p>
                        <p><strong>Details:</strong> ${item.description}</p>
                    </div>
                    <div class="admin-actions" style="margin-top: 1rem;">
                        <button class="btn-sm btn-resolve" onclick="approveItem('${item.id}')">Approve Report</button>
                        <button class="btn-sm btn-delete" onclick="rejectItem('${item.id}')">Reject</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        contentArea.innerHTML = html;

    } else if (tabName === 'all-items') {
        sectionTitle.textContent = 'All Logged Campus Items';

        if (items.length === 0) {
            contentArea.innerHTML = '<p style="color: #666; padding: 1rem 0;">No items logged in system database.</p>';
            return;
        }

        let html = '<div class="items-grid">';
        items.forEach(item => {
            html += `
                <div class="item-card">
                    <div>
                        <span class="item-badge badge-found">${item.reportType}</span>
                        <h4>${item.title}</h4>
                        <p><strong>Campus:</strong> ${item.campus}</p>
                        <p><strong>Status:</strong> ${item.approvalStatus || 'APPROVED'}</p>
                        <p><strong>Details:</strong> ${item.description}</p>
                    </div>
                    <div class="admin-actions" style="margin-top: 1rem;">
                        <button class="btn-sm btn-resolve" onclick="markItemClaimed('${item.id}')">Mark Claimed</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        contentArea.innerHTML = html;
    } else {
        sectionTitle.textContent = tabName.replace('-', ' ').toUpperCase();
        contentArea.innerHTML = '<p style="color: #666; padding: 1rem 0;">Module records are currently synchronized with security logs.</p>';
    }
}

// Officer Actions
function approveItem(id) {
    let items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
    items = items.map(i => {
        if (i.id === id) i.approvalStatus = 'APPROVED';
        return i;
    });
    localStorage.setItem('mku_lost_found_items', JSON.stringify(items));
    updateOfficerMetrics();
    loadOfficerQueue('queue');
}

function rejectItem(id) {
    let items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
    items = items.map(i => {
        if (i.id === id) i.approvalStatus = 'REJECTED';
        return i;
    });
    localStorage.setItem('mku_lost_found_items', JSON.stringify(items));
    updateOfficerMetrics();
    loadOfficerQueue('queue');
}

function markItemClaimed(id) {
    let items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
    items = items.map(i => {
        if (i.id === id) i.reportType = 'CLAIMED / RESOLVED';
        return i;
    });
    localStorage.setItem('mku_lost_found_items', JSON.stringify(items));
    updateOfficerMetrics();
    loadOfficerQueue('all-items');
}