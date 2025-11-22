// js/auth.js

class AuthManager {
    constructor() {
        this.currentTab = 'login';
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupLoginForm();
        this.setupRegisterForm();
        this.checkAuthentication();
    }

    checkAuthentication() {
        if (Utils.isAuthenticated()) {
            window.location.href = 'dashboard.html';
        }
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const authForms = document.querySelectorAll('.auth-form');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                authForms.forEach(form => form.classList.remove('active'));
                document.getElementById(`${targetTab}Form`).classList.add('active');
                
                this.currentTab = targetTab;
                Utils.hideMessage();
            });
        });
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        const confirmPasswordInput = document.getElementById('registerConfirmPassword');
        const passwordInput = document.getElementById('registerPassword');
        
        confirmPasswordInput.addEventListener('input', () => {
            this.validatePasswordMatch();
        });
        
        passwordInput.addEventListener('input', () => {
            this.validatePasswordMatch();
        });
    }

    validatePasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const confirmInput = document.getElementById('registerConfirmPassword');
        
        if (confirmPassword && password !== confirmPassword) {
            confirmInput.style.borderColor = 'var(--error-color)';
            return false;
        } else {
            confirmInput.style.borderColor = '';
            return true;
        }
    }

    async handleLogin() {
        const form = document.getElementById('loginForm');
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (!submitButton.getAttribute('data-original-text')) {
            submitButton.setAttribute('data-original-text', submitButton.innerHTML);
        }
        
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email').trim(),
            password: formData.get('password')
        };

        if (!Utils.isValidEmail(credentials.email)) {
            Utils.showMessage('Por favor ingresa un email válido', 'error');
            return;
        }

        if (!Utils.isValidPassword(credentials.password)) {
            Utils.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            Utils.setLoading(submitButton, true);
            
            const response = await API.loginUser(credentials);
            
            // Manejar la respuesta según la estructura real del backend
            if (response.user && response.token) {
                Utils.saveToStorage('currentUser', response.user);
                Utils.saveToStorage('authToken', response.token);
                
                Utils.showMessage(`¡Bienvenido ${response.user.name}!`, 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                throw new Error('Respuesta del servidor inválida');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            Utils.showMessage(error.message || 'Error al iniciar sesión', 'error');
        } finally {
            Utils.setLoading(submitButton, false);
        }
    }

    async handleRegister() {
        const form = document.getElementById('registerForm');
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (!submitButton.getAttribute('data-original-text')) {
            submitButton.setAttribute('data-original-text', submitButton.innerHTML);
        }
        
        const formData = new FormData(form);
        const userData = {
            name: Utils.sanitizeInput(formData.get('name').trim()),
            username: Utils.sanitizeInput(formData.get('username').trim()),
            email: formData.get('email').trim(),
            password: formData.get('password')
        };

        const confirmPassword = formData.get('confirmPassword');

        if (!userData.name || userData.name.length < 2) {
            Utils.showMessage('El nombre debe tener al menos 2 caracteres', 'error');
            return;
        }

        if (!userData.username || userData.username.length < 3) {
            Utils.showMessage('El usuario debe tener al menos 3 caracteres', 'error');
            return;
        }

        if (!Utils.isValidEmail(userData.email)) {
            Utils.showMessage('Por favor ingresa un email válido', 'error');
            return;
        }

        if (!Utils.isValidPassword(userData.password)) {
            Utils.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        if (userData.password !== confirmPassword) {
            Utils.showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            Utils.setLoading(submitButton, true);
            
            const response = await API.registerUser(userData);
            
            // Manejar la respuesta según la estructura real del backend
            if (response.message && response.user) {
                Utils.showMessage(response.message || '¡Cuenta creada exitosamente! Por favor inicia sesión.', 'success');
                
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                    form.reset();
                }, 2000);
            } else {
                throw new Error('Respuesta del servidor inválida');
            }
            
        } catch (error) {
            console.error('Register error:', error);
            Utils.showMessage(error.message || 'Error al crear la cuenta', 'error');
        } finally {
            Utils.setLoading(submitButton, false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});