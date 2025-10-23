import apiClient from './api';

/**
 * Servicio de Autenticación
 * Maneja login, logout y gestión de tokens JWT
 */

export const authService = {
  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} Tokens de autenticación
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/token/', {
        email,  // Ahora el backend acepta 'email'
        password,
      });
      
      const { access, refresh } = response.data;
      
      // Guardar tokens en localStorage
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Obtener el token de acceso
   * @returns {string|null}
   */
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },
};
