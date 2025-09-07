// User Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthentication();
    
    // Initialize dashboard
    initializeDashboard();
    setupNavigation();
    loadUserData();
    loadTransactions();
    loadDustbinLocations();
});

function checkAuthentication() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'user-login.html';
        return;
    }
}

function initializeDashboard() {
    // Load user information
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update user name in header
    document.getElementById('userName').textContent = currentUser.fullName;
    document.getElementById('userNameHeader').textContent = currentUser.fullName.split(' ')[0];
    
    // Update stats
    document.getElementById('totalEarnings').textContent = `₹${currentUser.totalEarnings.toLocaleString()}`;
    document.getElementById('totalWaste').textContent = `${currentUser.totalWaste} kg`;
    document.getElementById('totalTransactions').textContent = currentUser.totalTransactions;
    document.getElementById('ecoPoints').textContent = currentUser.ecoPoints;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('href').substring(1);
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link and target section
            this.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update profile information
    document.getElementById('profileName').textContent = currentUser.fullName;
    document.getElementById('profileAadhar').textContent = `****-****-${currentUser.aadhar.slice(-4)}`;
    document.getElementById('profilePhone').textContent = `+91 ${currentUser.phone}`;
    document.getElementById('profileAddress').textContent = currentUser.address;
    document.getElementById('profileAccount').textContent = `****-****-****-${currentUser.bankAccount.slice(-4)}`;
    document.getElementById('profileIFSC').textContent = currentUser.ifsc;
    
    // Load recent activity
    loadRecentActivity();
}

function loadRecentActivity() {
    const transactions = getStoredTransactions();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userTransactions = transactions.filter(t => t.userId === currentUser.id)
                                       .sort((a, b) => new Date(b.date) - new Date(a.date))
                                       .slice(0, 3);
    
    const activityContainer = document.getElementById('recentActivity');
    activityContainer.innerHTML = '';
    
    if (userTransactions.length === 0) {
        activityContainer.innerHTML = '<p class="no-data">No recent activity found.</p>';
        return;
    }
    
    userTransactions.forEach(transaction => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const icon = getWasteIcon(transaction.wasteType);
        const timeAgo = getTimeAgo(transaction.date);
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-info">
                <h4>${transaction.wasteType} Waste</h4>
                <p>${transaction.weight} kg • ₹${transaction.amount} • Dustbin #${transaction.dustbinId}</p>
                <span class="activity-time">${timeAgo}</span>
            </div>
        `;
        
        activityContainer.appendChild(activityItem);
    });
}

function loadTransactions() {
    const transactions = getStoredTransactions();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userTransactions = transactions.filter(t => t.userId === currentUser.id)
                                       .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';
    
    if (userTransactions.length === 0) {
        transactionsList.innerHTML = '<tr><td colspan="6" class="no-data">No transactions found.</td></tr>';
        return;
    }
    
    userTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        const statusClass = transaction.status === 'paid' ? 'status-paid' : 
                           transaction.status === 'pending' ? 'status-pending' : 'status-failed';
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.dustbinId}</td>
            <td>${transaction.wasteType}</td>
            <td>${transaction.weight}</td>
            <td>₹${transaction.amount}</td>
            <td><span class="${statusClass}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span></td>
        `;
        
        transactionsList.appendChild(row);
    });
    
    // Setup filters
    setupTransactionFilters(userTransactions);
}

function setupTransactionFilters(transactions) {
    const monthFilter = document.getElementById('monthFilter');
    const typeFilter = document.getElementById('typeFilter');
    
    function applyFilters() {
        const monthValue = monthFilter.value;
        const typeValue = typeFilter.value;
        
        let filteredTransactions = [...transactions];
        
        // Apply month filter
        if (monthValue === 'current') {
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === currentMonth && 
                       transactionDate.getFullYear() === currentYear;
            });
        } else if (monthValue === 'last') {
            const lastMonth = new Date().getMonth() - 1;
            const year = lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
            const month = lastMonth < 0 ? 11 : lastMonth;
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === month && 
                       transactionDate.getFullYear() === year;
            });
        }
        
        // Apply type filter
        if (typeValue !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => 
                t.wasteType.toLowerCase() === typeValue
            );
        }
        
        // Update table
        updateTransactionTable(filteredTransactions);
    }
    
    monthFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
}

