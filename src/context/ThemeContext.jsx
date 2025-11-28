import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  // Inicializar desde localStorage o usar 'light' por defecto
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("sotrap-theme");
    return savedTheme || "light";
  });

  // Aplicar el tema al documento cuando cambie
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remover clases anteriores
    root.classList.remove("light", "dark");
    
    // Agregar la clase del tema actual
    root.classList.add(theme);
    
    // Guardar en localStorage
    localStorage.setItem("sotrap-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
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
