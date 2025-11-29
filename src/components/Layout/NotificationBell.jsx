import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertCircle, AlertTriangle, Check, CheckCheck } from "lucide-react";
import { useNotificaciones } from "../../context/NotificacionesContext";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

/**
 * Componente de campanita de notificaciones
 * Muestra el contador de notificaciones no leídas y un dropdown con el resumen
 */
export function NotificationBell() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const {
        contador,
        resumen,
        loading,
        tieneNotificaciones,
        marcarComoLeida,
        marcarTodasComoLeidas,
        actualizarResumen,
    } = useNotificaciones();

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Actualizar resumen al abrir el dropdown
    const handleToggle = () => {
        if (!isOpen) {
            actualizarResumen();
        }
        setIsOpen(!isOpen);
    };

    // Navegar a la página de notificaciones al hacer clic en una notificación
    const handleNotificacionClick = async (notificacion) => {
        if (!notificacion.leida) {
            await marcarComoLeida(notificacion.notificacion_id);
        }
        setIsOpen(false);
        navigate("/configuracion/notificaciones", { 
            state: { notificacionId: notificacion.notificacion_id } 
        });
    };

    // Marcar todas como leídas
    const handleMarcarTodas = async (e) => {
        e.stopPropagation();
        await marcarTodasComoLeidas();
    };

    // Ver todas las notificaciones
    const handleVerTodas = () => {
        setIsOpen(false);
        navigate("/configuracion/notificaciones");
    };

    // Obtener icono según severidad
    const getIcon = (nivel) => {
        switch (nivel) {
            case "critical":
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default:
                return <Bell className="h-4 w-4 text-blue-500" />;
        }
    };

    // Obtener color de fondo según severidad
    const getBgColor = (nivel, leida) => {
        if (leida) return "bg-muted/30";
        switch (nivel) {
            case "critical":
                return "bg-red-50 dark:bg-red-950/30";
            case "warning":
                return "bg-yellow-50 dark:bg-yellow-950/30";
            default:
                return "bg-blue-50 dark:bg-blue-950/30";
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Botón de campanita */}
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Notificaciones${tieneNotificaciones ? ` (${contador.total_no_leidas} sin leer)` : ""}`}
            >
                <Bell className="h-5 w-5 text-muted-foreground" />
                
                {/* Badge con contador */}
                {tieneNotificaciones && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                            {contador.total_no_leidas > 99 ? "99+" : contador.total_no_leidas}
                        </span>
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card rounded-lg shadow-lg border border-border z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">Notificaciones</h3>
                        {tieneNotificaciones && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={handleMarcarTodas}
                            >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Marcar todas
                            </Button>
                        )}
                    </div>

                    {/* Resumen de contadores */}
                    {tieneNotificaciones && (
                        <div className="px-4 py-2 border-b border-border bg-muted/20 flex gap-3 text-xs">
                            {contador.criticas > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {contador.criticas} crítica{contador.criticas > 1 ? "s" : ""}
                                </Badge>
                            )}
                            {contador.advertencias > 0 && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">
                                    {contador.advertencias} alerta{contador.advertencias > 1 ? "s" : ""}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Lista de notificaciones */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                Cargando...
                            </div>
                        ) : !Array.isArray(resumen) || resumen.length === 0 ? (
                            <div className="px-4 py-8 text-center text-muted-foreground">
                                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No hay notificaciones</p>
                            </div>
                        ) : (
                            resumen.map((notificacion) => (
                                <button
                                    key={notificacion.notificacion_id}
                                    onClick={() => handleNotificacionClick(notificacion)}
                                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border last:border-0 ${getBgColor(notificacion.nivel_severidad, notificacion.leida)}`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {getIcon(notificacion.nivel_severidad)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-medium truncate ${notificacion.leida ? "text-muted-foreground" : "text-foreground"}`}>
                                                {notificacion.titulo}
                                            </p>
                                            {!notificacion.leida && (
                                                <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {notificacion.mensaje}
                                        </p>
                                        <p className="text-xs text-muted-foreground/70 mt-1">
                                            {notificacion.tiempo_transcurrido}
                                        </p>
                                    </div>
                                    {notificacion.leida && (
                                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-border bg-muted/30">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleVerTodas}
                        >
                            Ver todas las notificaciones
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
