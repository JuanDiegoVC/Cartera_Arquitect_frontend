import apiClient from "./api";

/**
 * Servicio de Vehículos
 * RF-002: Búsqueda rápida por placa
 * RF-009: Gestión de vehículos (sin borrado físico)
 */

export const vehiculosService = {
  /**
   * Obtener todos los vehículos
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/vehiculos/", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Buscar vehículo por placa (RF-002)
   * Obtiene el estado de cuenta del vehículo (HU-04)
   * @param {string} placa - Placa del vehículo
   * @returns {Promise}
   */
  buscarPorPlaca: async (placa) => {
    try {
      const response = await apiClient.get(
        `/v1/flota/estado-de-cuenta/${placa}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener estado de cuenta de un vehículo (HU-04)
   * @param {string} placa - Placa del vehículo
   * @returns {Promise}
   */
  getEstadoCuenta: async (placa) => {
    try {
      const response = await apiClient.get(
        `/v1/flota/estado-de-cuenta/${placa}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener un vehículo por ID
   * @param {number} id - ID del vehículo
   * @returns {Promise}
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/vehiculos/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Crear un nuevo vehículo
   * @param {Object} data - Datos del vehículo
   * @returns {Promise}
   */
  create: async (data) => {
    try {
      const response = await apiClient.post("/vehiculos/", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Actualizar un vehículo
   * @param {number} id - ID del vehículo
   * @param {Object} data - Datos actualizados
   * @returns {Promise}
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.patch(`/vehiculos/${id}/`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Desactivar un vehículo (RF-009: desactivación lógica)
   * @param {number} id - ID del vehículo
   * @returns {Promise}
   */
  desactivar: async (id) => {
    try {
      const response = await apiClient.patch(`/vehiculos/${id}/`, {
        estado: "inactivo",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Activar un vehículo
   * @param {number} id - ID del vehículo
   * @returns {Promise}
   */
  activar: async (id) => {
    try {
      const response = await apiClient.patch(`/vehiculos/${id}/`, {
        estado: "activo",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
