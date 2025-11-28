import apiClient from "./api";

/**
 * Servicio de Auditoría
 * Permite a los administradores consultar el historial de acciones del sistema
 */

export const auditoriaService = {
  /**
   * Obtener lista de logs de auditoría con filtros
   * @param {Object} filtros - Filtros opcionales
   * @param {string} filtros.usuario - ID del usuario
   * @param {string} filtros.accion - Tipo de acción
   * @param {string} filtros.tabla_afectada - Tabla afectada
   * @param {string} filtros.fecha_inicio - Fecha desde (YYYY-MM-DD)
   * @param {string} filtros.fecha_fin - Fecha hasta (YYYY-MM-DD)
   * @param {string} filtros.placa - Placa del vehículo
   * @param {string} filtros.search - Búsqueda en detalles
   * @returns {Promise<Array>} Lista de logs
   */
  obtenerLogs: async (filtros = {}) => {
    try {
      const params = {};

      if (filtros.usuario) params.usuario = filtros.usuario;
      if (filtros.accion) params.accion = filtros.accion;
      if (filtros.tabla_afectada)
        params.tabla_afectada = filtros.tabla_afectada;
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      if (filtros.placa) params.placa = filtros.placa;
      if (filtros.search) params.search = filtros.search;

      const response = await apiClient.get("/v1/auditoria/logs/", { params });
      // Manejar respuesta paginada de DRF o lista directa
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      // Si es respuesta paginada, extraer results
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
      // Si es otro formato, devolver array vacío
      return [];
    } catch (error) {
      console.error("Error en obtenerLogs:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener detalle de un log específico
   * @param {number} logId - ID del log
   * @returns {Promise<Object>} Detalle del log
   */
  obtenerDetalleLog: async (logId) => {
    try {
      const response = await apiClient.get(`/v1/auditoria/logs/${logId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener resumen de auditoría (dashboard)
   * @returns {Promise<Object>} Resumen con estadísticas
   */
  obtenerResumen: async () => {
    try {
      const response = await apiClient.get("/v1/auditoria/resumen/");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener historial de un vehículo específico
   * @param {string} placa - Placa del vehículo
   * @returns {Promise<Object>} Logs del vehículo
   */
  obtenerHistorialVehiculo: async (placa) => {
    try {
      const response = await apiClient.get(`/v1/auditoria/vehiculo/${placa}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener historial de un usuario específico
   * @param {number} usuarioId - ID del usuario
   * @param {Object} filtros - Filtros opcionales de fecha
   * @returns {Promise<Object>} Logs del usuario
   */
  obtenerHistorialUsuario: async (usuarioId, filtros = {}) => {
    try {
      const params = {};
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;

      const response = await apiClient.get(
        `/v1/auditoria/usuario/${usuarioId}/`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener lista de acciones disponibles para filtrar
   * @returns {Promise<Array>} Lista de acciones con código y descripción
   */
  obtenerAccionesDisponibles: async () => {
    try {
      const response = await apiClient.get("/v1/auditoria/acciones/");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Error en obtenerAccionesDisponibles:", error);
      // Si falla, devolver array vacío en lugar de propagar error
      return [];
    }
  },

  /**
   * Obtener cierres de turno de trabajadores (solo admin/gerente)
   * @param {Object} filtros - Filtros opcionales
   * @param {string} filtros.fecha - Fecha específica en formato YYYY-MM-DD (default: hoy)
   * @param {number} filtros.usuario_id - ID del usuario para filtrar
   * @returns {Promise<Object>} Lista de cierres con datos de trabajadores
   */
  obtenerCierresTrabajadores: async (filtros = {}) => {
    try {
      const params = {};
      if (filtros.fecha) params.fecha = filtros.fecha;
      if (filtros.usuario_id) params.usuario_id = filtros.usuario_id;

      const response = await apiClient.get("/v1/auditoria/cierres-trabajadores/", { params });
      return response.data;
    } catch (error) {
      console.error("Error en obtenerCierresTrabajadores:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener detalle completo de un cierre de turno de un trabajador
   * @param {number} cierreId - ID del cierre
   * @returns {Promise<Object>} Detalle completo del cierre
   */
  obtenerDetalleCierreTrabajador: async (cierreId) => {
    try {
      const response = await apiClient.get(`/v1/auditoria/cierres-trabajadores/${cierreId}/`);
      return response.data;
    } catch (error) {
      console.error("Error en obtenerDetalleCierreTrabajador:", error);
      throw error.response?.data || error;
    }
  },
};
