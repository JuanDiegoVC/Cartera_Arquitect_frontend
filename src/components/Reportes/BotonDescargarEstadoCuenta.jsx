import { pdf } from "@react-pdf/renderer";
import { Button } from "../ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { useState } from "react";
import EstadoCuentaDocument from "./EstadoCuentaDocument";

/**
 * Componente Botón para Descargar Estado de Cuenta en PDF
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.vehicleData - Datos del vehículo con deudas pendientes
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {string} [props.variant] - Variante del botón
 */
const BotonDescargarEstadoCuenta = ({
  vehicleData,
  className = "",
  variant = "default",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Construir datos para el documento PDF
  const buildEstadoCuentaData = () => {
    const deudas = vehicleData.deudas_pendientes
      ?.filter((deuda) => deuda.estado_deuda !== "anulada")
      .map((deuda) => ({
        concepto: deuda.rubro?.nombre || "Sin concepto",
        periodo: deuda.periodo,
        valor: parseFloat(deuda.valor_cargado) || 0,
        abonado:
          (parseFloat(deuda.valor_cargado) || 0) -
          (parseFloat(deuda.saldo_pendiente) || 0),
        saldo: parseFloat(deuda.saldo_pendiente) || 0,
      })) || [];

    const totalDeuda = deudas.reduce((acc, d) => acc + d.saldo, 0);
    const totalCargado = deudas.reduce((acc, d) => acc + d.valor, 0);
    const totalAbonado = deudas.reduce((acc, d) => acc + d.abonado, 0);

    return {
      empresa: {
        nombre: "SOCIEDAD TRANSPORTADORA DE EL PEÑOL",
        nit: "800.123.456-7",
        direccion: "Cra. 17 #734, Peñol, Antioquia",
        telefono: "(604) 2309116",
      },
      vehiculo: {
        placa: vehicleData.placa || "",
        tipo_vehiculo: vehicleData.tipo_vehiculo || "",
        propietario: vehicleData.propietario_nombre || "No registrado",
        conductor: vehicleData.conductor_nombre || null,
        numero_interno: vehicleData.numero_interno || null,
      },
      deudas,
      resumen: {
        totalDeuda,
        totalCargado,
        totalAbonado,
        cantidadDeudas: deudas.length,
      },
      fechaGeneracion: new Date().toISOString(),
    };
  };

  // Generar nombre de archivo
  const generarNombreArchivo = () => {
    const fecha = new Date();
    const fechaStr = `${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, "0")}${String(fecha.getDate()).padStart(2, "0")}`;
    const placa = vehicleData.placa || "VEHICULO";
    return `EstadoCuenta_${placa}_${fechaStr}.pdf`;
  };

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const datosEstadoCuenta = buildEstadoCuentaData();

      // Generar el PDF
      const blob = await pdf(
        <EstadoCuentaDocument datosEstadoCuenta={datosEstadoCuenta} />
      ).toBlob();

      // Crear URL del blob
      const url = URL.createObjectURL(blob);

      // Crear enlace temporal y simular click
      const link = document.createElement("a");
      link.href = url;
      link.download = generarNombreArchivo();
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Error al generar el estado de cuenta. Por favor intente de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      disabled={isGenerating}
      onClick={handleDownload}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Descargar Estado de Cuenta
        </>
      )}
    </Button>
  );
};

export default BotonDescargarEstadoCuenta;
