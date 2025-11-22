import api from "./api";

/**
 * Servicio para gestión de egresos
 */

// Obtener categorías de egresos
export const obtenerCategorias = async () => {
  const response = await api.get("/v1/contabilidad/categorias/");
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

export default {
  obtenerCategorias,
  crearEgreso,
  obtenerEgresosHoy,
  obtenerEgresos,
};
