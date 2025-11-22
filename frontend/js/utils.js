// js/utils.js

class Utils {
    // Mostrar mensajes al usuario
    static showMessage(message, type = 'success') {
        const messageContainer = document.getElementById('messageContainer');
        
        if (!messageContainer) {
            // Crear contenedor si no existe
            const container = document.createElement('div');
            container.id = 'messageContainer';
            container.className = `message-container ${type}`;
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                z-index: 1000;
                max-width: 400px;
                display: none;
            `;
            container.textContent = message;
            document.body.appendChild(container);
            messageContainer = container;
        }
        
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
        messageContainer.style.display = 'block';
        
        // Aplicar colores según el tipo
        if (type === 'success') {
            messageContainer.style.backgroundColor = '#4CAF50';
        } else if (type === 'error') {
            messageContainer.style.backgroundColor = '#f44336';
        } else {
            messageContainer.style.backgroundColor = '#2196F3';
        }
        
        // Auto-ocultar después de 5 segundos para mensajes de éxito
        if (type === 'success') {
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 5000);
        }
    }

    // Ocultar mensaje
    static hideMessage() {
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }

    // Validar email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar contraseña (mínimo 6 caracteres)
    static isValidPassword(password) {
        return password && password.length >= 6;
    }

    // Formatear fecha
    static formatDate(dateString) {
        try {
            const options = { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        } catch (error) {
            return dateString;
        }
    }

    // Sanitizar input (prevenir XSS básico)
    static sanitizeInput(input) {
        if (!input) return '';
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Toggle loading state en botones
    static setLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<div class="loading-spinner"></div> Procesando...';
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
            }
            button.style.opacity = '1';
        }
    }

    // Guardar en localStorage
    static saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
            return false;
        }
    }

    // Obtener de localStorage
    static getFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error obteniendo de localStorage:', error);
            return null;
        }
    }

    // Remover de localStorage
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removiendo de localStorage:', error);
            return false;
        }
    }

    // Verificar si el usuario está autenticado
    static isAuthenticated() {
        const user = this.getFromStorage('currentUser');
        const token = this.getFromStorage('authToken');
        return !!(user && token);
    }

    // Redirigir al dashboard si está autenticado
    static redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = 'dashboard.html';
        }
    }

    // Forzar autenticación
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // Obtener usuario actual
    static getCurrentUser() {
        return this.getFromStorage('currentUser');
    }

    // Obtener token de autenticación
    static getAuthToken() {
        return this.getFromStorage('authToken');
    }

    // Obtener ID del usuario actual
    static getCurrentUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    }

    // Cerrar sesión
    static logout() {
        this.removeFromStorage('currentUser');
        this.removeFromStorage('authToken');
        window.location.href = 'index.html';
    }

    // Limpiar formularios
    static clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }
}

// Añadir estilos para el loading spinner y mensajes
const spinnerStyles = `
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s ease-in-out infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none !important;
    }
    
    .message-container {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .message-container.success {
        background-color: #4CAF50;
    }
    
    .message-container.error {
        background-color: #f44336;
    }
    
    .message-container.info {
        background-color: #2196F3;
    }
`;

// Injectar estilos del spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = spinnerStyles;
document.head.appendChild(styleSheet);