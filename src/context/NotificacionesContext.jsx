import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { notificacionesService } from "../services/notificacionesService";
import { useAuth } from "./AuthContext";

const NotificacionesContext = createContext(null);

// Intervalo de polling para actualizar el contador (en milisegundos)
const POLLING_INTERVAL = 60000; // 1 minuto

export const NotificacionesProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    // Estado del contador
    const [contador, setContador] = useState({
        total_no_leidas: 0,
        criticas: 0,
        advertencias: 0,
    });
    
    // Estado del resumen (últimas notificaciones)
    const [resumen, setResumen] = useState([]);
    
    // Estado de carga
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Actualiza el contador de notificaciones no leídas
     */
    const actualizarContador = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            const data = await notificacionesService.getContador();
            setContador(data);
            setError(null);
        } catch (err) {
            console.error("Error al obtener contador de notificaciones:", err);
            setError(err);
        }
    }, [isAuthenticated]);

    /**
     * Actualiza el resumen de notificaciones (últimas 10)
     */
    const actualizarResumen = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            setLoading(true);
            const data = await notificacionesService.getResumen();
            // Manejar respuesta paginada o array directo
            const notificaciones = Array.isArray(data) ? data : (data.results || []);
            setResumen(notificaciones);
            setError(null);
        } catch (err) {
            console.error("Error al obtener resumen de notificaciones:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    /**
     * Actualiza tanto el contador como el resumen
     */
    const refrescarNotificaciones = useCallback(async () => {
        await Promise.all([
            actualizarContador(),
            actualizarResumen(),
        ]);
    }, [actualizarContador, actualizarResumen]);

    /**
     * Marca una notificación como leída y actualiza el estado
     */
    const marcarComoLeida = useCallback(async (id) => {
        try {
            await notificacionesService.marcarLeida(id);
            
            // Actualizar resumen localmente
            setResumen(prev => 
                prev.map(n => 
                    n.notificacion_id === id ? { ...n, leida: true } : n
                )
            );
            
            // Actualizar contador
            await actualizarContador();
        } catch (err) {
            console.error("Error al marcar notificación como leída:", err);
            throw err;
        }
    }, [actualizarContador]);

    /**
     * Marca todas las notificaciones como leídas
     */
    const marcarTodasComoLeidas = useCallback(async () => {
        try {
            await notificacionesService.marcarTodasLeidas();
            
            // Actualizar resumen localmente
            setResumen(prev => prev.map(n => ({ ...n, leida: true })));
            
            // Resetear contador
            setContador({
                total_no_leidas: 0,
                criticas: 0,
                advertencias: 0,
            });
        } catch (err) {
            console.error("Error al marcar todas las notificaciones como leídas:", err);
            throw err;
        }
    }, []);

    /**
     * Genera nuevas alertas de morosidad
     */
    const generarAlertasMorosidad = useCallback(async () => {
        try {
            const resultado = await notificacionesService.generarAlertasMorosidad();
            
            // Refrescar después de generar
            await refrescarNotificaciones();
            
            return resultado;
        } catch (err) {
            console.error("Error al generar alertas de morosidad:", err);
            throw err;
        }
    }, [refrescarNotificaciones]);

    /**
     * Genera nuevas alertas de rubros vencidos
     */
    const generarAlertasVencimientos = useCallback(async () => {
        try {
            const resultado = await notificacionesService.generarAlertasVencimientos();
            
            // Refrescar después de generar
            await refrescarNotificaciones();
            
            return resultado;
        } catch (err) {
            console.error("Error al generar alertas de vencimientos:", err);
            throw err;
        }
    }, [refrescarNotificaciones]);

    /**
     * Genera todas las alertas (morosidad + vencimientos)
     */
    const generarTodasLasAlertas = useCallback(async () => {
        try {
            const resultado = await notificacionesService.generarTodasLasAlertas();
            
            // Refrescar después de generar
            await refrescarNotificaciones();
            
            return resultado;
        } catch (err) {
            console.error("Error al generar todas las alertas:", err);
            throw err;
        }
    }, [refrescarNotificaciones]);

    // Efecto para cargar datos iniciales y configurar polling
    useEffect(() => {
        if (!isAuthenticated) {
            // Resetear estado si no está autenticado
            setContador({ total_no_leidas: 0, criticas: 0, advertencias: 0 });
            setResumen([]);
            return;
        }

        // Cargar datos iniciales
        refrescarNotificaciones();

        // Configurar polling para actualizar el contador periódicamente
        const intervalId = setInterval(() => {
            actualizarContador();
        }, POLLING_INTERVAL);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [isAuthenticated, refrescarNotificaciones, actualizarContador]);

    const value = {
        // Estado
        contador,
        resumen,
        loading,
        error,
        
        // Propiedades derivadas
        tieneNotificaciones: contador.total_no_leidas > 0,
        tieneAlertas: contador.criticas > 0 || contador.advertencias > 0,
        
        // Acciones
        actualizarContador,
        actualizarResumen,
        refrescarNotificaciones,
        marcarComoLeida,
        marcarTodasComoLeidas,
        // Generación de alertas
        generarAlertasMorosidad,
        generarAlertasVencimientos,
        generarTodasLasAlertas,
    };

    return (
        <NotificacionesContext.Provider value={value}>
            {children}
        </NotificacionesContext.Provider>
    );
};

export const useNotificaciones = () => {
    const context = useContext(NotificacionesContext);
    if (!context) {
        throw new Error("useNotificaciones debe usarse dentro de un NotificacionesProvider");
    }
    return context;
};
