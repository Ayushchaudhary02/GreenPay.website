// Authentication JavaScript for user login and registration

document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication forms
    initializeForms();
    setupValidation();
    loadDemoData();
});

function initializeForms() {
    // Tab switching functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.textContent.toLowerCase();
            switchTab(tab);
        });
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
}

function switchTab(tab) {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    // Remove active class from all tabs and forms
    tabBtns.forEach(btn => btn.classList.remove('active'));
    forms.forEach(form => form.classList.remove('active'));
    
    // Add active class to selected tab and form
    if (tab === 'login') {
        document.querySelector('.tab-btn:first-child').classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else if (tab === 'register') {
        document.querySelector('.tab-btn:last-child').classList.add('active');
        document.getElementById('registerForm').classList.add('active');
    }
}

function setupValidation() {
    // Aadhar number validation
    const aadharInputs = document.querySelectorAll('input[id*="Aadhar"]');
    aadharInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // Only numbers
            if (this.value.length > 12) {
                this.value = this.value.substring(0, 12);
            }
            validateAadhar(this);
        });
    });

    // Phone number validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // Only numbers
            if (this.value.length > 10) {
                this.value = this.value.substring(0, 10);
            }
            validatePhone(this);
        });
    });

    // Password confirmation validation
    const confirmPasswordInput = document.getElementById('regConfirmPassword');
    const passwordInput = document.getElementById('regPassword');
    
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch(passwordInput, this);
        });
        
        passwordInput.addEventListener('input', function() {
            if (confirmPasswordInput.value) {
                validatePasswordMatch(this, confirmPasswordInput);
            }
        });
    }

    // IFSC code validation
    const ifscInput = document.getElementById('regIFSC');
    if (ifscInput) {
        ifscInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
            validateIFSC(this);
        });
    }
}

function validateAadhar(input) {
    const aadhar = input.value;
    const isValid = /^\d{12}$/.test(aadhar);
    
    if (aadhar.length === 12 && !isValid) {
        showFieldError(input, 'Invalid Aadhar number');
    } else {
        clearFieldError(input);
    }
    
    return isValid;
}

function validatePhone(input) {
    const phone = input.value;
    const isValid = /^[6-9]\d{9}$/.test(phone);
    
    if (phone.length === 10 && !isValid) {
        showFieldError(input, 'Invalid phone number');
    } else {
        clearFieldError(input);
    }
    
    return isValid;
}

function validatePasswordMatch(passwordInput, confirmInput) {
    const isMatch = passwordInput.value === confirmInput.value;
    
    if (confirmInput.value && !isMatch) {
        showFieldError(confirmInput, 'Passwords do not match');
    } else {
        clearFieldError(confirmInput);
    }
    
    return isMatch;
}

function validateIFSC(input) {
    const ifsc = input.value;
    const isValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
    
    if (ifsc.length === 11 && !isValid) {
        showFieldError(input, 'Invalid IFSC code format');
    } else {
        clearFieldError(input);
    }
    
    return isValid;
}

