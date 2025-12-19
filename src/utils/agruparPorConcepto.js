/**
 * Utilidad para agrupar movimientos (ingresos/egresos) por un campo específico
 * y calcular totales por grupo.
 *
 * @param {Array} movimientos - Array de objetos con movimientos
 * @param {string} campoAgrupacion - Campo por el cual agrupar (ej: 'concepto', 'categoria')
 * @param {string} campoMonto - Campo que contiene el monto (default: 'monto')
 * @returns {Object} Objeto con totales por concepto y array ordenado
 *
 * @example
 * const ingresos = [
 *   { concepto: 'Administración', monto: 2000 },
 *   { concepto: 'Administración', monto: 3000 },
 *   { concepto: 'Pólizas', monto: 1500 }
 * ];
 * const resultado = agruparPorConcepto(ingresos, 'concepto');
 * // resultado = {
 * //   totalesPorConcepto: { 'Administración': 5000, 'Pólizas': 1500 },
 * //   resumenOrdenado: [
 * //     { concepto: 'Administración', total: 5000, cantidad: 2 },
 * //     { concepto: 'Pólizas', total: 1500, cantidad: 1 }
 * //   ],
 * //   totalGeneral: 6500
 * // }
 */
export const agruparPorConcepto = (
  movimientos = [],
  campoAgrupacion = "concepto",
  campoMonto = "monto"
) => {
  if (!Array.isArray(movimientos) || movimientos.length === 0) {
    return {
      totalesPorConcepto: {},
      resumenOrdenado: [],
      totalGeneral: 0,
    };
  }

  // Agrupar y sumar por concepto
  const agrupado = movimientos.reduce((acc, item) => {
    const clave = item[campoAgrupacion] || "Sin clasificar";
    const monto = parseFloat(item[campoMonto]) || 0;

    if (!acc[clave]) {
      acc[clave] = { total: 0, cantidad: 0 };
    }

    acc[clave].total += monto;
    acc[clave].cantidad += 1;

    return acc;
  }, {});

  // Crear objeto simple de totales
  const totalesPorConcepto = {};
  Object.entries(agrupado).forEach(([concepto, datos]) => {
    totalesPorConcepto[concepto] = datos.total;
  });

  // Crear array ordenado por total (mayor a menor)
  const resumenOrdenado = Object.entries(agrupado)
    .map(([concepto, datos]) => ({
      concepto,
      total: datos.total,
      cantidad: datos.cantidad,
    }))
    .sort((a, b) => b.total - a.total);

  // Calcular total general
  const totalGeneral = resumenOrdenado.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    totalesPorConcepto,
    resumenOrdenado,
    totalGeneral,
  };
};

/**
 * Formatea el nombre del concepto para mostrar
 * @param {string} concepto - Nombre del concepto
 * @returns {string} Nombre formateado
 */
export const formatearNombreConcepto = (concepto) => {
  if (!concepto) return "Sin clasificar";
  return concepto.charAt(0).toUpperCase() + concepto.slice(1).toLowerCase();
};

export default agruparPorConcepto;
