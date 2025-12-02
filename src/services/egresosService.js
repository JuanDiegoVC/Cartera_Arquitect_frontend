import api from "./api";

/**
 * Servicio para gestión de egresos
 */

// Obtener categorías de egresos
export const obtenerCategorias = async () => {
  const response = await api.get("/v1/contabilidad/categorias/");
  return response.data;
};

// Crear categoría
export const crearCategoria = async (data) => {
  const response = await api.post("/v1/contabilidad/categorias/", data);
  return response.data;
};

// Actualizar categoría
export const actualizarCategoria = async (id, data) => {
  const response = await api.put(`/v1/contabilidad/categorias/${id}/`, data);
  return response.data;
};

// Eliminar categoría
export const eliminarCategoria = async (id) => {
  const response = await api.delete(`/v1/contabilidad/categorias/${id}/`);
  return response.data;
};

// Crear un nuevo egreso
export const crearEgreso = async (egresoData) => {
  const response = await api.post(
    "/v1/contabilidad/egresos/crear/",
    egresoData
  );
  return response.data;
};

// Obtener egresos del día actual
export const obtenerEgresosHoy = async () => {
  const response = await api.get("/v1/contabilidad/egresos/hoy/");
  return response.data;
};

// Obtener todos los egresos
export const obtenerEgresos = async () => {
  const response = await api.get("/v1/contabilidad/egresos/");
  return response.data;
};

/**
 * Obtener historial de egresos con filtros y paginación
 * Solo disponible para administradores y gerentes
 * @param {Object} params - Parámetros de búsqueda
 * @param {string} [params.fecha_inicio] - Fecha inicio (YYYY-MM-DD)
 * @param {string} [params.fecha_fin] - Fecha fin (YYYY-MM-DD)
 * @param {string} [params.categoria] - ID de categoría
 * @param {string} [params.medio_pago] - efectivo|transferencia
 * @param {number} [params.page] - Número de página
 * @param {number} [params.page_size] - Resultados por página
 */
export const obtenerHistorialEgresos = async (params = {}) => {
  const response = await api.get("/v1/contabilidad/egresos/historial/", {
    params,
  });
  return response.data;
};

export default {
  obtenerCategorias,
  crearEgreso,
  obtenerEgresosHoy,
  obtenerEgresos,
  obtenerHistorialEgresos,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};
