import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Callbacks a ejecutar antes del logout (para cierre de turno automático)
  const preLogoutCallbacksRef = useRef([]);

  useEffect(() => {
    // Verificar si hay un token y cargar datos del usuario
    const token = authService.getAccessToken();
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData); // Incluye el rol
    } catch (error) {
      // Si falla, limpiar tokens
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user); // Guardar user con rol
      return response;
    } catch (error) {
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
    if (!user) return false;
    return Array.isArray(roles) ? roles.includes(user.rol) : user.rol === roles;
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
