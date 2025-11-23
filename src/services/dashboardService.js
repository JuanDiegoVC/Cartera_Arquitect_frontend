import apiClient from "./api";

/**
 * Servicio de Dashboard
 * Proporciona métricas y KPIs en tiempo real
 */

export const dashboardService = {
    /**
     * Obtener resumen del dashboard con KPIs
     * @returns {Promise<Object>}
     */
    getSummary: async () => {
        try {
            const response = await apiClient.get("/v1/contabilidad/dashboard/summary/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default dashboardService;
