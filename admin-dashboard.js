// Load active admin session
const currentAdmin = JSON.parse(localStorage.getItem('mku_current_user')) || { name: 'System Admin', role: 'ADMIN' };

document.addEventListener('DOMContentLoaded', () => {
    const nameDisplay = document.getElementById('admin-name-display');
    if (nameDisplay) {
        nameDisplay.textContent = currentAdmin.name;
    }

    updateAdminMetrics();
    loadAdminTab('users');
});

// Update Summary Metric Cards
function updateAdminMetrics() {
    const users = JSON.parse(localStorage.getItem('mku_registered_users')) || [];
    const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

    const officers = users.filter(u => u.role === 'OFFICER').length;

    document.getElementById('admin-count-users').textContent = users.length;
    document.getElementById('admin-count-officers').textContent = officers;
    document.getElementById('admin-count-items').textContent = items.length;
}

// Handle Sidebar Navigation
function switchAdminTab(tabName) {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(tabName)) {
            link.classList.add('active');
        }
    });

    loadAdminTab(tabName);
}

// Render Tab Views
function loadAdminTab(tabName) {
    const contentArea = document.getElementById('admin-content-area');
    const sectionTitle = document.getElementById('admin-section-title');

    if (tabName === 'users') {
        sectionTitle.textContent = 'Registered Portal Accounts & Roles';
        const users = JSON.parse(localStorage.getItem('mku_registered_users')) || [];

        if (users.length === 0) {
            contentArea.innerHTML = '<p style="color: #666;">No registered users found yet. Accounts created via the homepage will appear here.</p>';
            return;
        }

        let tableHTML = `
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                    <tr style="background-color: var(--mku-navy); color: white;">
                        <th style="padding: 0.75rem;">Reg / Staff ID</th>
                        <th style="padding: 0.75rem;">Full Name</th>
                        <th style="padding: 0.75rem;">Assigned Role</th>
                        <th style="padding: 0.75rem;">Status</th>
                        <th style="padding: 0.75rem;">Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach(user => {
            const statusColor = user.status === 'SUSPENDED' ? '#d93025' : '#137333';
            tableHTML += `
                <tr style="border-bottom: 1px solid #e1e4e8;">
                    <td style="padding: 0.75rem; font-weight: 600;">${user.userId}</td>
                    <td style="padding: 0.75rem;">${user.name}</td>
                    <td style="padding: 0.75rem;">
                        <select onchange="changeUserRole('${user.userId}', this.value)" style="padding: 0.3rem; border-radius: 4px; border: 1px solid #ccc;">
                            <option value="STUDENT" ${user.role === 'STUDENT' ? 'selected' : ''}>Student</option>
                            <option value="STAFF" ${user.role === 'STAFF' ? 'selected' : ''}>University Staff</option>
                            <option value="OFFICER" ${user.role === 'OFFICER' ? 'selected' : ''}>Lost & Found Officer</option>
                            <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>System Admin</option>
                        </select>
                    </td>
                    <td style="padding: 0.75rem; color: ${statusColor}; font-weight: 700;">${user.status || 'ACTIVE'}</td>
                    <td style="padding: 0.75rem;">
                        <button class="btn-sm ${user.status === 'SUSPENDED' ? 'btn-resolve' : 'btn-delete'}" onclick="toggleUserStatus('${user.userId}')">
                            ${user.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        contentArea.innerHTML = tableHTML;

    } else if (tabName === 'records') {
        sectionTitle.textContent = 'Master Database Records';
        const items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];

        if (items.length === 0) {
            contentArea.innerHTML = '<p style="color: #666;">No item records in the database.</p>';
            return;
        }

        let tableHTML = `
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
                <thead>
                    <tr style="background-color: var(--mku-navy); color: white;">
                        <th style="padding: 0.75rem;">Item Title</th>
                        <th style="padding: 0.75rem;">Type</th>
                        <th style="padding: 0.75rem;">Campus</th>
                        <th style="padding: 0.75rem;">Approval</th>
                        <th style="padding: 0.75rem;">Action</th>
                    </tr>
                </thead>
                <tbody>
        `;

        items.forEach(item => {
            tableHTML += `
                <tr style="border-bottom: 1px solid #e1e4e8;">
                    <td style="padding: 0.75rem; font-weight: 600;">${item.title}</td>
                    <td style="padding: 0.75rem;">${item.reportType}</td>
                    <td style="padding: 0.75rem;">${item.campus}</td>
                    <td style="padding: 0.75rem;">${item.approvalStatus || 'APPROVED'}</td>
                    <td style="padding: 0.75rem;">
                        <button class="btn-sm btn-delete" onclick="purgeRecord('${item.id}')">Purge Record</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        contentArea.innerHTML = tableHTML;

    } else if (tabName === 'campuses') {
        sectionTitle.textContent = 'Configured MKU Campuses & Property Categories';
        contentArea.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div style="background: #f8f9fa; padding: 1.25rem; border-radius: 6px; border-left: 4px solid var(--mku-navy);">
                    <h4 style="color: var(--mku-navy); margin-bottom: 0.5rem;">Registered Campuses (5)</h4>
                    <ul style="padding-left: 1.2rem; color: #555; line-height: 1.8;">
                        <li>Thika Main Campus</li>
                        <li>Nairobi Campus</li>
                        <li>Parklands Law Campus</li>
                        <li>Nakuru Campus</li>
                        <li>Eldoret Campus</li>
                    </ul>
                </div>
                <div style="background: #f8f9fa; padding: 1.25rem; border-radius: 6px; border-left: 4px solid var(--mku-gold);">
                    <h4 style="color: var(--mku-navy); margin-bottom: 0.5rem;">Active Item Categories (4)</h4>
                    <ul style="padding-left: 1.2rem; color: #555; line-height: 1.8;">
                        <li>Student ID / Citation</li>
                        <li>Electronics</li>
                        <li>Documents & Keys</li>
                        <li>Personal Items / Bags</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Admin User Management Actions
function changeUserRole(userId, newRole) {
    let users = JSON.parse(localStorage.getItem('mku_registered_users')) || [];
    users = users.map(u => {
        if (u.userId === userId) u.role = newRole;
        return u;
    });
    localStorage.setItem('mku_registered_users', JSON.stringify(users));
    updateAdminMetrics();
    alert(`Updated role for ${userId} to ${newRole}.`);
}

function toggleUserStatus(userId) {
    let users = JSON.parse(localStorage.getItem('mku_registered_users')) || [];
    users = users.map(u => {
        if (u.userId === userId) {
            u.status = u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
        }
        return u;
    });
    localStorage.setItem('mku_registered_users', JSON.stringify(users));
    loadAdminTab('users');
}

function purgeRecord(itemId) {
    if (confirm('Permanently delete this record from the master database?')) {
        let items = JSON.parse(localStorage.getItem('mku_lost_found_items')) || [];
        items = items.filter(i => i.id !== itemId);
        localStorage.setItem('mku_lost_found_items', JSON.stringify(items));
        updateAdminMetrics();
        loadAdminTab('records');
    }
}