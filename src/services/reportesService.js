import apiClient from "./api";

/**
 * Servicio de Reportes
 * HU-ReporteCartera: Reporte de Cartera Detallado
 */

export const reportesService = {
  /**
   * Descargar Reporte de Cartera Detallado en formato Excel
   * @param {Object} filtros - Filtros para el reporte
   * @param {string} filtros.fechaInicio - Fecha inicio en formato YYYY-MM-DD (opcional)
   * @param {string} filtros.fechaFin - Fecha fin en formato YYYY-MM-DD (opcional)
   * @param {string} filtros.tipoVehiculo - Tipo de vehículo (opcional)
   * @param {number} filtros.rubroId - ID del rubro (opcional)
   * @param {boolean} filtros.incluirPagadas - Incluir deudas pagadas (opcional)
   * @returns {Promise<Response>} Response con el blob del archivo Excel
   */
  descargarReporteCartera: async (filtros = {}) => {
    try {
      // Construir params solo con valores no vacíos
      const params = {};

      if (filtros.fechaInicio) {
        params.periodo_inicio = filtros.fechaInicio;
      }

      if (filtros.fechaFin) {
        params.periodo_fin = filtros.fechaFin;
      }

      if (filtros.tipoVehiculo && filtros.tipoVehiculo !== "todos") {
        params.tipo_vehiculo = filtros.tipoVehiculo;
      }

      if (filtros.rubroId) {
        params.rubro_id = filtros.rubroId;
      }

      if (filtros.incluirPagadas) {
        params.incluir_pagadas = "true";
      }

      const response = await apiClient.get(
        "/v1/cobros/reportes/cartera-detallada/",
        {
          params,
          responseType: "blob", // CRÍTICO para archivos binarios
        }
      );

      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Descargar archivo desde una respuesta blob
   * @param {Response} response - Respuesta de axios con blob
   * @param {string} nombreBase - Nombre base del archivo (sin extensión)
   */
  descargarArchivo: (response, nombreBase = "Reporte_Cartera") => {
    try {
      // Crear un objeto URL temporal para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));

      // Crear un enlace temporal
      const link = document.createElement("a");
      link.href = url;

      // Intentar obtener el nombre del archivo desde el header Content-Disposition
      let nombreArchivo = "";
      const disposition = response.headers["content-disposition"];
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          nombreArchivo = matches[1].replace(/['"]/g, "");
        }
      }

      // Si no se pudo obtener del header, generar uno con fecha local (Colombia/System)
      if (!nombreArchivo) {
        // Usar sv-SE para formato YYYY-MM-DD que es sortable
        const fechaActual = new Date().toLocaleDateString("sv-SE");
        nombreArchivo = `${nombreBase}_${fechaActual}.xlsx`;
      }

      link.setAttribute("download", nombreArchivo);

      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();

      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar archivo:", error);
      throw new Error("No se pudo descargar el archivo");
    }
  },

  /**
   * Obtener datos del cierre de turno del día actual
   * HU-CierreTurno: Cierre de Turno Detallado
   * @returns {Promise<Object>} Datos del cierre de turno con resumen y movimientos
   */
  obtenerCierreTurno: async () => {
    try {
      const response = await apiClient.get("/v1/finanzas/cierre-turno/");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Guardar cierre de turno en el historial
   * @param {Object} dataCierre - Datos del cierre a guardar
   * @returns {Promise<Object>} Confirmación del guardado
   */
  guardarCierreTurno: async (datosCierre) => {
    try {
      const response = await apiClient.post(
        "/v1/contabilidad/cierres-turno/guardar/",
        datosCierre
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener historial de cierres de turno
   * @returns {Promise<Object>} Lista de cierres históricos
   */
  obtenerHistorialCierres: async () => {
    try {
      const response = await apiClient.get("/v1/contabilidad/cierres-turno/");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Obtener detalle completo de un cierre específico
   * @param {number} cierreId - ID del cierre a consultar
   * @returns {Promise<Object>} Detalle completo del cierre
   */
  obtenerDetalleCierre: async (cierreId) => {
    try {
      const response = await apiClient.get(
        `/v1/contabilidad/cierres-turno/${cierreId}/`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },


  /**
   * Obtener reporte mensual (Dashboard Financiero)
   * @param {Object} filtros - Filtros de fecha (periodo_inicio, periodo_fin)
   * @returns {Promise<Object>} Datos del reporte mensual
   */
  getReporteMensual: async (filtros = {}) => {
    try {
      const response = await apiClient.get("/v1/cobros/reportes/mensual/", {
        params: filtros,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Descargar reporte mensual en Excel
   * @param {Object} filtros - Filtros de fecha
   * @returns {Promise<Response>} Response con el blob del archivo
   */
  descargarReporteMensual: async (filtros = {}) => {
    try {
      const response = await apiClient.get("/v1/cobros/reportes/mensual/excel/", {
        params: filtros,
        responseType: "blob",
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
