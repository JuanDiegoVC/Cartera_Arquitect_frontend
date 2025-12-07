import * as React from "react";
import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { HelpModal } from "./HelpModal";

/**
 * FloatingHelpButton - Botón flotante de ayuda global
 * 
 * Se posiciona en la esquina inferior derecha de la pantalla
 * y abre el modal de ayuda al hacer clic.
 */
export function FloatingHelpButton() {
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    return (
        <>
            {/* Botón flotante */}
            <button
                onClick={() => setIsHelpOpen(true)}
                className="fixed bottom-6 right-6 z-30 group"
                aria-label="Abrir ayuda"
            >
                {/* Efecto de pulso de fondo */}
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />

                {/* Botón principal */}
                <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group-hover:from-primary/90 group-hover:to-primary">
                    <HelpCircle className="h-6 w-6" />
                </span>

                {/* Tooltip del botón */}
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
                    ¿Necesitas ayuda?
                    {/* Flecha del tooltip */}
                    <span className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-foreground" />
                </span>
            </button>

            {/* Modal de ayuda */}
            <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
    );
}

export default FloatingHelpButton;
