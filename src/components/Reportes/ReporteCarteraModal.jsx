import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogBody,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { reportesService } from "../../services/reportesService";
import { VEHICLE_TYPES } from "../../utils/formatters";

export default function ReporteCarteraModal({ open, onOpenChange }) {
  const [filtros, setFiltros] = useState({
    fechaInicio: "",
    fechaFin: "",
    tipoVehiculo: "todos",
    incluirPagadas: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Manejador de cambio de inputs
   */
  const handleInputChange = (field, value) => {
    setFiltros((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error al cambiar filtros
    setError(null);
  };

  /**
   * Manejador de descarga del reporte
   */
  const handleDescargar = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validar que si hay fecha inicio, también haya fecha fin
      if (filtros.fechaInicio && !filtros.fechaFin) {
        setError("Si especifica una fecha de inicio, debe especificar también una fecha de fin");
        setIsLoading(false);
        return;
      }

      if (!filtros.fechaInicio && filtros.fechaFin) {
        setError("Si especifica una fecha de fin, debe especificar también una fecha de inicio");
        setIsLoading(false);
        return;
      }

      // Validar que fecha inicio sea menor o igual a fecha fin
      if (filtros.fechaInicio && filtros.fechaFin) {
        if (new Date(filtros.fechaInicio) > new Date(filtros.fechaFin)) {
          setError("La fecha de inicio debe ser anterior o igual a la fecha de fin");
          setIsLoading(false);
          return;
        }
      }

      // Descargar reporte
      const response = await reportesService.descargarReporteCartera(filtros);

      // Descargar archivo
      reportesService.descargarArchivo(response, "Reporte_Cartera_Detallada");

      // Cerrar modal después de descargar
      setTimeout(() => {
        onOpenChange(false);
        // Resetear filtros
        setFiltros({
          fechaInicio: "",
          fechaFin: "",
          tipoVehiculo: "todos",
          incluirPagadas: false,
        });
      }, 500);
    } catch (err) {
      console.error("Error al descargar reporte:", err);

      // Manejar error de respuesta blob
      if (err instanceof Blob) {
        try {
          const text = await err.text();
          setError(text || "Error al generar el reporte");
        } catch {
          setError("Error al generar el reporte");
        }
      } else {
        setError(
          err.message ||
          err.detalle ||
          "Error al descargar el reporte. Por favor, intente nuevamente."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manejador de cancelación
   */
  const handleCancelar = () => {
    onOpenChange(false);
    // Resetear filtros
    setFiltros({
      fechaInicio: "",
      fechaFin: "",
      tipoVehiculo: "todos",
      incluirPagadas: false,
    });
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle>Configurar Reporte de Cartera</DialogTitle>
                <DialogDescription>
                  Seleccione los filtros para generar el reporte en Excel
                </DialogDescription>
              </div>
            </div>
            <DialogClose onClose={() => onOpenChange(false)} />
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="space-y-6">
            {/* Filtros de Fecha */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Periodo (Opcional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha Desde</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={filtros.fechaInicio}
                    onChange={(e) =>
                      handleInputChange("fechaInicio", e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha Hasta</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    value={filtros.fechaFin}
                    onChange={(e) =>
                      handleInputChange("fechaFin", e.target.value)
                    }
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Si no especifica fechas, se incluirán todas las deudas activas
              </p>
            </div>

            {/* Filtro de Tipo de Vehículo */}
            <div className="space-y-2">
              <Label htmlFor="tipoVehiculo">Tipo de Vehículo</Label>
              <Select
                id="tipoVehiculo"
                value={filtros.tipoVehiculo}
                onChange={(e) =>
                  handleInputChange("tipoVehiculo", e.target.value)
                }
                disabled={isLoading}
                className="w-full"
              >
                <option value="todos">Todos los tipos</option>
                {VEHICLE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </div>

            {/* Checkbox Incluir Pagadas */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 bg-muted/10">
              <Checkbox
                id="incluirPagadas"
                checked={filtros.incluirPagadas}
                onCheckedChange={(checked) =>
                  handleInputChange("incluirPagadas", checked)
                }
                disabled={isLoading}
              />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="incluirPagadas"
                  className="cursor-pointer font-medium"
                >
                  Incluir deudas completamente pagadas
                </Label>
                <p className="text-xs text-muted-foreground">
                  Por defecto solo se muestran deudas pendientes y con abonos
                  parciales
                </p>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Información adicional */}
            <div className="rounded-lg border bg-blue-50 border-blue-200 p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                📊 Información del Reporte
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • El reporte incluye: Placa, Propietario, Tipo, Periodo,
                  Rubro, Valores
                </li>
                <li>
                  • Se incluyen totales por rubro y tipo de vehículo al final
                </li>
                <li>• El archivo se descargará en formato Excel (.xlsx)</li>
              </ul>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancelar}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleDescargar} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
