import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usuariosService } from "../services/usuariosService";
import { authService } from "../services/authService";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // Inicializar con 'light' por defecto (el tema real se cargará de la BD)
  const [theme, setThemeState] = useState("light");
  const [isLoading, setIsLoading] = useState(true);

  // Cargar el tema del usuario desde la API cuando el usuario esté autenticado
  const loadUserTheme = useCallback(async () => {
    const token = authService.getAccessToken();
    if (token) {
      try {
        const response = await usuariosService.getTheme();
        const userTheme = response.tema_preferido || "light";
        setThemeState(userTheme);
        applyTheme(userTheme);
      } catch (error) {
        console.error("Error al cargar tema del usuario:", error);
        // Si falla, usar el tema del localStorage como fallback
        const savedTheme = localStorage.getItem("sotrap-theme") || "light";
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      }
    } else {
      // Usuario no autenticado: usar localStorage o 'light' por defecto
      const savedTheme = localStorage.getItem("sotrap-theme") || "light";
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    }
    setIsLoading(false);
  }, []);

  // Aplicar el tema al documento
  const applyTheme = (newTheme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    // Mantener localStorage como cache local
    localStorage.setItem("sotrap-theme", newTheme);
  };

  // Cargar tema inicial
  useEffect(() => {
    loadUserTheme();
  }, [loadUserTheme]);

  // Escuchar cambios de autenticación para recargar el tema
  useEffect(() => {
    // Escuchar evento de login para recargar el tema del nuevo usuario
    const handleStorageChange = (e) => {
      if (e.key === "sotrap_access_token") {
        loadUserTheme();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadUserTheme]);

  // Función para cambiar el tema (guarda en BD si está autenticado)
  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    const token = authService.getAccessToken();
    if (token) {
      try {
        await usuariosService.updateTheme(newTheme);
      } catch (error) {
        console.error("Error al guardar tema en servidor:", error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Función para recargar el tema (llamar después del login)
  const refreshTheme = () => {
    loadUserTheme();
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    refreshTheme,
    isDark: theme === "dark",
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}