function updateTransactionTable(transactions) {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<tr><td colspan="6" class="no-data">No transactions found for the selected filters.</td></tr>';
        return;
    }
    
    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const statusClass = transaction.status === 'paid' ? 'status-paid' : 
                           transaction.status === 'pending' ? 'status-pending' : 'status-failed';
        
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.dustbinId}</td>
            <td>${transaction.wasteType}</td>
            <td>${transaction.weight}</td>
            <td>₹${transaction.amount}</td>
            <td><span class="${statusClass}">${transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</span></td>
        `;
        
        transactionsList.appendChild(row);
    });
}

function loadDustbinLocations() {
    const dustbins = getStoredDustbins();
    // Dustbin locations are already hardcoded in HTML for demo
    // In a real application, this would populate from the dustbins data
}

function editProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Create edit form modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h3>Edit Profile</h3>
            <form id="editProfileForm">
                <div class="form-group">
                    <label for="editName">Full Name</label>
                    <input type="text" id="editName" value="${currentUser.fullName}" required>
                </div>
                <div class="form-group">
                    <label for="editPhone">Phone Number</label>
                    <input type="tel" id="editPhone" value="${currentUser.phone}" maxlength="10" required>
                </div>
                <div class="form-group">
                    <label for="editAddress">Address</label>
                    <textarea id="editAddress" rows="3" required>${currentUser.address}</textarea>
                </div>
                <div class="form-group">
                    <label for="editBankAccount">Bank Account Number</label>
                    <input type="text" id="editBankAccount" value="${currentUser.bankAccount}" required>
                </div>
                <div class="form-group">
                    <label for="editIFSC">IFSC Code</label>
                    <input type="text" id="editIFSC" value="${currentUser.ifsc}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Update Profile</button>
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                </div>
            </form>
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
    
    // Handle form submission
    const editForm = document.getElementById('editProfileForm');
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Update user data
        currentUser.fullName = document.getElementById('editName').value;
        currentUser.phone = document.getElementById('editPhone').value;
        currentUser.address = document.getElementById('editAddress').value;
        currentUser.bankAccount = document.getElementById('editBankAccount').value;
        currentUser.ifsc = document.getElementById('editIFSC').value;
        
        // Update in localStorage
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Update users array
        const users = JSON.parse(localStorage.getItem('users'));
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Refresh profile display
        loadUserData();
        initializeDashboard();
        
        // Show success message and close modal
        showNotification('Profile updated successfully!', 'success');
        modal.remove();
    });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Utility functions
function getStoredTransactions() {
    const transactions = localStorage.getItem('transactions');
    if (!transactions) {
        // Create demo transactions
        const demoTransactions = [
            {
                id: 'TXN001',
                userId: 'USR001',
                dustbinId: 'DB001',
                wasteType: 'Organic',
                weight: 2.5,
                amount: 12.50,
                date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                status: 'paid'
            },
            {
                id: 'TXN002',
                userId: 'USR001',
                dustbinId: 'DB003',
                wasteType: 'Recyclable',
                weight: 1.8,
                amount: 9.00,
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
                status: 'paid'
            },
            {
                id: 'TXN003',
                userId: 'USR001',
                dustbinId: 'DB002',
                wasteType: 'General',
                weight: 3.2,
                amount: 16.00,
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                status: 'pending'
            },
            {
                id: 'TXN004',
                userId: 'USR002',
                dustbinId: 'DB001',
                wasteType: 'Organic',
                weight: 1.5,
                amount: 7.50,
                date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
                status: 'paid'
            }
        ];
        
        localStorage.setItem('transactions', JSON.stringify(demoTransactions));
        return demoTransactions;
    }
    
    return JSON.parse(transactions);
}

function getStoredDustbins() {
    const dustbins = localStorage.getItem('dustbins');
    if (!dustbins) {
        const demoDustbins = [
            {
                id: 'DB001',
                location: 'Main Market Square',
                status: 'active',
                capacity: 65,
                lastEmptied: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                todayCollection: 12.5
            },
            {
                id: 'DB002',
                location: 'School Ground',
                status: 'active',
                capacity: 30,
                lastEmptied: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                todayCollection: 8.2
            },
            {
                id: 'DB003',
                location: 'Community Center',
                status: 'maintenance',
                capacity: 0,
                lastEmptied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                todayCollection: 0
            }
        ];
        
        localStorage.setItem('dustbins', JSON.stringify(demoDustbins));
        return demoDustbins;
    }
    
    return JSON.parse(dustbins);
}

function getWasteIcon(wasteType) {
    switch (wasteType.toLowerCase()) {
        case 'organic':
            return 'fas fa-leaf';
        case 'recyclable':
            return 'fas fa-recycle';
        case 'general':
        default:
            return 'fas fa-trash';
    }
}

function getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 24 * 60) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInMinutes / (24 * 60));
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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