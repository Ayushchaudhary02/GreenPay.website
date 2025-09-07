// Admin Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeAdminAuth();
});

function initializeAdminAuth() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Auto-fill demo credentials for testing
    fillDemoCredentials();
}

function fillDemoCredentials() {
    // This is for demo purposes only
    const usernameField = document.getElementById('adminUsername');
    const passwordField = document.getElementById('adminPassword');
    const roleField = document.getElementById('adminRole');
    
    // Add click handler to demo credentials box
    const demoBox = document.querySelector('.demo-credentials');
    if (demoBox) {
        demoBox.addEventListener('click', function() {
            usernameField.value = 'admin';
            passwordField.value = 'admin123';
            roleField.value = 'super_admin';
        });
        
        // Add cursor pointer style
        demoBox.style.cursor = 'pointer';
        demoBox.title = 'Click to auto-fill credentials';
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const role = document.getElementById('adminRole').value;
    
    // Basic validation
    if (!username || !password || !role) {
        showAdminMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Authenticating...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        const adminUsers = getStoredAdminUsers();
        const admin = adminUsers.find(a => 
            a.username === username && 
            a.password === password && 
            a.role === role
        );
        
        if (admin) {
            // Store admin session
            localStorage.setItem('currentAdmin', JSON.stringify(admin));
            showAdminMessage('Login successful! Redirecting to admin panel...', 'success');
            
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        } else {
            showAdminMessage('Invalid credentials or insufficient privileges', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 2000);
}

function showAdminMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.admin-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `admin-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (document.body.contains(messageDiv)) {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(messageDiv)) {
                    document.body.removeChild(messageDiv);
                }
            }, 300);
        }
    }, 4000);
}

function getStoredAdminUsers() {
    const admins = localStorage.getItem('adminUsers');
    if (!admins) {
        // Create demo admin users
        const demoAdmins = [
            {
                id: 'ADM001',
                username: 'admin',
                password: 'admin123',
                role: 'super_admin',
                fullName: 'System Administrator',
                email: 'admin@greencollect.com',
                permissions: ['all'],
                lastLogin: null,
                createdDate: new Date().toISOString()
            },
            {
                id: 'ADM002',
                username: 'operator',
                password: 'operator123',
                role: 'operator',
                fullName: 'Operations Manager',
                email: 'operator@greencollect.com',
                permissions: ['view_users', 'manage_dustbins', 'process_payments'],
                lastLogin: null,
                createdDate: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('adminUsers', JSON.stringify(demoAdmins));
        return demoAdmins;
    }
    
    return JSON.parse(admins);
}

// Utility function to check admin authentication (used in admin dashboard)
function checkAdminAuth() {
    const currentAdmin = localStorage.getItem('currentAdmin');
    if (!currentAdmin) {
        window.location.href = 'admin-login.html';
        return null;
    }
    return JSON.parse(currentAdmin);
}

// Export for use in other admin scripts
window.AdminAuth = {
    checkAdminAuth: checkAdminAuth
};