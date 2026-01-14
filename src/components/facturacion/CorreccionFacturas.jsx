import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Edit2,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
} from "lucide-react";
import { cobrosService } from "../../services/cobrosService";
import apiClient from "../../services/api";
import { VEHICLE_TYPES } from "../../utils/formatters";

/**
 * Componente para corrección de facturas (individual y masiva)
 * Permite filtrar por tipo de vehículo, rubro y periodo (mes)
 * Soporta edición individual y actualización masiva de valores
 */
export default function CorreccionFacturas() {
  // ======= Estados para Filtros =======
  const [filtros, setFiltros] = useState({
    placa: "",
    tipo_vehiculo: "",
    rubro_id: "",
    periodo: "",
  });
  const [rubrosDisponibles, setRubrosDisponibles] = useState([]);
  
  // ======= Estados para Autocompletado de Placa =======
  const [vehiculos, setVehiculos] = useState([]);
  const [placaSearch, setPlacaSearch] = useState("");
  const [showPlacaDropdown, setShowPlacaDropdown] = useState(false);

  // ======= Estados para Resultados =======
  const [deudasEncontradas, setDeudasEncontradas] = useState([]);
  const [searchingDeudas, setSearchingDeudas] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ======= Estados para Selección Masiva =======
  const [selectedDeudas, setSelectedDeudas] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // ======= Estados para Edición Masiva =======
  const [showMasiveModal, setShowMasiveModal] = useState(false);
  const [masiveNewValue, setMasiveNewValue] = useState("");
  const [processingMasive, setProcessingMasive] = useState(false);

  // ======= Estados para Edición Individual =======
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDeuda, setSelectedDeuda] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingPeriodo, setEditingPeriodo] = useState("");
  const [savingDeuda, setSavingDeuda] = useState(false);

  // ======= Estados para Mensajes =======
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar rubros y vehículos al montar el componente
  useEffect(() => {
    const fetchRubros = async () => {
      try {
        const rubros = await cobrosService.getAllRubros();
        const list = Array.isArray(rubros) ? rubros : rubros.results || [];
        setRubrosDisponibles(list);
      } catch (err) {
        console.error("Error cargando rubros:", err);
      }
    };
    
    const fetchVehiculos = async () => {
      try {
        const response = await apiClient.get("/v1/flota/vehiculos/?limit=1000");
        const data = response.data.results || response.data;
        setVehiculos(data);
      } catch (err) {
        console.error("Error cargando vehículos:", err);
      }
    };
    
    fetchRubros();
    fetchVehiculos();
  }, []);

  // Obtener mes actual en formato YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };

  // Calcular deudas editables (no pagadas ni anuladas)
  const deudasEditables = useMemo(() => {
    return deudasEncontradas.filter(
      (d) => d.estado_deuda !== "pagado" && d.estado_deuda !== "anulada"
    );
  }, [deudasEncontradas]);

  // Handler para cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  // Handler para cambio en búsqueda de placa (autocompletado)
  const handlePlacaSearchChange = (value) => {
    const upperValue = value.toUpperCase();
    setPlacaSearch(upperValue);
    setShowPlacaDropdown(upperValue.length > 0);
    // También actualizar el filtro real
    handleFiltroChange("placa", upperValue);
  };

  // Handler para seleccionar placa del dropdown
  const handleSelectPlaca = (placa) => {
    setPlacaSearch(placa);
    handleFiltroChange("placa", placa);
    setShowPlacaDropdown(false);
  };

  // Filtrar vehículos según búsqueda
  const vehiculosFiltrados = useMemo(() => {
    if (!placaSearch) return [];
    return vehiculos.filter((v) =>
      v.placa.includes(placaSearch)
    ).slice(0, 10); // Limitar a 10 resultados
  }, [vehiculos, placaSearch]);

  // Handler para limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      placa: "",
      tipo_vehiculo: "",
      rubro_id: "",
      periodo: "",
    });
    setPlacaSearch("");
    setShowPlacaDropdown(false);
    setDeudasEncontradas([]);
    setSelectedDeudas(new Set());
    setSelectAll(false);
    setHasSearched(false);
    setError(null);
    setSuccess(null);
  };

  // Handler para buscar deudas con filtros
  const handleBuscarDeudas = async () => {
    // Validar que al menos un filtro esté activo
    const tieneFiltrros = Object.values(filtros).some((v) => v.trim() !== "");
    if (!tieneFiltrros) {
      setError("Por favor seleccione al menos un filtro para buscar");
      return;
    }

    setSearchingDeudas(true);
    setError(null);
    setSuccess(null);
    setSelectedDeudas(new Set());
    setSelectAll(false);

    try {
      const response = await cobrosService.getDeudasConFiltros(filtros);
      const deudas = response.results || response || [];
      setDeudasEncontradas(deudas);
      setHasSearched(true);

      if (deudas.length === 0) {
        setError("No se encontraron facturas con los filtros seleccionados");
      }
    } catch (err) {
      console.error("Error buscando deudas:", err);
      setError(err.error || "Error al buscar facturas");
    } finally {
      setSearchingDeudas(false);
    }
  };

  // Handler para seleccionar/deseleccionar todas las deudas editables
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      const editableIds = new Set(deudasEditables.map((d) => d.deuda_id));
      setSelectedDeudas(editableIds);
    } else {
      setSelectedDeudas(new Set());
    }
  };

  // Handler para seleccionar/deseleccionar una deuda individual
  const handleSelectDeuda = (deudaId, checked) => {
    const newSelected = new Set(selectedDeudas);
    if (checked) {
      newSelected.add(deudaId);
    } else {
      newSelected.delete(deudaId);
    }
    setSelectedDeudas(newSelected);
    setSelectAll(newSelected.size === deudasEditables.length && deudasEditables.length > 0);
  };

  // Handler para abrir modal de edición individual
  const handleOpenEditModal = (deuda) => {
    setSelectedDeuda(deuda);
    setEditingValue(deuda.valor_cargado);
    setEditingPeriodo(deuda.periodo);
    setEditModalOpen(true);
    setError(null);
  };

  // Handler para guardar edición individual
  const handleSaveDeuda = async () => {
    if (!selectedDeuda) return;

    setSavingDeuda(true);
    setError(null);

    try {
      const updatePayload = {
        valor_cargado: parseFloat(editingValue),
      };

      if (editingPeriodo && editingPeriodo !== selectedDeuda.periodo) {
        updatePayload.periodo = editingPeriodo;
      }

      await cobrosService.updateDeuda(selectedDeuda.deuda_id, updatePayload);

      // Actualizar lista local
      setDeudasEncontradas((prev) =>
        prev.map((d) =>
          d.deuda_id === selectedDeuda.deuda_id
            ? {
                ...d,
                valor_cargado: editingValue,
                saldo_pendiente: editingValue,
                periodo: editingPeriodo,
              }
            : d
        )
      );

      setSuccess("Factura actualizada correctamente");
      setEditModalOpen(false);
      setSelectedDeuda(null);
    } catch (err) {
      console.error("Error actualizando deuda:", err);
      setError(err.error || "Error al actualizar la factura");
    } finally {
      setSavingDeuda(false);
    }
  };

  // Handler para anular deuda individual
  const handleAnularDeuda = async () => {
    if (!selectedDeuda) return;

    if (
      !window.confirm(
        "¿Está seguro de anular esta factura? Esta acción quedará registrada en auditoría."
      )
    ) {
      return;
    }

    setSavingDeuda(true);
    setError(null);

    try {
      await cobrosService.updateDeuda(selectedDeuda.deuda_id, {
        estado_deuda: "anulada",
      });

      // Actualizar en la lista local
      setDeudasEncontradas((prev) =>
        prev.map((d) =>
          d.deuda_id === selectedDeuda.deuda_id
            ? { ...d, estado_deuda: "anulada" }
            : d
        )
      );

      // Remover de selección si estaba seleccionada
      setSelectedDeudas((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedDeuda.deuda_id);
        return newSet;
      });

      setSuccess("Factura anulada correctamente");
      setEditModalOpen(false);
      setSelectedDeuda(null);
    } catch (err) {
      console.error("Error anulando deuda:", err);
      setError(err.error || "Error al anular la factura");
    } finally {
      setSavingDeuda(false);
    }
  };

  // Handler para abrir modal de edición masiva
  const handleOpenMasiveModal = () => {
    if (selectedDeudas.size === 0) {
      setError("Seleccione al menos una factura para la corrección masiva");
      return;
    }
    setMasiveNewValue("");
    setShowMasiveModal(true);
    setError(null);
  };

  // Handler para confirmar edición masiva
  const handleConfirmMasive = async () => {
    if (!masiveNewValue || parseFloat(masiveNewValue) < 0) {
      setError("Ingrese un valor válido");
      return;
    }

    setProcessingMasive(true);
    setError(null);

    try {
      const resultado = await cobrosService.actualizacionMasivaDeudas(
        Array.from(selectedDeudas),
        parseFloat(masiveNewValue)
      );

      // Actualizar lista local
      setDeudasEncontradas((prev) =>
        prev.map((d) =>
          selectedDeudas.has(d.deuda_id)
            ? { ...d, valor_cargado: masiveNewValue, saldo_pendiente: masiveNewValue }
            : d
        )
      );

      setSuccess(
        `${resultado.total_actualizadas} facturas actualizadas correctamente`
      );
      setShowMasiveModal(false);
      setSelectedDeudas(new Set());
      setSelectAll(false);
    } catch (err) {
      console.error("Error en actualización masiva:", err);
      setError(err.error || "Error al procesar la actualización masiva");
    } finally {
      setProcessingMasive(false);
    }
  };

  // Formatear valor como moneda
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "$0" : `$${num.toLocaleString("es-CO")}`;
  };

  // Formatear periodo para mostrar
  const formatPeriodo = (periodo) => {
    if (!periodo) return "";
    const [year, month] = periodo.split("-");
    return new Date(parseInt(year), parseInt(month) - 1, 15).toLocaleDateString(
      "es-CO",
      { year: "numeric", month: "short" }
    );
  };

  return (
    <Card className="shadow-md border-orange-200 dark:border-orange-800">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Edit2 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
          Corrección de Facturas
        </CardTitle>
        <CardDescription className="text-sm">
          Use los filtros para buscar facturas y corregir de forma individual o masiva
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ========== FILTROS ========== */}
        <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtros de Búsqueda
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por Placa con Autocompletado */}
            <div className="space-y-1.5 relative">
              <Label className="text-xs font-medium">Placa</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar placa..."
                  className="pl-8 h-9"
                  value={placaSearch}
                  onChange={(e) => handlePlacaSearchChange(e.target.value)}
                  onFocus={() => placaSearch && setShowPlacaDropdown(true)}
                  onBlur={() => setTimeout(() => setShowPlacaDropdown(false), 200)}
                />
              </div>
              {/* Dropdown de sugerencias de placas */}
              {showPlacaDropdown && vehiculosFiltrados.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-48 overflow-y-auto">
                  {vehiculosFiltrados.map((v) => (
                    <div
                      key={v.placa}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground font-medium"
                      onMouseDown={() => handleSelectPlaca(v.placa)}
                    >
                      {v.placa}
                    </div>
                  ))}
                </div>
              )}
              {showPlacaDropdown && placaSearch && vehiculosFiltrados.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No se encontraron vehículos
                  </div>
                </div>
              )}
            </div>

            {/* Filtro por Tipo de Vehículo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Tipo de Vehículo</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filtros.tipo_vehiculo}
                onChange={(e) =>
                  handleFiltroChange("tipo_vehiculo", e.target.value)
                }
              >
                <option value="">Todos los tipos</option>
                {VEHICLE_TYPES.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Rubro */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Rubro</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filtros.rubro_id}
                onChange={(e) => handleFiltroChange("rubro_id", e.target.value)}
              >
                <option value="">Todos los rubros</option>
                {rubrosDisponibles.map((rubro) => (
                  <option key={rubro.rubro_id} value={rubro.rubro_id}>
                    {rubro.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Periodo (Mes) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Periodo (Mes)</Label>
              <input
                type="month"
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filtros.periodo}
                onChange={(e) => handleFiltroChange("periodo", e.target.value)}
                max={getCurrentMonth()}
              />
            </div>
          </div>

          {/* Botones de acción para filtros */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={handleBuscarDeudas}
              disabled={searchingDeudas}
              className="gap-2"
            >
              {searchingDeudas ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar Facturas
            </Button>
            <Button
              variant="outline"
              onClick={handleLimpiarFiltros}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* ========== MENSAJES ========== */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* ========== ACCIONES MASIVAS ========== */}
        {deudasEncontradas.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 p-3 bg-muted/20 rounded-lg border">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                disabled={deudasEditables.length === 0}
              />
              <Label htmlFor="select-all" className="text-sm cursor-pointer">
                Seleccionar todas las editables ({deudasEditables.length})
              </Label>
            </div>

            <div className="flex-1" />

            {selectedDeudas.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedDeudas.size} seleccionada(s)
                </span>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenMasiveModal}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Corrección Masiva
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========== TABLA DE RESULTADOS ========== */}
        {deudasEncontradas.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-xs uppercase">
                  <tr>
                    <th className="px-2 py-3 text-center w-10">
                      <span className="sr-only">Seleccionar</span>
                    </th>
                    <th className="px-4 py-3 text-left">Placa</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Tipo</th>
                    <th className="px-4 py-3 text-left">Rubro</th>
                    <th className="px-4 py-3 text-left">Periodo</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {deudasEncontradas.map((deuda) => {
                    const isEditable =
                      deuda.estado_deuda !== "pagado" &&
                      deuda.estado_deuda !== "anulada";
                    const isSelected = selectedDeudas.has(deuda.deuda_id);

                    return (
                      <tr
                        key={deuda.deuda_id}
                        className={`border-b last:border-0 hover:bg-muted/50 ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        <td className="px-2 py-3 text-center">
                          {isEditable && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleSelectDeuda(deuda.deuda_id, checked)
                              }
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">{deuda.placa}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                          {deuda.tipo_vehiculo_display || deuda.tipo_vehiculo}
                        </td>
                        <td className="px-4 py-3">{deuda.rubro_nombre}</td>
                        <td className="px-4 py-3">
                          {formatPeriodo(deuda.periodo)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(deuda.valor_cargado)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              deuda.estado_deuda === "pagado"
                                ? "bg-green-100 text-green-800"
                                : deuda.estado_deuda === "abonado"
                                ? "bg-yellow-100 text-yellow-800"
                                : deuda.estado_deuda === "anulada"
                                ? "bg-gray-100 text-gray-600 line-through"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {deuda.estado_deuda}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(deuda)}
                            disabled={!isEditable}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {hasSearched && deudasEncontradas.length === 0 && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No se encontraron facturas con los filtros seleccionados</p>
          </div>
        )}
      </CardContent>

      {/* ========== MODAL EDICIÓN INDIVIDUAL ========== */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Editar Factura
            </DialogTitle>
            <DialogDescription>
              Modifique el valor o anule esta factura. Los cambios quedarán
              registrados en auditoría.
            </DialogDescription>
          </DialogHeader>

          {selectedDeuda && (
            <div className="space-y-4 py-4 px-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Placa</Label>
                  <p className="font-medium">{selectedDeuda.placa}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Propietario</Label>
                  <p className="font-medium">
                    {selectedDeuda.propietario || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo Vehículo</Label>
                  <p className="font-medium">
                    {selectedDeuda.tipo_vehiculo_display || selectedDeuda.tipo_vehiculo}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rubro</Label>
                  <p className="font-medium">{selectedDeuda.rubro_nombre}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-periodo">Periodo (Fecha)</Label>
                <Input
                  id="edit-periodo"
                  type="date"
                  value={editingPeriodo}
                  onChange={(e) => setEditingPeriodo(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: YYYY-MM-DD (el día se usa para el periodo del mes)
                </p>
              </div>

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

      {/* ========== MODAL CORRECCIÓN MASIVA ========== */}
      <Dialog open={showMasiveModal} onOpenChange={setShowMasiveModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Corrección Masiva
            </DialogTitle>
            <DialogDescription>
              Se actualizarán {selectedDeudas.size} facturas con el nuevo valor.
              Esta acción quedará registrada en auditoría.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Resumen de selección */}
            <div className="bg-muted/30 p-3 rounded-md text-sm">
              <p className="font-medium mb-2">Facturas seleccionadas:</p>
              <ul className="space-y-1 text-muted-foreground max-h-32 overflow-y-auto">
                {deudasEncontradas
                  .filter((d) => selectedDeudas.has(d.deuda_id))
                  .slice(0, 5)
                  .map((d) => (
                    <li key={d.deuda_id}>
                      {d.placa} - {d.rubro_nombre} ({formatPeriodo(d.periodo)})
                    </li>
                  ))}
                {selectedDeudas.size > 5 && (
                  <li className="italic">
                    ... y {selectedDeudas.size - 5} más
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="masive-valor">Nuevo Valor para Todas</Label>
              <Input
                id="masive-valor"
                type="number"
                value={masiveNewValue}
                onChange={(e) => setMasiveNewValue(e.target.value)}
                placeholder="Ej: 50000"
                min="0"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowMasiveModal(false)}
              disabled={processingMasive}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmMasive}
              disabled={processingMasive || !masiveNewValue}
            >
              {processingMasive ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Confirmar Actualización
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
