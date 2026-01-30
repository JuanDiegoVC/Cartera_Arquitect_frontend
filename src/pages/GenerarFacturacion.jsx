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
  Plus,
  Trash2,
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
import { facturacionService } from "../services/facturacionService";
import { cobrosService } from "../services/cobrosService";
import apiClient from "../services/api";
import CorreccionFacturas from "../components/facturacion/CorreccionFacturas";

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

  // Estados del modal de pre-facturación
  const [showPreFacturacion, setShowPreFacturacion] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [loadingVehiculos, setLoadingVehiculos] = useState(false);

  // Estados para Rubros Ocasionales
  const [rubrosOcasionalesList, setRubrosList] = useState([]);
  const [rubrosOcasionalesAgregados, setRubrosOcasionalesAgregados] = useState([]);
  const [newOcasional, setNewOcasional] = useState({
    placa: "",
    rubro_id: "",
    valor: "",
  });
  const [ocasionalSearch, setOcasionalSearch] = useState("");

  // Estado para generación de pólizas
  const [generatingPolizas, setGeneratingPolizas] = useState(false);

  // Estado para generación de rubros ocasionales independientes
  const [generatingOcasionales, setGeneratingOcasionales] = useState(false);
  const [resultadoOcasionales, setResultadoOcasionales] = useState(null);

  const fetchVehiculos = async () => {
    setLoadingVehiculos(true);
    try {
      const response = await apiClient.get(
        "/v1/flota/vehiculos/?estado=activo&limit=1000"
      );
      const data = response.data.results || response.data;
      setVehiculos(data);
    } catch (err) {
      console.error("Error cargando vehículos:", err);
      setError("Error al cargar la lista de vehículos.");
    } finally {
      setLoadingVehiculos(false);
    }
  };

  const fetchRubrosOcasionales = async () => {
    try {
      const rubros = await cobrosService.getAllRubros();
      // Ensure we are filtering correctly based on the API response structure
      // The API might return a list directly or a paginated object
      const list = Array.isArray(rubros) ? rubros : rubros.results || [];
      const ocasionales = list.filter((r) => r.es_ocasional);
      setRubrosList(ocasionales);
    } catch (err) {
      console.error("Error cargando rubros:", err);
    }
  };

  const handleIniciarGeneracion = async () => {
    if (!selectedMonth) {
      setError("Por favor seleccione un mes");
      return;
    }
    setError(null);
    setResultado(null);

    // Cargar vehículos y rubros ocasionales, y mostrar modal
    await Promise.all([fetchVehiculos(), fetchRubrosOcasionales()]);
    setShowPreFacturacion(true);
  };

  const handleAddOcasional = () => {
    if (!newOcasional.placa || !newOcasional.rubro_id || !newOcasional.valor)
      return;

    // Encontrar nombre del rubro para mostrar
    const rubroObj = rubrosOcasionalesList.find(
      (r) => r.rubro_id === parseInt(newOcasional.rubro_id)
    );

    setRubrosOcasionalesAgregados([
      ...rubrosOcasionalesAgregados,
      { ...newOcasional, rubro_nombre: rubroObj?.nombre },
    ]);
    setNewOcasional((prev) => ({
      ...prev,
      rubro_id: "",
      valor: "",
      placa: "",
    }));
    setOcasionalSearch(""); // Reset search
  };

  const handleRemoveOcasional = (index) => {
    const newList = [...rubrosOcasionalesAgregados];
    newList.splice(index, 1);
    setRubrosOcasionalesAgregados(newList);
  };

  const handleConfirmarGeneracion = async () => {
    setLoading(true);
    setError(null);
    setShowPreFacturacion(false);

    try {
      // Convertir YYYY-MM a YYYY-MM-01 para el backend
      const periodo = `${selectedMonth}-01`;

      // Enviar rubros ocasionales agregados (sin seguridad variable)
      // Nota: Este método genera rubros fijos + ocasionales
      const response = await facturacionService.generarCargos(
        periodo,
        [], // Sin seguridad variable
        rubrosOcasionalesAgregados
      );
      setResultado(response.detalles);
      // Limpiar rubros ocasionales después de generar
      setRubrosOcasionalesAgregados([]);
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

  /**
   * Genera solo los rubros ocasionales sin afectar los rubros fijos (administración, etc.)
   */
  const handleGenerarSoloOcasionales = async () => {
    if (rubrosOcasionalesAgregados.length === 0) {
      setError("Debe agregar al menos un rubro ocasional antes de generar.");
      return;
    }

    setGeneratingOcasionales(true);
    setError(null);
    setResultadoOcasionales(null);

    try {
      const periodo = `${selectedMonth}-01`;
      const response = await facturacionService.generarRubrosOcasionales(
        periodo,
        rubrosOcasionalesAgregados
      );
      setResultadoOcasionales(response.detalles);
      setRubrosOcasionalesAgregados([]);
      
      // Mostrar mensaje de éxito
      if (response.detalles?.errores?.length > 0) {
        setError(`Algunos registros tuvieron errores: ${response.detalles.errores.join(", ")}`);
      }
    } catch (err) {
      console.error("Error generando rubros ocasionales:", err);
      setError(
        err.detalle ||
        err.error ||
        "Error al generar los rubros ocasionales. Por favor intente nuevamente."
      );
    } finally {
      setGeneratingOcasionales(false);
    }
  };

  const handleGenerarPolizas = async () => {
    if (
      !window.confirm(
        "¿Está seguro de generar las pólizas anuales? Esto creará una deuda para todos los vehículos según su tipo."
      )
    ) {
      return;
    }

    setGeneratingPolizas(true);
    try {
      const response = await facturacionService.generarPolizas();
      alert(response.mensaje + "\n" + (response.detalle || ""));
      // Opcional: cerrar modal o refrescar algo
    } catch (err) {
      console.error("Error generando pólizas:", err);
      alert("Error al generar pólizas: " + (err.error || "Error desconocido"));
    } finally {
      setGeneratingPolizas(false);
    }
  };

  const formatMonthYear = (dateString) => {
    if (!dateString) return "";
    // Append T12:00:00 to avoid timezone issues (UTC vs Local)
    // "YYYY-MM-DD" is parsed as UTC midnight, which is previous day in UTC-5
    const date = new Date(`${dateString}T12:00:00`);
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
          Genera automáticamente los cargos fijos mensuales para todos los vehículos activos.
          <br />
          <span className="text-xs text-muted-foreground">
            Rubros: <strong>administracion</strong> y <strong>admin,despachadores,f.reposicion</strong>
          </span>
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

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                <strong>Importante:</strong> Esta acción generará cargos de{" "}
                <strong>administracion</strong> y{" "}
                <strong>admin,despachadores,f.reposicion</strong> para todos los
                vehículos activos del mes seleccionado.
                <br />
                <span className="text-xs mt-1 block">
                  Nota: Los demás rubros variables (Seguridad social, fondo de reposición, etc.)
                  deben cargarse mediante la <strong>Carga Masiva</strong>.
                </span>
              </AlertDescription>
            </Alert>

            {/* Botón de Acción */}
            <Button
              onClick={handleIniciarGeneracion}
              disabled={loading || !selectedMonth}
              className="w-full sm:w-auto sm:min-w-[200px] gap-2 text-sm sm:text-base py-2.5 sm:py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 sm:h-5 sm:w-5" />
                  Generar Facturación
                </>
              )}
            </Button>
          </div>
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

      {/* ========== CORRECCIÓN DE FACTURAS (Componente Separado) ========== */}
      <CorreccionFacturas />

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
                (administracion, admin,despachadores,f.reposicion y Ocasionales)
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

      {/* Resultado Exitoso - Rubros Ocasionales */}
      {resultadoOcasionales && (
        <Card className="shadow-md border-success bg-success/5 animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success text-lg sm:text-xl">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
              Rubros Ocasionales Generados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4 space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Periodo
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground capitalize">
                  {formatMonthYear(resultadoOcasionales.periodo)}
                </p>
              </div>

              <div className="bg-background rounded-lg p-4 space-y-1">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Deudas Creadas
                </p>
                <p className="text-lg sm:text-2xl font-bold text-success">
                  {resultadoOcasionales.deudas_creadas}
                </p>
                <p className="text-xs text-muted-foreground">
                  Cargos ocasionales
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 sm:p-4 bg-background rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground">
                ✓ {resultadoOcasionales.mensaje}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setResultadoOcasionales(null)}
            >
              Cerrar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Pre-Facturación (Rubros Ocasionales) */}
      <Dialog open={showPreFacturacion} onOpenChange={setShowPreFacturacion}>
        <DialogContent className="max-w-4xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Generar Facturación - {formatMonthYear(`${selectedMonth}-01`)}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Se generarán cargos de <strong>administracion</strong> y{" "}
              <strong>admin,despachadores,f.reposicion</strong> para todos los vehículos activos.
              <br />
              Opcionalmente, puede agregar rubros ocasionales a vehículos específicos.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-24 sm:pb-6">
            {/* Información de rubros fijos */}
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-2">Rubros fijos que se generarán automáticamente:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>administracion</strong> - Para todos los vehículos activos</li>
                  <li><strong>admin,despachadores,f.reposicion</strong> - Para todos los vehículos intermunicipales</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Rubros Ocasionales */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                Rubros Ocasionales (Comisiones, Multas, Cobros Extra)
              </h3>

              <div className="bg-muted/30 p-4 rounded-lg border">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-1/3 space-y-1.5 relative">
                    <Label className="text-xs font-medium">Vehículo</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar placa..."
                        className="pl-8 h-9"
                        value={ocasionalSearch}
                        onChange={(e) => {
                          setOcasionalSearch(e.target.value);
                          if (!e.target.value)
                            setNewOcasional((prev) => ({ ...prev, placa: "" }));
                        }}
                      />
                    </div>
                    {/* Dropdown de resultados */}
                    {ocasionalSearch && !newOcasional.placa && (
                      <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-40 overflow-y-auto">
                        {vehiculos
                          .filter((v) =>
                            v.placa.includes(ocasionalSearch.toUpperCase())
                          )
                          .map((v) => (
                            <div
                              key={v.placa}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                setNewOcasional((prev) => ({
                                  ...prev,
                                  placa: v.placa,
                                }));
                                setOcasionalSearch(v.placa);
                              }}
                            >
                              <span className="font-medium">{v.placa}</span>
                              {v.propietario_nombre && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  - {v.propietario_nombre}
                                </span>
                              )}
                            </div>
                          ))}
                        {vehiculos.filter((v) =>
                          v.placa.includes(ocasionalSearch.toUpperCase())
                        ).length === 0 && (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              No se encontraron vehículos
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-1/3 space-y-1.5">
                    <Label className="text-xs font-medium">Rubro</Label>
                    <select
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={newOcasional.rubro_id}
                      onChange={(e) =>
                        setNewOcasional({
                          ...newOcasional,
                          rubro_id: e.target.value,
                        })
                      }
                    >
                      <option value="">Seleccione rubro...</option>
                      {rubrosOcasionalesList.map((r) => (
                        <option key={r.rubro_id} value={r.rubro_id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-1/4 space-y-1.5">
                    <Label className="text-xs font-medium">Valor</Label>
                    <Input
                      type="number"
                      className="h-9"
                      placeholder="0"
                      value={newOcasional.valor}
                      onChange={(e) =>
                        setNewOcasional({
                          ...newOcasional,
                          valor: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleAddOcasional}
                    disabled={
                      !newOcasional.placa ||
                      !newOcasional.rubro_id ||
                      !newOcasional.valor
                    }
                    className="h-9 px-3 sm:px-4 w-full md:w-auto"
                  >
                    <Plus className="h-4 w-4 sm:mr-2" /> 
                    <span className="hidden sm:inline">Agregar</span>
                  </Button>
                </div>

                {/* Lista de agregados */}
                {rubrosOcasionalesAgregados.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-background border rounded-md overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm min-w-[300px]">
                        <thead className="bg-muted/50 text-[10px] sm:text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 text-left font-medium">Placa</th>
                            <th className="px-2 sm:px-4 py-2 text-left font-medium">Rubro</th>
                            <th className="px-2 sm:px-4 py-2 text-left font-medium">Valor</th>
                            <th className="px-2 sm:px-4 py-2 w-8 sm:w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {rubrosOcasionalesAgregados.map((item, idx) => (
                            <tr
                              key={idx}
                              className="border-b last:border-0 hover:bg-muted/20"
                            >
                              <td className="px-2 sm:px-4 py-2 font-medium">{item.placa}</td>
                              <td className="px-2 sm:px-4 py-2 truncate max-w-[100px] sm:max-w-none">{item.rubro_nombre}</td>
                              <td className="px-2 sm:px-4 py-2">${Number(item.valor).toLocaleString("es-CO")}</td>
                              <td className="px-2 sm:px-4 py-2 text-right">
                                <button
                                  onClick={() => handleRemoveOcasional(idx)}
                                  className="text-destructive hover:text-destructive/80 transition-colors p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Botón para generar solo rubros ocasionales */}
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleGenerarSoloOcasionales}
                        disabled={generatingOcasionales || rubrosOcasionalesAgregados.length === 0}
                        className="gap-2"
                      >
                        {generatingOcasionales ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Generar Solo Ocasionales
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>Tip:</strong> Use "Generar Solo Ocasionales" para crear únicamente estos rubros sin afectar la facturación mensual (administración, etc.).
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </section>

            {/* Botón de Pólizas (opcional) */}
            <section className="pt-4 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium">Pólizas Anuales</h4>
                  <p className="text-xs text-muted-foreground">Genera pólizas anuales para todos los vehículos</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950 w-full sm:w-auto shrink-0"
                  onClick={handleGenerarPolizas}
                  disabled={generatingPolizas}
                >
                  {generatingPolizas ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Generar Pólizas
                    </>
                  )}
                </Button>
              </div>
            </section>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/10 flex flex-col-reverse sm:flex-row gap-2 sticky bottom-0 z-10">
            <Button
              variant="ghost"
              onClick={() => setShowPreFacturacion(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarGeneracion}
              className="w-full sm:flex-1"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              <span className="truncate">Generar Facturación Completa</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
