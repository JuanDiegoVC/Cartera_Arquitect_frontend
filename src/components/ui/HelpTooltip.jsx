import * as React from "react";
import { HelpCircle } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./tooltip";
import { getTooltipText } from "../../constants/helpContent";
import { cn } from "../../lib/utils";

/**
 * HelpTooltip - Componente de tooltip de ayuda reutilizable
 * 
 * Envuelve cualquier elemento y muestra un texto de ayuda al pasar el mouse.
 * Puede mostrar un icono de ayuda opcional junto al elemento.
 * 
 * @example
 * // Con texto directo
 * <HelpTooltip content="Este campo es obligatorio">
 *   <Input placeholder="Nombre" />
 * </HelpTooltip>
 * 
 * @example
 * // Con clave de helpContent
 * <HelpTooltip helpKey="taquilla.buscarPlaca">
 *   <Input placeholder="Buscar placa..." />
 * </HelpTooltip>
 * 
 * @example
 * // Con icono de ayuda visible
 * <HelpTooltip content="Información adicional" showIcon>
 *   <span>Texto con ayuda</span>
 * </HelpTooltip>
 */
export function HelpTooltip({
    children,
    content,
    helpKey,
    side = "top",
    align = "center",
    showIcon = false,
    iconSize = 14,
    iconClassName = "",
    delayDuration = 200,
    className,
}) {
    // Obtener el texto del tooltip (content directo o desde helpKey)
    const tooltipText = content || (helpKey ? getTooltipText(helpKey) : "");

    // Si no hay texto, simplemente renderizar los hijos
    if (!tooltipText) {
        return <>{children}</>;
    }

    const triggerContent = showIcon ? (
        <span className={cn("inline-flex items-center gap-1.5", className)}>
            {children}
            <HelpCircle
                className={cn(
                    "text-muted-foreground hover:text-primary transition-colors cursor-help",
                    iconClassName
                )}
                size={iconSize}
            />
        </span>
    ) : (
        children
    );

    return (
        <TooltipProvider delayDuration={delayDuration}>
            <Tooltip>
                <TooltipTrigger asChild>{triggerContent}</TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className="max-w-xs text-sm leading-relaxed"
                >
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

/**
 * HelpIcon - Icono de ayuda standalone con tooltip
 * 
 * Útil para agregar ayuda contextual sin envolver un elemento
 * 
 * @example
 * <Label>
 *   Nombre del Rubro <HelpIcon content="Identificador único del concepto" />
 * </Label>
 */
export function HelpIcon({
    content,
    helpKey,
    side = "top",
    size = 14,
    className = "",
}) {
    const tooltipText = content || (helpKey ? getTooltipText(helpKey) : "");

    if (!tooltipText) return null;

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <HelpCircle
                        className={cn(
                            "inline-block ml-1 text-muted-foreground hover:text-primary transition-colors cursor-help",
                            className
                        )}
                        size={size}
                    />
                </TooltipTrigger>
                <TooltipContent side={side} className="max-w-xs text-sm leading-relaxed">
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

export default HelpTooltip;
