import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Buffer } from "buffer";
import { ThemeProvider } from "./context/ThemeContext";

// Polyfill para Buffer (requerido por @react-pdf/renderer en el navegador)
window.Buffer = Buffer;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
