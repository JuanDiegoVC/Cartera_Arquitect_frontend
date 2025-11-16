import apiClient from "./api";

/**
 * Servicio de Facturación
 * HU-03: Generación automática de cargos mensuales
 */

export const facturacionService = {
  /**
   * Genera los cargos mensuales para todos los vehículos activos
   * @param {string} periodo - Fecha del primer día del mes (YYYY-MM-DD)
   * @returns {Promise}
   */
  generarCargos: async (periodo) => {
    try {
      const response = await apiClient.post("/v1/facturacion/generar-cargos/", {
        periodo,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
