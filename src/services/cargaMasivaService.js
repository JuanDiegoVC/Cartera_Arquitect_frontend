/**
 * Servicio para Carga Masiva de Datos desde Excel
 * HU-CargaMasiva: Permite subir archivos Excel para importar rubros, vehículos y cartera
 * 
 * @author Frontend Senior Developer
 * @date 2025-11-27
 */

import apiClient from './api';

/**
 * Servicio de Carga Masiva
 * Proporciona métodos para:
 * - Subir archivo Excel y obtener vista previa
 * - Confirmar la carga de datos editados
 */
export const cargaMasivaService = {
  /**
   * Sube un archivo Excel y retorna los datos parseados para vista previa.
   * 
   * @param {File} archivo - Archivo Excel (.xlsx, .xls)
   * @returns {Promise<Object>} Datos parseados con validación
   * 
   * @example
   * const response = await cargaMasivaService.uploadPreview(file);
   * // response.data = {
   * //   success: true,
   * //   data: { rubros: [...], vehiculos: [...], cartera_pendiente: [...] },
   * //   resumen: { rubros_count: 5, vehiculos_count: 20, cartera_count: 100 },
   * //   validacion: { errores: [], advertencias: [] }
   * // }
   */
  uploadPreview: async (archivo) => {
    const formData = new FormData();
    formData.append('archivo', archivo);
    
    const response = await apiClient.post('/v1/cobros/carga-masiva/preview/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Confirma la carga masiva con los datos validados/editados.
   * 
   * @param {Object} datos - Datos a cargar
   * @param {Array} datos.rubros - Lista de rubros a crear
   * @param {Array} datos.vehiculos - Lista de vehículos a crear
   * @param {Array} datos.cartera_pendiente - Lista de deudas a crear
   * @returns {Promise<Object>} Resultado de la carga
   * 
   * @example
   * const response = await cargaMasivaService.confirmLoad({
   *   rubros: [...],
   *   vehiculos: [...],
   *   cartera_pendiente: [...]
   * });
   * // response = {
   * //   success: true,
   * //   mensaje: "Carga masiva completada exitosamente",
   * //   resultado: { rubros_creados: 5, vehiculos_creados: 20, deudas_creadas: 100 }
   * // }
   */
  confirmLoad: async (datos) => {
    const response = await apiClient.post('/v1/cobros/carga-masiva/confirm/', datos);
    return response.data;
  },

  /**
   * Revalida los datos editados sin necesidad de recargar el archivo.
   * Útil para verificar que los cambios realizados son correctos antes de confirmar.
   * 
   * @param {Object} datos - Datos editados a revalidar
   * @param {Array} datos.rubros - Lista de rubros editados
   * @param {Array} datos.vehiculos - Lista de vehículos editados
   * @param {Array} datos.cartera_pendiente - Lista de deudas editadas
   * @returns {Promise<Object>} Resultado de la validación con errores actualizados
   * 
   * @example
   * const response = await cargaMasivaService.revalidate({
   *   rubros: [...],
   *   vehiculos: [...],
   *   cartera_pendiente: [...]
   * });
   * // response = {
   * //   success: true,
   * //   data: { rubros: [...], vehiculos: [...], cartera_pendiente: [...] },
   * //   validacion: { errores: [], advertencias: [] }
   * // }
   */
  revalidate: async (datos) => {
    const response = await apiClient.post('/v1/cobros/carga-masiva/revalidate/', datos);
    return response.data;
  },

  /**
   * Descarga una plantilla de Excel con el formato correcto.
   * (Para futura implementación)
   * 
   * @returns {Promise<Blob>} Archivo Excel de plantilla
   */
  downloadTemplate: async () => {
    const response = await apiClient.get('/v1/cobros/carga-masiva/template/', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default cargaMasivaService;
