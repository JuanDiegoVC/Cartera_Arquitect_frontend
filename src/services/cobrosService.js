import apiClient from "./api";

/**
 * Servicio de Cobros (SOT-27)
 * Gestión de Rubros y Tarifas
 */
export const cobrosService = {
    // --- RUBROS ---
    getAllRubros: async () => {
        try {
            const response = await apiClient.get("/v1/cobros/rubros/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createRubro: async (data) => {
        try {
            const response = await apiClient.post("/v1/cobros/rubros/", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateRubro: async (id, data) => {
        try {
            const response = await apiClient.patch(`/v1/cobros/rubros/${id}/`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteRubro: async (id) => {
        try {
            await apiClient.delete(`/v1/cobros/rubros/${id}/`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // --- TARIFAS ---
    getAllTarifas: async (params = {}) => {
        try {
            const response = await apiClient.get("/v1/cobros/tarifas/", { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createTarifa: async (data) => {
        try {
            const response = await apiClient.post("/v1/cobros/tarifas/", data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateTarifa: async (id, data) => {
        try {
            const response = await apiClient.patch(`/v1/cobros/tarifas/${id}/`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteTarifa: async (id) => {
        try {
            await apiClient.delete(`/v1/cobros/tarifas/${id}/`);
            return true;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // --- REPORTES ---
    getReporteMorosidad: async () => {
        try {
            const response = await apiClient.get("/v1/cobros/reportes/morosidad/");
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    // --- DEUDAS (CORRECCIÓN DE FACTURAS) ---
    /**
     * Buscar deudas por placa del vehículo
     * @param {string} placa - Placa a buscar (búsqueda parcial)
     * @returns {Promise<Array>} Lista de deudas encontradas
     */
    getDeudasByPlaca: async (placa) => {
        try {
            const response = await apiClient.get(`/v1/cobros/deudas/?placa=${encodeURIComponent(placa)}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Buscar deudas con filtros avanzados
     * @param {Object} filtros - Filtros para la búsqueda
     * @param {string} [filtros.placa] - Placa del vehículo (búsqueda parcial)
     * @param {string} [filtros.tipo_vehiculo] - Tipo de vehículo
     * @param {number} [filtros.rubro_id] - ID del rubro
     * @param {string} [filtros.periodo] - Periodo en formato YYYY-MM
     * @param {string} [filtros.estado_deuda] - Estado de la deuda
     * @returns {Promise<Array>} Lista de deudas encontradas
     */
    getDeudasConFiltros: async (filtros = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filtros.placa) params.append("placa", filtros.placa);
            if (filtros.tipo_vehiculo) params.append("tipo_vehiculo", filtros.tipo_vehiculo);
            if (filtros.rubro_id) params.append("rubro_id", filtros.rubro_id);
            if (filtros.periodo) params.append("periodo", filtros.periodo);
            if (filtros.estado_deuda) params.append("estado_deuda", filtros.estado_deuda);

            const response = await apiClient.get(`/v1/cobros/deudas/?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Actualizar una deuda (valor, estado, descripción)
     * @param {number} id - ID de la deuda
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Object>} Deuda actualizada
     */
    updateDeuda: async (id, data) => {
        try {
            const response = await apiClient.patch(`/v1/cobros/deudas/${id}/`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Actualización masiva de deudas
     * @param {Array<number>} deudaIds - Lista de IDs de deudas a actualizar
     * @param {number} nuevoValor - Nuevo valor para todas las deudas
     * @returns {Promise<Object>} Resultado de la operación
     */
    actualizacionMasivaDeudas: async (deudaIds, nuevoValor) => {
        try {
            const response = await apiClient.post("/v1/cobros/deudas/actualizacion-masiva/", {
                deuda_ids: deudaIds,
                nuevo_valor: nuevoValor,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};
