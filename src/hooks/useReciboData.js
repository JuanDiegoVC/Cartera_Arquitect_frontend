import { useAuth } from "./useAuth";

/**
 * Hook personalizado para construir el objeto de datos del recibo
 * a partir de la información del vehículo y del pago realizado
 *
 * @returns {Function} buildReciboData - Función que construye el objeto de datos
 */
export const useReciboData = () => {
  const { user } = useAuth();

  /**
   * Construye el objeto de datos completo para el recibo PDF
   *
   * @param {Object} params - Parámetros para construir el recibo
   * @param {Object} params.vehiculo - Datos del vehículo
   * @param {Array} params.deudasPagadas - Array de deudas que fueron pagadas
   * @param {number} params.totalPagado - Total del monto pagado
   * @param {string} params.medioPago - Medio de pago utilizado
   * @param {string} params.observacion - Observaciones del pago
   * @param {string|number} params.ingresoId - ID del ingreso generado
   * @param {string} params.fechaPago - Fecha del pago (ISO string)
   * @returns {Object} - Objeto con los datos formateados para el recibo
   */
  const buildReciboData = ({
    vehiculo,
    deudasPagadas,
    totalPagado,
    medioPago,
    observacion,
    ingresoId,
    fechaPago,
  }) => {
    console.log(
      "🔧 [useReciboData] Iniciando construcción de datos del recibo"
    );
    console.log("📦 [useReciboData] Parámetros recibidos:", {
      vehiculo,
      deudasPagadas,
      totalPagado,
      medioPago,
      observacion,
      ingresoId,
      fechaPago,
    });

    // Información de la empresa (hardcoded por ahora, puede venir de config)
    const empresa = {
      nombre: "Empresa De Transporte Sotra Peñol",
      nit: "800.123.456-7",
      direccion: "Cra. 17 #734, Peñol, Antioquia",
      telefono: "(604) 2309116",
    };

    // Mapear medio de pago a texto legible
    const mediosPagoMap = {
      efectivo: "Efectivo",
      transferencia: "Transferencia Bancaria",
      otro: "Otro",
    };

    // Construir array de items (conceptos pagados)
    const items = deudasPagadas.map((deuda) => ({
      concepto: deuda.rubro?.nombre || "Concepto",
      periodo: deuda.periodo,
      valor: deuda.monto_abonado || deuda.valor_cargado,
    }));

    // Construir objeto completo
    const reciboCompleto = {
      empresa,
      recibo: {
        numero: `RC-${new Date().getFullYear()}-${String(ingresoId).padStart(
          6,
          "0"
        )}`,
        fecha: fechaPago || new Date().toISOString(),
      },
      cliente: {
        placa: vehiculo.placa,
        tipo_vehiculo: vehiculo.tipo_vehiculo_display || vehiculo.tipo_vehiculo,
        propietario: vehiculo.propietario_nombre || "N/A",
        conductor: vehiculo.conductor_actual_nombre || null,
      },
      items,
      totales: {
        total_pagado: totalPagado,
      },
      pago: {
        medio_pago: mediosPagoMap[medioPago] || medioPago,
        observaciones: observacion || null,
      },
      cajero: {
        nombre:
          user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.email || "Usuario",
        usuario: user?.email || "N/A",
      },
      ingresoId, // Include top-level ingresoId for download button
    };

    console.log(
      "✅ [useReciboData] Datos del recibo construidos exitosamente:",
      reciboCompleto
    );
    return reciboCompleto;
  };

  return { buildReciboData };
};

export default useReciboData;
