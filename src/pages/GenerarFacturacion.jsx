import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { facturacionService } from "../services/facturacionService";

/**
 * Componente para generar facturación mensual automática
 * HU-03: Generación automática de cargos mensuales
 * Solo accesible para administradores
 */
export default function GenerarFacturacion() {
  // Obtener el mes actual en formato YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerarCargos = async () => {
    if (!selectedMonth) {
      setError("Por favor seleccione un mes");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      // Convertir YYYY-MM a YYYY-MM-01 para el backend
      const periodo = `${selectedMonth}-01`;
      const response = await facturacionService.generarCargos(periodo);
      setResultado(response.detalles);
    } catch (err) {
      console.error("Error generando cargos:", err);
      setError(
        err.detalle ||
          err.error ||
          "Error al generar los cargos. Por favor intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatMonthYear = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CO", { year: "numeric", month: "long" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Generar Facturación Mensual
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Genera automáticamente los cargos fijos (Administración y Pólizas)
          para todos los vehículos activos
        </p>
      </div>

      {/* Card Principal */}
      <Card className="shadow-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileSpreadsheet className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Configuración de Generación
          </CardTitle>
          <CardDescription className="text-sm">
            Seleccione el mes para el cual desea generar los cargos automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de Mes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Mes de Facturación
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm sm:text-base"
                disabled={loading}
              />
            </div>
            {selectedMonth && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Se generarán cargos para:{" "}
                <span className="font-semibold capitalize">
                  {formatMonthYear(`${selectedMonth}-01`)}
                </span>
              </p>
            )}
          </div>

          {/* Información */}
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> Esta acción generará cargos de{" "}
              <strong>Administración</strong> y <strong>Pólizas</strong> para
              todos los vehículos con estado activo. Los cargos duplicados serán
              omitidos automáticamente.
            </AlertDescription>
          </Alert>

          {/* Botón de Acción */}
          <Button
            onClick={handleGenerarCargos}
            disabled={loading || !selectedMonth}
            className="w-full sm:w-auto sm:min-w-[200px] gap-2 text-sm sm:text-base py-2.5 sm:py-3"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Generando Cargos...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />
                Generar Cargos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Mensaje de Error */}
      {error && (
        <Alert
          variant="destructive"
          className="animate-in fade-in slide-in-from-top-2"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Resultado Exitoso */}
      {resultado && (
        <Card className="shadow-md border-success bg-success/5 animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success text-lg sm:text-xl">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              Cargos Generados Exitosamente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-4 space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Periodo
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground capitalize">
                  {formatMonthYear(resultado.periodo)}
                </p>
              </div>

              <div className="bg-background rounded-lg p-4 space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Vehículos
                </p>
                <p className="text-lg sm:text-2xl font-bold text-primary">
                  {resultado.vehiculos_procesados}
                </p>
                <p className="text-xs text-muted-foreground">Procesados</p>
              </div>

              <div className="bg-background rounded-lg p-4 space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Deudas Creadas
                </p>
                <p className="text-lg sm:text-2xl font-bold text-success">
                  {resultado.deudas_creadas}
                </p>
                <p className="text-xs text-muted-foreground">
                  Nuevos registros
                </p>
              </div>

              <div className="bg-background rounded-lg p-4 space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Duplicados
                </p>
                <p className="text-lg sm:text-2xl font-bold text-warning">
                  {resultado.deudas_duplicadas}
                </p>
                <p className="text-xs text-muted-foreground">Omitidos</p>
              </div>
            </div>

            <div className="mt-4 p-3 sm:p-4 bg-background rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">
                ✓ Se procesaron{" "}
                <strong>{resultado.rubros_procesados} rubros</strong>{" "}
                (Administración y Pólizas)
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                ✓ Total de registros en base de datos:{" "}
                <strong>
                  {resultado.deudas_creadas + resultado.deudas_duplicadas}
                </strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones */}
      {!resultado && !error && !loading && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3 text-sm sm:text-base">
              ¿Cómo funciona?
            </h3>
            <ol className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                Seleccione el mes para el cual desea generar los cargos
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                El sistema identificará todos los vehículos con estado "Activo"
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                Se generarán automáticamente cargos de Administración y Pólizas
                según las tarifas configuradas
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">4.</span>
                Los cargos duplicados serán detectados y omitidos
                automáticamente
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
