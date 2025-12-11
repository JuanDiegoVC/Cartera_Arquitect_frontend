import * as React from "react";
import { X } from "lucide-react";

// Context para compartir onOpenChange entre componentes
const DialogContext = React.createContext(null);

/**
 * Componente Dialog/Modal reutilizable
 * Maneja el estado abierto/cerrado y el overlay
 */
export function Dialog({ open, onOpenChange, children }) {
  React.useEffect(() => {
    // Prevenir scroll cuando el modal está abierto
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // Cerrar con tecla Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => onOpenChange(false)}
        />
        
        {/* Content Container */}
        <div className="relative z-50 w-full flex items-center justify-center px-4">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}

export function DialogContent({ children, className = "", showCloseButton = true }) {
  const context = React.useContext(DialogContext);
  
  return (
    <div
      className={`bg-background border rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 relative ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Botón X de cierre - siempre visible en la esquina superior derecha */}
      {showCloseButton && context && (
        <button
          onClick={() => context.onOpenChange(false)}
          className="absolute right-3 top-3 z-50 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "" }) {
  return (
    <div className={`flex flex-col gap-1.5 p-6 pr-12 border-b ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold text-foreground ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
}

export function DialogClose({ className = "" }) {
  const context = React.useContext(DialogContext);
  
  if (!context) return null;
  
  return (
    <button
      onClick={() => context.onOpenChange(false)}
      className={`rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
      aria-label="Cerrar"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

export function DialogBody({ children, className = "" }) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-end gap-2 p-6 border-t bg-muted/10 ${className}`}>
      {children}
    </div>
  );
}
