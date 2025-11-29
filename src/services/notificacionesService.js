import apiClient from "./api";

/**
 * Servicio de Notificaciones
 * Gestiona las alertas y notificaciones del sistema
 */
export const notificacionesService = {
    /**
     * Obtiene todas las notificaciones con filtros opcionales y paginación
     * @param {Object} params - Parámetros de filtrado
     * @param {boolean} params.leida - Filtrar por estado de lectura
     * @param {string} params.tipo - Filtrar por tipo (morosidad_alerta, morosidad_critica, sistema)
     * @param {string} params.nivel_severidad - Filtrar por severidad (info, warning, critical)
     * @param {number} params.page - Número de página
     * @param {number} params.page_size - Tamaño de página
     */
    getAll: async (params = {}) => {
        try {
            const response = await apiClient.get("/v1/notificaciones/", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Obtiene el resumen de notificaciones para el dropdown (últimas 10)
     */
    getResumen: async () => {
        try {
            const response = await apiClient.get("/v1/notificaciones/resumen/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Obtiene el contador de notificaciones no leídas
     * @returns {Object} { total_no_leidas, criticas, advertencias }
     */
    getContador: async () => {
        try {
            const response = await apiClient.get("/v1/notificaciones/contador/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Obtiene el detalle de una notificación específica
     * @param {number} id - ID de la notificación
     */
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/v1/notificaciones/${id}/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Marca una notificación como leída
     * @param {number} id - ID de la notificación
     */
    marcarLeida: async (id) => {
        try {
            const response = await apiClient.patch(`/v1/notificaciones/${id}/marcar-leida/`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Marca todas las notificaciones como leídas
     */
    marcarTodasLeidas: async () => {
        try {
            const response = await apiClient.post("/v1/notificaciones/marcar-todas-leidas/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Genera alertas de morosidad basadas en el estado actual de los vehículos
     * Esto crea notificaciones para vehículos en estado amarillo (60-90%) o rojo (>=90%)
     */
    generarAlertasMorosidad: async () => {
        try {
            const response = await apiClient.post("/v1/notificaciones/generar-alertas/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Genera alertas de rubros vencidos
     * Esto crea notificaciones para deudas cuyo periodo de pago ya venció
     */
    generarAlertasVencimientos: async () => {
        try {
            const response = await apiClient.post("/v1/notificaciones/generar-alertas-vencimientos/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Genera todas las alertas del sistema (morosidad + vencimientos)
     * También ejecuta auto-limpieza de notificaciones antiguas
     */
    generarTodasLasAlertas: async () => {
        try {
            const response = await apiClient.post("/v1/notificaciones/generar-todas/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Ejecuta limpieza de notificaciones antiguas
     * - No leídas: se eliminan después de 5 días
     * - Leídas: se eliminan 24h después de leerlas
     */
    limpiar: async () => {
        try {
            const response = await apiClient.post("/v1/notificaciones/limpiar/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Elimina TODAS las notificaciones del sistema
     * ⚠️ USAR CON PRECAUCIÓN
     */
    limpiarTodas: async () => {
        try {
            const response = await apiClient.delete("/v1/notificaciones/limpiar-todas/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};
