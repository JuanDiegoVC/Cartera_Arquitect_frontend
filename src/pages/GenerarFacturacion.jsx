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
  Trash2
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
import { cobrosService } from "../services/cobrosService";
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

  // Estados para Rubros Ocasionales
  const [rubrosOcasionalesList, setRubrosList] = useState([]);
  const [rubrosOcasionalesAgregados, setRubrosOcasionalesAgregados] = useState([]);
  const [newOcasional, setNewOcasional] = useState({ placa: "", rubro_id: "", valor: "" });
  const [ocasionalSearch, setOcasionalSearch] = useState(""); // Search term for occasional rubros

  // Estado para generación de pólizas
  const [generatingPolizas, setGeneratingPolizas] = useState(false);


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

  const fetchRubrosOcasionales = async () => {
    try {
      const rubros = await cobrosService.getAllRubros();
      // Ensure we are filtering correctly based on the API response structure
      // The API might return a list directly or a paginated object
      const list = Array.isArray(rubros) ? rubros : (rubros.results || []);
      const ocasionales = list.filter(r => r.es_ocasional);
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

    // 1. Cargar vehículos y rubros, y mostrar modal de pre-facturación
    await Promise.all([fetchVehiculos(), fetchRubrosOcasionales()]);
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

  const handleAddOcasional = () => {
    if (!newOcasional.placa || !newOcasional.rubro_id || !newOcasional.valor) return;

    // Encontrar nombre del rubro para mostrar
    const rubroObj = rubrosOcasionalesList.find(r => r.rubro_id === parseInt(newOcasional.rubro_id));

    setRubrosOcasionalesAgregados([
      ...rubrosOcasionalesAgregados,
      { ...newOcasional, rubro_nombre: rubroObj?.nombre }
    ]);
    setNewOcasional(prev => ({ ...prev, rubro_id: "", valor: "", placa: "" }));
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

      const response = await facturacionService.generarCargos(periodo, seguridadPayload, rubrosOcasionalesAgregados);
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

  const handleGenerarPolizas = async () => {
    if (!window.confirm("¿Está seguro de generar las pólizas anuales? Esto creará una deuda para todos los vehículos según su tipo.")) {
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
          Genera automáticamente los cargos fijos (Administración)
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

            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                <strong>Importante:</strong> Esta acción generará cargos de <strong>Administración</strong> y <strong>Seguridad</strong> (opcional).
                <br />
                <span className="text-xs mt-1 block">
                  Nota: Las <strong>Pólizas</strong> se generan anualmente mediante el botón en el siguiente paso.
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
                  Configurar y Generar
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
                (Administración, Seguridad y Ocasionales)
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

      {/* Modal de Pre-Facturación (Seguridad y Pólizas) */}
      <Dialog open={showPreFacturacion} onOpenChange={setShowPreFacturacion}>
        <DialogContent className="max-w-6xl h-[95vh] sm:h-auto sm:max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Shield className="h-5 w-5 text-primary" />
              Configurar Rubros Variables y Pólizas
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Configure los valores de seguridad y rubros ocasionales para este mes. También puede generar las pólizas anuales.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-24 sm:pb-6">

            {/* 1. Seguridad Variable */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Seguridad (Variable)
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar placa..."
                      className="pl-8 h-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-end border">
                <div className="w-full sm:w-1/3 space-y-1.5">
                  <Label className="text-xs font-medium">Valor Global de Seguridad</Label>
                  <Input
                    type="number"
                    placeholder="Ej: 50000"
                    value={globalSecurityValue}
                    onChange={(e) => setGlobalSecurityValue(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button
                  variant="secondary"
                  onClick={handleApplyGlobalValue}
                  disabled={!globalSecurityValue}
                  size="sm"
                  className="h-9"
                >
                  Aplicar a Todos
                </Button>
              </div>

              <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                {loadingVehiculos ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 font-medium">Placa</th>
                        <th className="px-4 py-3 font-medium">Propietario</th>
                        <th className="px-4 py-3 font-medium w-40">Valor Seguridad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehiculos.length > 0 ? (
                        filteredVehiculos.map((vehiculo) => (
                          <tr key={vehiculo.placa} className="border-b hover:bg-muted/50 last:border-0">
                            <td className="px-4 py-2 font-medium">{vehiculo.placa}</td>
                            <td className="px-4 py-2 text-muted-foreground truncate max-w-[200px]">
                              {vehiculo.propietario_nombre || "N/A"}
                            </td>
                            <td className="px-4 py-1.5">
                              <Input
                                type="number"
                                className="h-8 w-full"
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
            </section>

            {/* 2. Rubros Ocasionales */}
            <section className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4 text-muted-foreground" />
                Rubros Ocasionales (Multas, Cobros Extra)
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
                          // Si borra, limpiar selección
                          if (!e.target.value) setNewOcasional(prev => ({ ...prev, placa: "" }));
                        }}
                      />
                    </div>
                    {/* Dropdown de resultados */}
                    {ocasionalSearch && !newOcasional.placa && (
                      <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-40 overflow-y-auto">
                        {vehiculos
                          .filter(v => v.placa.includes(ocasionalSearch.toUpperCase()))
                          .map(v => (
                            <div
                              key={v.placa}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              onClick={() => {
                                setNewOcasional(prev => ({ ...prev, placa: v.placa }));
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
                        {vehiculos.filter(v => v.placa.includes(ocasionalSearch.toUpperCase())).length === 0 && (
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
                      onChange={e => setNewOcasional({ ...newOcasional, rubro_id: e.target.value })}
                    >
                      <option value="">Seleccione rubro...</option>
                      {rubrosOcasionalesList.map(r => (
                        <option key={r.rubro_id} value={r.rubro_id}>{r.nombre}</option>
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
                      onChange={e => setNewOcasional({ ...newOcasional, valor: e.target.value })}
                    />
                  </div>
                  <Button size="sm" onClick={handleAddOcasional} disabled={!newOcasional.placa || !newOcasional.rubro_id || !newOcasional.valor} className="h-9 px-4">
                    <Plus className="h-4 w-4 mr-2" /> Agregar
                  </Button>
                </div>

                {/* Lista de agregados */}
                {rubrosOcasionalesAgregados.length > 0 && (
                  <div className="mt-4 bg-background border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Placa</th>
                          <th className="px-4 py-2 text-left font-medium">Rubro</th>
                          <th className="px-4 py-2 text-left font-medium">Valor</th>
                          <th className="px-4 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rubrosOcasionalesAgregados.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-4 py-2 font-medium">{item.placa}</td>
                            <td className="px-4 py-2">{item.rubro_nombre}</td>
                            <td className="px-4 py-2">${item.valor}</td>
                            <td className="px-4 py-2 text-right">
                              <button onClick={() => handleRemoveOcasional(idx)} className="text-destructive hover:text-destructive/80 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>

          <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-muted/10 flex flex-col gap-3 sticky bottom-0 z-50">
            <Button
              variant="outline"
              className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800 w-full"
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
                  Generar Pólizas Anuales
                </>
              )}
            </Button>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              <Button variant="ghost" onClick={() => setShowPreFacturacion(false)} className="w-full sm:w-auto order-2 sm:order-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirmarGeneracion} className="w-full sm:flex-1 order-1 sm:order-2">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Confirmar y Generar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
