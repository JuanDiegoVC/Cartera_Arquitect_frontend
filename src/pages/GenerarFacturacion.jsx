import { useState, useEffect } from "react";
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
  Shield,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { facturacionService } from "../services/facturacionService";
import apiClient from "../services/api"; // Importar apiClient para fetchVehiculos

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

  // Estados para Pre-Facturación (Seguridad)
  const [showPreFacturacion, setShowPreFacturacion] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [seguridadValues, setSeguridadValues] = useState({}); // { placa: valor }
  const [globalSecurityValue, setGlobalSecurityValue] = useState("");
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVehiculos = async () => {
    setLoadingVehiculos(true);
    try {
      // Usar el endpoint de vehículos activos
      const response = await apiClient.get("/v1/flota/vehiculos/?estado=activo&limit=1000"); // Asumiendo paginación, pedir muchos o manejar paginación
      // Nota: Si la API pagina, habría que manejarlo. Por ahora asumimos que devuelve la lista o 'results'
      const data = response.data.results || response.data;
      setVehiculos(data);

      // Inicializar valores de seguridad en 0 o vacío
      const initialValues = {};
      data.forEach(v => {
        initialValues[v.placa] = "";
      });
      setSeguridadValues(initialValues);

    } catch (err) {
      console.error("Error cargando vehículos:", err);
      setError("Error al cargar la lista de vehículos para configurar seguridad.");
    } finally {
      setLoadingVehiculos(false);
    }
  };

  const handleIniciarGeneracion = async () => {
    if (!selectedMonth) {
      setError("Por favor seleccione un mes");
      return;
    }
    setError(null);
    setResultado(null);

    // 1. Cargar vehículos y mostrar modal de pre-facturación
    await fetchVehiculos();
    setShowPreFacturacion(true);
  };

  const handleApplyGlobalValue = () => {
    const newValues = { ...seguridadValues };
    vehiculos.forEach(v => {
      // Solo aplicar a los visibles si hay filtro? O a todos?
      // Por simplicidad, aplicamos a todos los cargados
      newValues[v.placa] = globalSecurityValue;
    });
    setSeguridadValues(newValues);
  };

  const handleSecurityValueChange = (placa, value) => {
    setSeguridadValues(prev => ({
      ...prev,
      [placa]: value
    }));
  };

  const handleConfirmarGeneracion = async () => {
    setLoading(true);
    setError(null);
    setShowPreFacturacion(false); // Cerrar modal

    try {
      // Convertir YYYY-MM a YYYY-MM-01 para el backend
      const periodo = `${selectedMonth}-01`;

      // Preparar payload de seguridad variable
      const seguridadPayload = Object.entries(seguridadValues)
        .filter(([_, valor]) => valor && !isNaN(valor) && Number(valor) > 0)
        .map(([placa, valor]) => ({
          placa,
          valor: Number(valor)
        }));

      const response = await facturacionService.generarCargos(periodo, seguridadPayload);
      setResultado(response.detalles);
    } catch (err) {
      console.error("Error generando cargos:", err);
      setError(
        err.detalle ||
        err.error ||
        "Error al generar los cargos. Por favor intente nuevamente."
      );
      // Si falla, quizás queramos volver a mostrar el modal? 
      // Por ahora lo dejamos cerrado para ver el error.
    } finally {
      setLoading(false);
    }
  };

  const formatMonthYear = (dateString) => {
    if (!dateString) return "";
    // Append T12:00:00 to avoid timezone issues (UTC vs Local)
    // "YYYY-MM-DD" is parsed as UTC midnight, which is previous day in UTC-5
    const date = new Date(`${dateString}T12:00:00`);
    return date.toLocaleDateString("es-CO", { year: "numeric", month: "long" });
  };

  // Filtrar vehículos en el modal
  const filteredVehiculos = vehiculos.filter(v =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.propietario_nombre && v.propietario_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Generar Facturación Mensual
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Genera automáticamente los cargos fijos (Administración y Pólizas)
          y variables (Seguridad) para todos los vehículos activos.
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
              <strong>Administración</strong>, <strong>Pólizas</strong> y <strong>Seguridad</strong> (opcional) para
              todos los vehículos con estado activo.
            </AlertDescription>
          </Alert>

          {/* Botón de Acción */}
          <Button
            onClick={handleIniciarGeneracion}
            disabled={loading || !selectedMonth}
            className="w-full sm:w-auto sm:min-w-[200px] gap-2 text-sm sm:text-base py-2.5 sm:py-3"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />
                Configurar y Generar
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
                (Administración, Pólizas y Seguridad)
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

      {/* Modal de Pre-Facturación (Seguridad) */}
      <Dialog open={showPreFacturacion} onOpenChange={setShowPreFacturacion}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Configurar Rubro de Seguridad (Variable)
            </DialogTitle>
            <DialogDescription>
              Ingrese el valor de seguridad para este mes. Puede aplicar un valor global o editar individualmente.
              Deje en 0 o vacío para no cobrar seguridad a un vehículo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
            {/* Controles Globales */}
            <div className="flex flex-col sm:flex-row gap-4 items-end bg-muted/30 p-4 rounded-lg">
              <div className="w-full sm:w-1/3 space-y-2">
                <Label>Valor Global de Seguridad</Label>
                <Input
                  type="number"
                  placeholder="Ej: 50000"
                  value={globalSecurityValue}
                  onChange={(e) => setGlobalSecurityValue(e.target.value)}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleApplyGlobalValue}
                disabled={!globalSecurityValue}
              >
                Aplicar a Todos
              </Button>
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar placa..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Lista de Vehículos */}
            <div className="flex-1 overflow-y-auto border rounded-md">
              {loadingVehiculos ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Placa</th>
                      <th className="px-4 py-3">Propietario</th>
                      <th className="px-4 py-3">Valor Seguridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehiculos.length > 0 ? (
                      filteredVehiculos.map((vehiculo) => (
                        <tr key={vehiculo.placa} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3 font-medium">{vehiculo.placa}</td>
                          <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">
                            {vehiculo.propietario_nombre || "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              className="h-8 w-32"
                              placeholder="0"
                              value={seguridadValues[vehiculo.placa] || ""}
                              onChange={(e) => handleSecurityValueChange(vehiculo.placa, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-muted-foreground">
                          No se encontraron vehículos activos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowPreFacturacion(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmarGeneracion}>
              Confirmar y Generar Facturas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
