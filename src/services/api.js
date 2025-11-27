import axios from 'axios';

// Configuración base de Axios para comunicación con la API Django
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

console.log('🔧 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Bypass ngrok warning page
  },
});

// Interceptor para agregar el token JWT a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    console.log('📤 Request to:', config.url);
    console.log('🔑 Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Authorization header added');
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response from:', response.config.url, 'Status:', response.status);
    return response;
  },
  async (error) => {
    console.error('❌ Response error:', error.response?.status, error.config?.url);
    console.error('Error details:', error.response?.data);

    const originalRequest = error.config;

    // Si el token expiró (401) y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 Token expired, attempting refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('🔄 Refreshing token...');
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);
          console.log('✅ Token refreshed successfully');

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        } else {
          console.log('⚠️ No refresh token found');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Si falla el refresh, limpiar tokens y redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
