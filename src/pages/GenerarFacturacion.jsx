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
  Edit2,
  XCircle,
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
import apiClient from "../services/api";
import PlacaAutocomplete from "../components/common/PlacaAutocomplete";

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

  // ======= Estados para Corrección de Facturas =======
  const [correctionSearchPlaca, setCorrectionSearchPlaca] = useState("");
  const [deudasEncontradas, setDeudasEncontradas] = useState([]);
  const [searchingDeudas, setSearchingDeudas] = useState(false);
  const [correctionError, setCorrectionError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingDeuda, setSavingDeuda] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState(null);

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
  };

  // ======= Handlers para Corrección de Facturas =======
  const handleSearchDeudas = async () => {
    if (!correctionSearchPlaca.trim()) {
      setCorrectionError("Por favor ingrese una placa para buscar");
      return;
    }

    setSearchingDeudas(true);
    setCorrectionError(null);
    setDeudasEncontradas([]);
    setCorrectionSuccess(null);

    try {
      const response = await cobrosService.getDeudasByPlaca(correctionSearchPlaca.trim());
      const deudas = response.results || response || [];
      if (deudas.length === 0) {
        setCorrectionError("No se encontraron facturas para esta placa");
      }
      setDeudasEncontradas(deudas);
    } catch (err) {
      console.error("Error buscando deudas:", err);
      setCorrectionError(err.error || "Error al buscar facturas");
    } finally {
      setSearchingDeudas(false);
    }
  };

  const handleOpenEditModal = (deuda) => {
    setSelectedDeuda(deuda);
    setEditingValue(deuda.valor_cargado);
    setEditModalOpen(true);
  };

  const handleSaveDeuda = async () => {
    if (!selectedDeuda) return;

    setSavingDeuda(true);
    setCorrectionError(null);

    try {
      await cobrosService.updateDeuda(selectedDeuda.deuda_id, {
        valor_cargado: parseFloat(editingValue),
      });

      // Actualizar lista local
      setDeudasEncontradas((prev) =>
        prev.map((d) =>
          d.deuda_id === selectedDeuda.deuda_id
            ? { ...d, valor_cargado: editingValue, saldo_pendiente: editingValue }
            : d
        )
      );

      setCorrectionSuccess("Factura actualizada correctamente");
      setEditModalOpen(false);
      setSelectedDeuda(null);
    } catch (err) {
      console.error("Error actualizando deuda:", err);
      setCorrectionError(err.error || "Error al actualizar la factura");
    } finally {
      setSavingDeuda(false);
    }
  };

  const handleAnularDeuda = async () => {
    if (!selectedDeuda) return;

    if (!window.confirm("¿Está seguro de anular esta factura? Esta acción quedará registrada en auditoría.")) {
      return;
    }

    setSavingDeuda(true);
    setCorrectionError(null);

    try {
      await cobrosService.updateDeuda(selectedDeuda.deuda_id, {
        estado_deuda: "anulada",
      });

      // Remover de la lista local
      setDeudasEncontradas((prev) =>
        prev.filter((d) => d.deuda_id !== selectedDeuda.deuda_id)
      );

      setCorrectionSuccess("Factura anulada correctamente");
      setEditModalOpen(false);
      setSelectedDeuda(null);
    } catch (err) {
      console.error("Error anulando deuda:", err);
      setCorrectionError(err.error || "Error al anular la factura");
    } finally {
      setSavingDeuda(false);
    }
  };

  const formatCurrencyValue = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "$0" : `$${num.toLocaleString("es-CO")}`;
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
                  Nota: Los demás rubros variables (pólizas, comisiones, etc.)
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

      {/* ========== CORRECCIÓN DE FACTURAS ========== */}
      <Card className="shadow-md border-orange-200 dark:border-orange-800">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Edit2 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
            Corrección de Facturas
          </CardTitle>
          <CardDescription className="text-sm">
            Busque por placa para editar o anular facturas generadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barra de búsqueda con Autocomplete */}
          <div className="flex gap-2">
            <div className="flex-1">
              <PlacaAutocomplete
                value={correctionSearchPlaca}
                onChange={(val) => setCorrectionSearchPlaca(val)}
                onSelect={(vehiculo) => {
                  setCorrectionSearchPlaca(vehiculo.placa);
                  handleSearchDeudas();
                }}
                placeholder="Buscar por placa (ej: ABC123)"
              />
            </div>
            <Button
              onClick={handleSearchDeudas}
              disabled={searchingDeudas}
              variant="secondary"
            >
              {searchingDeudas ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Buscar"
              )}
            </Button>
          </div>

          {/* Mensajes de error/éxito */}
          {correctionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{correctionError}</AlertDescription>
            </Alert>
          )}
          {correctionSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>{correctionSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Tabla de resultados */}
          {deudasEncontradas.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Placa</th>
                    <th className="px-4 py-3 text-left">Rubro</th>
                    <th className="px-4 py-3 text-left">Periodo</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {deudasEncontradas.map((deuda) => (
                    <tr key={deuda.deuda_id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{deuda.placa}</td>
                      <td className="px-4 py-3">{deuda.rubro_nombre}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const [year, month] = deuda.periodo.split('-');
                          return new Date(parseInt(year), parseInt(month) - 1, 15).toLocaleDateString("es-CO", { year: "numeric", month: "short" });
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrencyValue(deuda.valor_cargado)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${deuda.estado_deuda === "pagado"
                          ? "bg-green-100 text-green-800"
                          : deuda.estado_deuda === "abonado"
                            ? "bg-yellow-100 text-yellow-800"
                            : deuda.estado_deuda === "anulada"
                              ? "bg-gray-100 text-gray-600 line-through"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {deuda.estado_deuda}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(deuda)}
                          disabled={deuda.estado_deuda === "pagado" || deuda.estado_deuda === "anulada"}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edición de Factura */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Editar Factura
            </DialogTitle>
            <DialogDescription>
              Modifique el valor o anule esta factura. Los cambios quedarán registrados en auditoría.
            </DialogDescription>
          </DialogHeader>

          {selectedDeuda && (
            <div className="space-y-4 py-4 px-2">
              {/* Info de la deuda */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Placa</Label>
                  <p className="font-medium">{selectedDeuda.placa}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Propietario</Label>
                  <p className="font-medium">{selectedDeuda.propietario || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rubro</Label>
                  <p className="font-medium">{selectedDeuda.rubro_nombre}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Periodo</Label>
                  <p className="font-medium">
                    {(() => {
                      const [year, month] = selectedDeuda.periodo.split('-');
                      return new Date(parseInt(year), parseInt(month) - 1, 15).toLocaleDateString("es-CO", { year: "numeric", month: "long" });
                    })()}
                  </p>
                </div>
              </div>

              {/* Campo editable del valor */}
              <div className="space-y-2">
                <Label htmlFor="edit-valor">Valor del Cargo</Label>
                <Input
                  id="edit-valor"
                  type="number"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  placeholder="Ej: 50000"
                />
              </div>

              {correctionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{correctionError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleAnularDeuda}
              disabled={savingDeuda}
              className="w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Anular Factura
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                disabled={savingDeuda}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveDeuda}
                disabled={savingDeuda || !editingValue}
                className="flex-1 sm:flex-none"
              >
                {savingDeuda ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                    className="h-9 px-4"
                  >
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
                          <tr
                            key={idx}
                            className="border-b last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-4 py-2 font-medium">{item.placa}</td>
                            <td className="px-4 py-2">{item.rubro_nombre}</td>
                            <td className="px-4 py-2">${Number(item.valor).toLocaleString("es-CO")}</td>
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => handleRemoveOcasional(idx)}
                                className="text-destructive hover:text-destructive/80 transition-colors"
                              >
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

            {/* Botón de Pólizas (opcional) */}
            <section className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Pólizas Anuales</h4>
                  <p className="text-xs text-muted-foreground">Genera pólizas anuales para todos los vehículos</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
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

          <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-muted/10 flex flex-col sm:flex-row gap-2 sticky bottom-0">
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
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirmar y Generar Facturación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
