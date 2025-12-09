// js/api.js

class API {
    // Usar 127.0.0.1 evita ambigüedades IPv4/IPv6 (evita conflictos con otros servidores)
    static BASE_URL = '/api';
    
    // Headers comunes
    static getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (includeAuth) {
            const token = Utils.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }

    // Manejar respuesta de la API
    static async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            
            try {
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorData.message || errorMessage;
                } else {
                    const text = await response.text();
                    if (text) errorMessage = text;
                }
            } catch (e) {
                console.error('Error parsing error response:', e);
            }
            
            throw new Error(errorMessage);
        }
        
        // Si la respuesta es exitosa pero no tiene contenido
        if (response.status === 204) {
            return null;
        }
        
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        
        return response.text();
    }

    // Request genérico con mejor manejo de errores
    static async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(!options.skipAuth),
            ...options
        };

        try {
            console.log(`🔄 Haciendo request a: ${url}`);
            const response = await fetch(url, config);
            const result = await this.handleResponse(response);
            console.log(`✅ Request exitoso: ${url}`);
            return result;
        } catch (error) {
            console.error(`❌ Error en request ${url}:`, error);
            
            // Mejorar mensajes de error para el usuario
            if (error.message.includes('Failed to fetch')) {
                throw new Error('No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:8000');
            }
            
            throw error;
        }
    }

    // ========== USUARIOS ========== //

    // Obtener todos los usuarios
    static async getUsers() {
        return await this.request('/users/');
    }

    // Registrar usuario
    static async registerUser(userData) {
        return await this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            skipAuth: true
        });
    }

    // Login de usuario
    static async loginUser(credentials) {
        return await this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            skipAuth: true
        });
    }

    // ========== NOTAS ========== //

    // Obtener todas las notas
    static async getNotes() {
        return await this.request('/notes/');
    }

    // Obtener notas de un usuario
    static async getUserNotes(userId) {
        return await this.request(`/notes/user/${userId}`);
    }

    // Obtener una nota específica
    static async getNote(noteId) {
        return await this.request(`/notes/${noteId}`);
    }

    // Crear nueva nota
    static async createNote(noteData) {
        return await this.request('/notes/', {
            method: 'POST',
            body: JSON.stringify(noteData)
        });
    }

    // Actualizar nota
    static async updateNote(noteId, noteData) {
        return await this.request(`/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify(noteData)
        });
    }

    // Eliminar nota
    static async deleteNote(noteId) {
        return await this.request(`/notes/${noteId}`, {
            method: 'DELETE'
        });
    }
}

// Mantener API como global para scripts no modularizados (auth.js, etc.)
window.API = API;
