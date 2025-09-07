// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    const currentAdmin = checkAdminAuth();
    if (!currentAdmin) return;
    
    // Initialize admin dashboard
    initializeAdminDashboard(currentAdmin);
    setupAdminNavigation();
    loadDashboardData();
});

function checkAdminAuth() {
    const currentAdmin = localStorage.getItem('currentAdmin');
    if (!currentAdmin) {
        window.location.href = 'admin-login.html';
        return null;
    }
    return JSON.parse(currentAdmin);
}

function initializeAdminDashboard(admin) {
    // Update admin name in header
    document.getElementById('adminName').textContent = admin.fullName;
    
    // Load initial data
    loadOverviewMetrics();
    loadRecentActivities();
    loadSystemStatus();
}

function setupAdminNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.admin-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('href').substring(1);
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link and target section
            this.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Load section-specific data
                loadSectionData(targetSection);
            }
        });
    });
}

function loadSectionData(section) {
    switch (section) {
        case 'users':
            loadUsersData();
            break;
        case 'dustbins':
            loadDustbinsData();
            break;
        case 'payments':
            loadPaymentsData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

function loadDashboardData() {
    loadOverviewMetrics();
    loadRecentActivities();
    loadSystemStatus();
}

function loadOverviewMetrics() {
    const users = getStoredUsers();
    const transactions = getStoredTransactions();
    const dustbins = getStoredDustbins();
    
    // Calculate metrics
    const totalUsers = users.length;
    const totalWaste = transactions.reduce((sum, t) => sum + t.weight, 0);
    const totalPayments = transactions.reduce((sum, t) => sum + t.amount, 0);
    const activeDustbins = dustbins.filter(d => d.status === 'active').length;
    
    // Update metric cards
    document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
    document.getElementById('totalWasteCollected').textContent = `${totalWaste.toFixed(1)} kg`;
    document.getElementById('totalPayments').textContent = `₹${totalPayments.toLocaleString()}`;
    document.getElementById('activeDustbins').textContent = activeDustbins;
    
    // Update change indicators (simulate growth)
    updateMetricChanges();
}

function updateMetricChanges() {
    const changes = ['+12%', '+8%', '+15%', '2 under maintenance'];
    const changeElements = document.querySelectorAll('.metric-change');
    
    changeElements.forEach((element, index) => {
        if (changes[index]) {
            element.textContent = changes[index];
        }
    });
}

function loadRecentActivities() {
    const activities = [
        {
            icon: 'fas fa-user-plus',
            text: 'New user registered: Raj Kumar',
            time: '2 minutes ago'
        },
        {
            icon: 'fas fa-exclamation-triangle',
            text: 'Dustbin DB003 needs maintenance',
            time: '15 minutes ago'
        },
        {
            icon: 'fas fa-money-check-alt',
            text: 'Payment processed: ₹250 to Priya Sharma',
            time: '1 hour ago'
        },
        {
            icon: 'fas fa-trash',
            text: 'Waste disposal: 3.5 kg at DB001',
            time: '2 hours ago'
        }
    ];
    
    const activityList = document.querySelector('#overview .activity-list');
    if (activityList) {
        activityList.innerHTML = '';
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <i class="${activity.icon}"></i>
                <div class="activity-details">
                    <p>${activity.text}</p>
                    <span>${activity.time}</span>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }
}

function loadSystemStatus() {
    const statusItems = [
        { name: 'Database Connection', status: 'active', text: 'Online' },
        { name: 'Payment Gateway', status: 'active', text: 'Active' },
        { name: 'IoT Sensors', status: 'warning', text: '2 Offline' },
        { name: 'Backup System', status: 'active', text: 'Updated' }
    ];
    
    const systemStatus = document.querySelector('.system-status');
    if (systemStatus) {
        systemStatus.innerHTML = '';
        
        statusItems.forEach(item => {
            const statusItem = document.createElement('div');
            statusItem.className = 'status-item';
            statusItem.innerHTML = `
                <span class="status-indicator ${item.status}"></span>
                <span>${item.name}</span>
                <span class="status-text">${item.text}</span>
            `;
            systemStatus.appendChild(statusItem);
        });
    }
}

function loadUsersData() {
    const users = getStoredUsers();
    const usersTable = document.getElementById('usersTable');
    
    if (usersTable) {
        usersTable.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>****-****-${user.aadhar.slice(-4)}</td>
                <td>+91 ${user.phone}</td>
                <td>₹${user.totalEarnings}</td>
                <td>${user.totalWaste} kg</td>
                <td><span class="status-${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
                <td>
                    <button class="action-btn" onclick="viewUser('${user.id}')"><i class="fas fa-eye"></i></button>
                    <button class="action-btn" onclick="editUser('${user.id}')"><i class="fas fa-edit"></i></button>
                    <button class="action-btn danger" onclick="suspendUser('${user.id}')"><i class="fas fa-ban"></i></button>
                </td>
            `;
            usersTable.appendChild(row);
        });
    }
    
    // Setup user search and filter
    setupUserSearch(users);
}

function setupUserSearch(users) {
    const searchInput = document.getElementById('userSearch');
    const filterSelect = document.getElementById('userFilter');
    
    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        
        let filteredUsers = [...users];
        
        // Apply search filter
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(user => 
                user.fullName.toLowerCase().includes(searchTerm) ||
                user.id.toLowerCase().includes(searchTerm) ||
                user.phone.includes(searchTerm)
            );
        }
        
        // Apply status filter
        if (filterValue !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.status === filterValue);
        }
        
        // Update table
        updateUsersTable(filteredUsers);
    }
    
    if (searchInput) searchInput.addEventListener('input', filterUsers);
    if (filterSelect) filterSelect.addEventListener('change', filterUsers);
}

function updateUsersTable(users) {
    const usersTable = document.getElementById('usersTable');
    if (!usersTable) return;
    
    usersTable.innerHTML = '';
    
    if (users.length === 0) {
        usersTable.innerHTML = '<tr><td colspan="8" class="no-data">No users found matching the criteria.</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>****-****-${user.aadhar.slice(-4)}</td>
            <td>+91 ${user.phone}</td>
            <td>₹${user.totalEarnings}</td>
            <td>${user.totalWaste} kg</td>
            <td><span class="status-${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span></td>
            <td>
                <button class="action-btn" onclick="viewUser('${user.id}')"><i class="fas fa-eye"></i></button>
                <button class="action-btn" onclick="editUser('${user.id}')"><i class="fas fa-edit"></i></button>
                <button class="action-btn danger" onclick="suspendUser('${user.id}')"><i class="fas fa-ban"></i></button>
            </td>
        `;
        usersTable.appendChild(row);
    });
}

function loadDustbinsData() {
    const dustbins = getStoredDustbins();
    // Dustbin cards are already in HTML, this would update them with real data
    console.log('Loading dustbins data:', dustbins);
}

function loadPaymentsData() {
    const transactions = getStoredTransactions();
    const paymentsTable = document.getElementById('paymentsTable');
    
    if (paymentsTable) {
        paymentsTable.innerHTML = '';
        
        // Sort by date, newest first
        const sortedTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        sortedTransactions.forEach(transaction => {
            const user = getStoredUsers().find(u => u.id === transaction.userId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.id}</td>
                <td>${user ? user.fullName : 'Unknown User'}</td>
                <td>₹${transaction.amount}</td>
                <td>${transaction.weight} kg</td>
                <td>${formatDate(transaction.date)}</td>
                <td><span class="status-${transaction.status}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span></td>
                <td>
                    ${transaction.status === 'pending' ? 
                        `<button class="btn-success" onclick="approvePayment('${transaction.id}')">Approve</button>
                         <button class="btn-danger" onclick="rejectPayment('${transaction.id}')">Reject</button>` :
                        `<button class="btn-secondary" onclick="viewPayment('${transaction.id}')">View</button>`
                    }
                </td>
            `;
            paymentsTable.appendChild(row);
        });
    }
    
    // Update payment summary
    updatePaymentSummary(transactions);
}

function updatePaymentSummary(transactions) {
    const pendingTransactions = transactions.filter(t => t.status === 'pending');
    const todayTransactions = transactions.filter(t => {
        const today = new Date().toDateString();
        const transactionDate = new Date(t.date).toDateString();
        return transactionDate === today && t.status === 'paid';
    });
    const failedTransactions = transactions.filter(t => t.status === 'failed');
    
    const summaryCards = document.querySelectorAll('.summary-card');
    if (summaryCards.length >= 3) {
        // Pending payments
        summaryCards[0].querySelector('.amount').textContent = 
            `₹${pendingTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`;
        summaryCards[0].querySelector('span').textContent = 
            `${pendingTransactions.length} transactions`;
        
        // Processed today
        summaryCards[1].querySelector('.amount').textContent = 
            `₹${todayTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`;
        summaryCards[1].querySelector('span').textContent = 
            `${todayTransactions.length} transactions`;
        
        // Failed payments
        summaryCards[2].querySelector('.amount').textContent = 
            `₹${failedTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`;
        summaryCards[2].querySelector('span').textContent = 
            `${failedTransactions.length} transactions`;
    }
}

function loadAnalyticsData() {
    // Analytics charts would be implemented here
    console.log('Loading analytics data...');
}

function loadSettingsData() {
    // Load current settings
    const settings = getSystemSettings();
    
    document.getElementById('ratePerKg').value = settings.ratePerKg;
    document.getElementById('minPayout').value = settings.minPayout;
    document.getElementById('paymentSchedule').value = settings.paymentSchedule;
    document.getElementById('autoApprove').checked = settings.autoApprove;
    document.getElementById('smsNotifications').checked = settings.smsNotifications;
    document.getElementById('maintenanceThreshold').value = settings.maintenanceThreshold;
}

// Admin action functions
function viewUser(userId) {
    const user = getStoredUsers().find(u => u.id === userId);
    if (!user) return;
    
    showUserModal(user, 'view');
}

function editUser(userId) {
    const user = getStoredUsers().find(u => u.id === userId);
    if (!user) return;
    
    showUserModal(user, 'edit');
}

function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].status = users[userIndex].status === 'active' ? 'suspended' : 'active';
            localStorage.setItem('users', JSON.stringify(users));
            loadUsersData();
            showAdminNotification(`User ${users[userIndex].status === 'active' ? 'activated' : 'suspended'} successfully`, 'success');
        }
    }
}

function showUserModal(user, mode) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const isEditable = mode === 'edit';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>${mode === 'edit' ? 'Edit' : 'View'} User Details</h3>
            <div class="user-details">
                <div class="detail-group">
                    <label>Full Name:</label>
                    ${isEditable ? `<input type="text" value="${user.fullName}" id="modalUserName">` : `<span>${user.fullName}</span>`}
                </div>
                <div class="detail-group">
                    <label>Aadhar Number:</label>
                    <span>${user.aadhar}</span>
                </div>
                <div class="detail-group">
                    <label>Phone:</label>
                    ${isEditable ? `<input type="text" value="${user.phone}" id="modalUserPhone">` : `<span>${user.phone}</span>`}
                </div>
                <div class="detail-group">
                    <label>Address:</label>
                    ${isEditable ? `<textarea id="modalUserAddress">${user.address}</textarea>` : `<span>${user.address}</span>`}
                </div>
                <div class="detail-group">
                    <label>Total Earnings:</label>
                    <span>₹${user.totalEarnings}</span>
                </div>
                <div class="detail-group">
                    <label>Total Waste:</label>
                    <span>${user.totalWaste} kg</span>
                </div>
                <div class="detail-group">
                    <label>Status:</label>
                    ${isEditable ? 
                        `<select id="modalUserStatus">
                            <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="suspended" ${user.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                        </select>` : 
                        `<span class="status-${user.status}">${user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>`
                    }
                </div>
            </div>
            ${isEditable ? 
                `<div class="modal-actions">
                    <button class="btn-primary" onclick="saveUserChanges('${user.id}')">Save Changes</button>
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                </div>` : ''
            }
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.remove();
    
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

function saveUserChanges(userId) {
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].fullName = document.getElementById('modalUserName').value;
        users[userIndex].phone = document.getElementById('modalUserPhone').value;
        users[userIndex].address = document.getElementById('modalUserAddress').value;
        users[userIndex].status = document.getElementById('modalUserStatus').value;
        
        localStorage.setItem('users', JSON.stringify(users));
        loadUsersData();
        
        document.querySelector('.modal').remove();
        showAdminNotification('User updated successfully', 'success');
    }
}

function approvePayment(transactionId) {
    updatePaymentStatus(transactionId, 'paid');
}

function rejectPayment(transactionId) {
    if (confirm('Are you sure you want to reject this payment?')) {
        updatePaymentStatus(transactionId, 'failed');
    }
}

function updatePaymentStatus(transactionId, status) {
    const transactions = getStoredTransactions();
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex !== -1) {
        transactions[transactionIndex].status = status;
        localStorage.setItem('transactions', JSON.stringify(transactions));
        loadPaymentsData();
        showAdminNotification(`Payment ${status === 'paid' ? 'approved' : 'rejected'} successfully`, 'success');
    }
}

function saveSettings() {
    const settings = {
        ratePerKg: parseFloat(document.getElementById('ratePerKg').value),
        minPayout: parseFloat(document.getElementById('minPayout').value),
        paymentSchedule: document.getElementById('paymentSchedule').value,
        autoApprove: document.getElementById('autoApprove').checked,
        smsNotifications: document.getElementById('smsNotifications').checked,
        maintenanceThreshold: parseInt(document.getElementById('maintenanceThreshold').value)
    };
    
    localStorage.setItem('systemSettings', JSON.stringify(settings));
    showAdminNotification('Settings saved successfully', 'success');
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        localStorage.removeItem('systemSettings');
        loadSettingsData();
        showAdminNotification('Settings reset to default', 'success');
    }
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'admin-login.html';
    }
}

// Utility functions
function getStoredUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function getStoredTransactions() {
    const transactions = localStorage.getItem('transactions');
    return transactions ? JSON.parse(transactions) : [];
}

function getStoredDustbins() {
    const dustbins = localStorage.getItem('dustbins');
    return dustbins ? JSON.parse(dustbins) : [];
}

function getSystemSettings() {
    const settings = localStorage.getItem('systemSettings');
    if (!settings) {
        const defaultSettings = {
            ratePerKg: 5,
            minPayout: 10,
            paymentSchedule: 'weekly',
            autoApprove: true,
            smsNotifications: true,
            maintenanceThreshold: 80
        };
        localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
        return defaultSettings;
    }
    return JSON.parse(settings);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAdminNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Export functions for global access
window.AdminDashboard = {
    viewUser,
    editUser,
    suspendUser,
    approvePayment,
    rejectPayment,
    saveSettings,
    resetSettings,
    adminLogout
};