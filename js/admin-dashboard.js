// Simple Admin Dashboard JavaScript

// Check authentication
const currentAdmin = localStorage.getItem('currentAdmin');
if (!currentAdmin) {
    window.location.href = 'admin-login.html';
}

const admin = JSON.parse(currentAdmin);

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    
    // Update admin name
    document.getElementById('adminName').textContent = admin.fullName;
    
    // Load data
    loadData();
});

// Show section function
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active from nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Show target section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active to clicked link
    event.target.classList.add('active');
}

// Load all data
function loadData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Update overview metrics
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalWaste').textContent = transactions.reduce((sum, t) => sum + parseFloat(t.weight || 0), 0).toFixed(1) + ' kg';
    document.getElementById('totalPayments').textContent = '₹' + transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toLocaleString();
    
    // Load users table
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>+91 ${user.phone}</td>
            <td>₹${user.totalEarnings}</td>
            <td><span class="status-${user.status}">${user.status}</span></td>
            <td>
                <button class="btn-secondary" onclick="viewUser('${user.id}')">View</button>
                <button class="btn-warning" onclick="toggleUser('${user.id}')">${user.status === 'active' ? 'Suspend' : 'Activate'}</button>
            </td>
        `;
        usersTable.appendChild(row);
    });
    
    // Load payments table
    const paymentsTable = document.getElementById('paymentsTable');
    paymentsTable.innerHTML = '';
    
    transactions.forEach(transaction => {
        const user = users.find(u => u.id === transaction.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.id}</td>
            <td>${user ? user.fullName : 'Unknown'}</td>
            <td>₹${transaction.amount}</td>
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td><span class="status-${transaction.status}">${transaction.status}</span></td>
            <td>
                ${transaction.status === 'pending' ? 
                    `<button class="btn-success" onclick="approvePayment('${transaction.id}')">Approve</button>` :
                    `<button class="btn-secondary">Processed</button>`
                }
            </td>
        `;
        paymentsTable.appendChild(row);
    });
}

// User functions
function viewUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    if (user) {
        alert(`User: ${user.fullName}\nPhone: ${user.phone}\nEarnings: ₹${user.totalEarnings}\nStatus: ${user.status}`);
    }
}

function toggleUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].status = users[userIndex].status === 'active' ? 'suspended' : 'active';
        localStorage.setItem('users', JSON.stringify(users));
        loadData();
        showMessage('User status updated', 'success');
    }
}

// Payment functions
function approvePayment(transactionId) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transactionIndex = transactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex !== -1) {
        transactions[transactionIndex].status = 'paid';
        localStorage.setItem('transactions', JSON.stringify(transactions));
        loadData();
        showMessage('Payment approved', 'success');
    }
}

// Logout function
function adminLogout() {
    if (confirm('Logout?')) {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'index.html';
    }
}

// Message function
function showMessage(message, type) {
    const div = document.createElement('div');
    div.innerHTML = `<div style="position:fixed;top:20px;right:20px;background:${type === 'success' ? '#28a745' : '#dc3545'};color:white;padding:15px;border-radius:5px;z-index:1000;">${message}</div>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}