import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Callbacks a ejecutar antes del logout (para cierre de turno automático)
  const preLogoutCallbacksRef = useRef([]);

  useEffect(() => {
    console.log('🔄 AuthContext: Initializing...');
    // Verificar si hay un token y cargar datos del usuario
    const token = authService.getAccessToken();
    console.log('🔑 AuthContext: Token exists:', !!token);
    if (token) {
      loadUser();
    } else {
      console.log('⚠️ AuthContext: No token found, skipping loadUser');
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    console.log('👤 AuthContext: Loading user data...');
    try {
      const userData = await authService.getMe();
      console.log('✅ AuthContext: User data received:', userData);
      console.log('👤 AuthContext: User rol:', userData?.rol);
      console.log('👤 AuthContext: Full user object:', JSON.stringify(userData, null, 2));
      setUser(userData); // Incluye el rol
      console.log('✅ AuthContext: User state updated');
    } catch (error) {
      console.error('❌ AuthContext: Error loading user:', error);
      // Si falla, limpiar tokens
      logout();
    } finally {
      setLoading(false);
      console.log('✅ AuthContext: Loading complete');
    }
  };

  const login = async (email, password) => {
    console.log('🔐 AuthContext: Login attempt for:', email);
    try {
      const response = await authService.login(email, password);
      console.log('✅ AuthContext: Login response:', response);
      console.log('👤 AuthContext: User from login:', response.user);
      console.log('👤 AuthContext: User rol from login:', response.user?.rol);
      setUser(response.user); // Guardar user con rol
      console.log('✅ AuthContext: User state set after login');
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      throw error;
    }
  };

  // Registrar callback para ejecutar antes del logout
  const registerPreLogoutCallback = useCallback((callback) => {
    preLogoutCallbacksRef.current.push(callback);
    // Retornar función para desregistrar
    return () => {
      preLogoutCallbacksRef.current = preLogoutCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  // Logout con ejecución de callbacks
  const logout = async () => {
    console.log('🚪 AuthContext: Logging out');
    // Ejecutar todos los callbacks pre-logout
    for (const callback of preLogoutCallbacksRef.current) {
      try {
        await callback();
      } catch (error) {
        console.error("Error en callback pre-logout:", error);
      }
    }
    
    authService.logout();
    setUser(null);
  };

  // Funciones helper para verificar roles
  const hasRole = (roles) => {
    console.log('🔍 AuthContext: Checking role. User:', user, 'Required roles:', roles);
    if (!user) {
      console.log('⚠️ AuthContext: No user, hasRole returns false');
      return false;
    }
    const result = Array.isArray(roles) ? roles.includes(user.rol) : user.rol === roles;
    console.log('🔍 AuthContext: hasRole result:', result, 'User rol:', user.rol);
    return result;
  };

  const isTaquilla = () => hasRole(["taquilla", "administrador"]);
  const isAdministrador = () => hasRole("administrador");
  const isGerente = () => hasRole("gerente");

  const value = {
    user,
    loading,
    login,
    logout,
    registerPreLogoutCallback,
    isAuthenticated: !!user,
    hasRole,
    isTaquilla,
    isAdministrador,
    isGerente,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
