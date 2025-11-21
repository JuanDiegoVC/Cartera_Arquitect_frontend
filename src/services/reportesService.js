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
      
      if (filtros.tipoVehiculo && filtros.tipoVehiculo !== 'todos') {
        params.tipo_vehiculo = filtros.tipoVehiculo;
      }
      
      if (filtros.rubroId) {
        params.rubro_id = filtros.rubroId;
      }
      
      if (filtros.incluirPagadas) {
        params.incluir_pagadas = 'true';
      }

      const response = await apiClient.get("/v1/cobros/reportes/cartera-detallada/", {
        params,
        responseType: 'blob' // CRÍTICO para archivos binarios
      });
      
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
  descargarArchivo: (response, nombreBase = 'Reporte_Cartera') => {
    try {
      // Crear un objeto URL temporal para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear un enlace temporal
      const link = document.createElement('a');
      link.href = url;
      
      // Generar nombre del archivo con fecha actual
      const fechaActual = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `${nombreBase}_${fechaActual}.xlsx`);
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      throw new Error('No se pudo descargar el archivo');
    }
  }
};
