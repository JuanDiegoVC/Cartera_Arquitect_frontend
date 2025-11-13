import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './authContextCreator';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar
    const token = authService.getAccessToken();
    if (token) {
      // Aquí podrías decodificar el JWT para obtener info del usuario
      setUser({ isAuthenticated: true });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser({ isAuthenticated: true, ...data });
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