function showFieldError(input, message) {
    clearFieldError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #dc3545;
        font-size: 0.8rem;
        margin-top: 0.25rem;
    `;
    
    input.parentNode.appendChild(errorDiv);
    input.style.borderColor = '#dc3545';
}

function clearFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    input.style.borderColor = '#ddd';
}

function handleLogin(e) {
    e.preventDefault();
    
    const aadhar = document.getElementById('loginAadhar').value;
    const password = document.getElementById('loginPassword').value;
    
    // Basic validation
    if (!aadhar || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateAadhar(document.getElementById('loginAadhar'))) {
        showMessage('Please enter a valid 12-digit Aadhar number', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        const users = getStoredUsers();
        const user = users.find(u => u.aadhar === aadhar && u.password === password);
        
        if (user) {
            // Store user session
            localStorage.setItem('currentUser', JSON.stringify(user));
            showMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'user-dashboard.html';
            }, 1500);
        } else {
            showMessage('Invalid credentials. Please try again.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 2000);
}

function handleRegistration(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('regFullName').value,
        aadhar: document.getElementById('regAadhar').value,
        phone: document.getElementById('regPhone').value,
        address: document.getElementById('regAddress').value,
        proofType: document.getElementById('regProof').value,
        proofNumber: document.getElementById('regProofNumber').value,
        bankAccount: document.getElementById('regBankAccount').value,
        ifsc: document.getElementById('regIFSC').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value
    };
    
    // Validation
    if (!validateRegistrationForm(formData)) {
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Check if user already exists
        const users = getStoredUsers();
        const existingUser = users.find(u => u.aadhar === formData.aadhar);
        
        if (existingUser) {
            showMessage('User with this Aadhar number already exists', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'USR' + String(users.length + 1).padStart(3, '0'),
            ...formData,
            registrationDate: new Date().toISOString(),
            status: 'active',
            totalEarnings: 0,
            totalWaste: 0,
            totalTransactions: 0,
            ecoPoints: 0
        };
        
        // Remove confirm password
        delete newUser.confirmPassword;
        
        // Store user
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showMessage('Registration successful! You can now login.', 'success');
        
        setTimeout(() => {
            switchTab('login');
            e.target.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }, 3000);
}

function validateRegistrationForm(data) {
    // Check required fields
    for (const [key, value] of Object.entries(data)) {
        if (!value.trim()) {
            showMessage('Please fill in all fields', 'error');
            return false;
        }
    }
    
    // Validate Aadhar
    if (!validateAadhar(document.getElementById('regAadhar'))) {
        showMessage('Please enter a valid 12-digit Aadhar number', 'error');
        return false;
    }
    
    // Validate phone
    if (!validatePhone(document.getElementById('regPhone'))) {
        showMessage('Please enter a valid 10-digit phone number', 'error');
        return false;
    }
    
    // Validate IFSC
    if (!validateIFSC(document.getElementById('regIFSC'))) {
        showMessage('Please enter a valid IFSC code', 'error');
        return false;
    }
    
    // Validate password match
    if (data.password !== data.confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return false;
    }
    
    // Validate password strength
    if (data.password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    return true;
}

function showMessage(message, type) {
    const modal = document.getElementById('messageModal');
    const content = document.getElementById('messageContent');
    
    content.innerHTML = `
        <div class="message ${type}">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <p>${message}</p>
        </div>
    `;
    
    content.querySelector('.message').style.cssText = `
        text-align: center;
        padding: 2rem;
        color: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;
    
    content.querySelector('.message i').style.cssText = `
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
    `;
    
    modal.style.display = 'block';
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => modal.style.display = 'none';
    
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Auto close success messages
    if (type === 'success') {
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
    }
}

function showForgotPassword() {
    showMessage('Please contact the administrator to reset your password.', 'info');
}

function getStoredUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function loadDemoData() {
    // Check if demo data already exists
    const users = getStoredUsers();
    if (users.length === 0) {
        const demoUsers = [
            {
                id: 'USR001',
                fullName: 'Raj Kumar',
                aadhar: '123456789012',
                phone: '9876543210',
                address: '123 Village Road, District Name, State - 123456',
                proofType: 'aadhar',
                proofNumber: '123456789012',
                bankAccount: '1234567890123456',
                ifsc: 'SBIN0001234',
                password: 'demo123',
                registrationDate: '2024-01-01T00:00:00.000Z',
                status: 'active',
                totalEarnings: 1250,
                totalWaste: 45.5,
                totalTransactions: 23,
                ecoPoints: 455
            },
            {
                id: 'USR002',
                fullName: 'Priya Sharma',
                aadhar: '567890123456',
                phone: '8765432109',
                address: '456 Market Street, Village Center, State - 654321',
                proofType: 'voter',
                proofNumber: 'VOT123456789',
                bankAccount: '6543210987654321',
                ifsc: 'HDFC0001234',
                password: 'demo123',
                registrationDate: '2024-01-05T00:00:00.000Z',
                status: 'active',
                totalEarnings: 890,
                totalWaste: 32.1,
                totalTransactions: 18,
                ecoPoints: 321
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(demoUsers));
    }
}