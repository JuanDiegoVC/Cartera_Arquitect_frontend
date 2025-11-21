import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content Container */}
      <div className="relative z-50 w-full max-w-lg mx-4">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = "" }) {
  return (
    <div
      className={`bg-background border rounded-lg shadow-lg ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "" }) {
  return (
    <div className={`flex items-center justify-between p-6 border-b ${className}`}>
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
    <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
      {children}
    </p>
  );
}

export function DialogClose({ onClose, className = "" }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClose}
      className={`h-8 w-8 p-0 ${className}`}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Cerrar</span>
    </Button>
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
