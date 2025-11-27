import apiClient from "./api";

/**
 * Servicio de Pagos
 * HU-05: Registro transaccional de pagos
 */

export const pagosService = {
  /**
   * Registrar un pago de deudas (HU-05)
   *
   * @param {Object} datosPago - Datos del pago a registrar
   * @param {string} datosPago.medio_pago - Medio de pago: "efectivo", "transferencia", "otro"
   * @param {string|number} datosPago.monto_total_recibido - Monto total del pago
   * @param {string} [datosPago.observacion] - Observaciones adicionales
   * @param {Array<Object>} datosPago.deudas_a_pagar - Lista de deudas a pagar
   * @param {number} datosPago.deudas_a_pagar[].deuda_id - ID de la deuda
   * @param {string|number} datosPago.deudas_a_pagar[].monto_abonado - Monto a abonar
   *
   * @returns {Promise<Object>} Respuesta con el ingreso creado
   *
   * @example
   * const resultado = await pagosService.registrarPago({
   *   medio_pago: "efectivo",
   *   monto_total_recibido: "150000.00",
   *   observacion: "Pago parcial mes de enero",
   *   deudas_a_pagar: [
   *     { deuda_id: 1, monto_abonado: "80000.00" },
   *     { deuda_id: 2, monto_abonado: "70000.00" }
   *   ]
   * });
   */
  registrarPago: async (datosPago) => {
    try {
      const response = await apiClient.post(
        "/v1/pagos/registrar-pago/",
        datosPago
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener historial de pagos de un vehículo
   * (Endpoint pendiente de implementación en backend)
   *
   * @param {string} placa - Placa del vehículo
   * @returns {Promise<Array>}
   */
  getHistorialPorVehiculo: async (placa) => {
    try {
      const response = await apiClient.get(`/v1/cobros/historial-pagos/${placa}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener detalle de un pago específico
   * (Endpoint pendiente de implementación en backend)
   *
   * @param {number} ingresoId - ID del ingreso
   * @returns {Promise<Object>}
   */
  getDetallePago: async (ingresoId) => {
    try {
      const response = await apiClient.get(`/v1/pagos/detalle/${ingresoId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener datos del recibo para generar PDF
   *
   * @param {number} ingresoId - ID del ingreso
   * @returns {Promise<Object>}
   */
  getReciboPago: async (ingresoId) => {
    try {
      const response = await apiClient.get(
        `/v1/cobros/recibo-pago/${ingresoId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Descargar recibo en PDF
   *
   * @param {number} ingresoId - ID del ingreso
   * @returns {Promise<Blob>}
   */
  downloadRecibo: async (ingresoId) => {
    try {
      const response = await apiClient.get(
        `/v1/cobros/recibo-pago/${ingresoId}/download/`,
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener pagos realizados en un rango de fechas
   * (Endpoint pendiente de implementación en backend)
   *
   * @param {Object} filtros - Filtros de búsqueda
   * @param {string} filtros.fecha_inicio - Fecha inicial (YYYY-MM-DD)
   * @param {string} filtros.fecha_fin - Fecha final (YYYY-MM-DD)
   * @param {string} [filtros.medio_pago] - Filtrar por medio de pago
   * @returns {Promise<Array>}
   */
  getPagosPorFechas: async (filtros) => {
    try {
      const response = await apiClient.get("/v1/pagos/", { params: filtros });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default pagosService;
