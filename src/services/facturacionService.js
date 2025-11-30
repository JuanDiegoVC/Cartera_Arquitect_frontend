
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
  generarCargos: async (periodo, seguridad_variable = [], rubros_ocasionales = []) => {
    try {
      const response = await apiClient.post("/v1/facturacion/generar-cargos/", {
        periodo,
        seguridad_variable,
        rubros_ocasionales,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  generarPolizas: async () => {
    try {
      const response = await apiClient.post("/v1/facturacion/generar-polizas/");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
