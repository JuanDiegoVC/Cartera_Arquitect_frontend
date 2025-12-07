import apiClient from "./api";

/**
 * Servicio de Rendimiento (Analytics Dashboard)
 * Proporciona métricas de rendimiento diario y mensual para administradores y gerentes.
 */

export const rendimientoService = {
  /**
   * Obtener métricas de rendimiento del día actual comparadas con el día anterior.
   * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
   * @returns {Promise<Object>} Métricas del día con comparativas y datos para gráficas
   */
  getRendimientoDiario: async (fecha = null) => {
    try {
      const params = {};
      if (fecha) {
        params.fecha = fecha;
      }
      const response = await apiClient.get("/v1/cobros/rendimiento/diario/", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener métricas de rendimiento mensual comparadas con el mes anterior.
   * @param {string} mes - Mes en formato YYYY-MM (opcional, default: mes actual)
   * @returns {Promise<Object>} Métricas del mes con comparativas y datos para gráficas
   */
  getRendimientoMensual: async (mes = null) => {
    try {
      const params = {};
      if (mes) {
        params.mes = mes;
      }
      const response = await apiClient.get("/v1/cobros/rendimiento/mensual/", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener resumen rápido de KPIs principales para widgets de dashboard.
   * @returns {Promise<Object>} KPIs principales con variaciones
   */
  getResumen: async () => {
    try {
      const response = await apiClient.get("/v1/cobros/rendimiento/resumen/");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default rendimientoService;
