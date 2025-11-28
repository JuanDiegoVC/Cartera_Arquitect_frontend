import { useState, useEffect } from "react";
import { Download, Search, Filter, RefreshCw, Car } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import { vehiculosService } from "../services/vehiculosService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/**
 * Página de lista completa de vehículos con filtros y exportación
 * Implementa RF-004 y RF-008: Exportación a Excel con filtros
 */
export default function VehiculosLista() {
  const { isAdministrador } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Estado para el modal de creación/edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    placa: "",
    tipo_vehiculo: "taxi_blanco",
    propietario_nombre: "",
    conductor_actual_nombre: "",
    estado: "activo",
  });
  const [saving, setSaving] = useState(false);

  // Estado de filtros
  const [filters, setFilters] = useState({
    tipo_vehiculo: "",
    estado: "activo", // Por defecto, mostrar solo activos
    search: "",
  });

  // Cargar vehículos cuando cambian los filtros
  useEffect(() => {
    fetchVehiculos();
  }, [filters]);

  const fetchVehiculos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehiculosService.getAll(filters);
      setVehiculos(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
      setError("Error al cargar la lista de vehículos");
    } finally {
      setLoading(false);
    }
  };

  // Exportar a Excel
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await vehiculosService.exportToExcel(filters);

      // Crear blob y forzar descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `vehiculos_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar:", err);
      setError("Error al exportar a Excel");
    } finally {
      setExporting(false);
    }
  };

  // Actualizar filtros
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      tipo_vehiculo: "",
      estado: "activo",
      search: "",
    });
  };

  // Formato de fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Cambiar estado del vehículo (SOT-26)
  const handleToggleEstado = async (id, currentStatus) => {
    // Verificar permisos antes de intentar
    if (!isAdministrador()) {
      alert(
        "No tienes permisos para cambiar el estado de vehículos. Solo administradores y gerentes pueden realizar esta acción."
      );
      return;
    }

    const action = currentStatus === "activo" ? "desactivar" : "activar";
    const confirmMsg =
      currentStatus === "activo"
        ? "¿Está seguro de desactivar este vehículo? No se generarán nuevos cobros."
        : "¿Está seguro de activar este vehículo?";

    if (!window.confirm(confirmMsg)) return;

    try {
      if (action === "desactivar") {
        await vehiculosService.desactivar(id);
      } else {
        await vehiculosService.activar(id);
      }
      // Recargar lista manteniendo filtros
      fetchVehiculos();
    } catch (err) {
      console.error("Error al cambiar estado:", err);

      // Mensajes de error más específicos
      let errorMsg = "Error al cambiar el estado del vehículo";

      if (err.response?.status === 403) {
        errorMsg =
          "No tienes permisos para cambiar el estado de vehículos. Solo administradores y gerentes pueden realizar esta acción.";
      } else if (err.response?.status === 401) {
        errorMsg =
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.";
      } else if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }

      alert(errorMsg);
    }
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setEditingVehicle(null);
    setFormData({
      placa: "",
      tipo_vehiculo: "taxi_blanco",
      propietario_nombre: "",
      conductor_actual_nombre: "",
      estado: "activo",
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      placa: vehicle.placa,
      tipo_vehiculo: vehicle.tipo_vehiculo,
      propietario_nombre: vehicle.propietario_nombre || "",
      conductor_actual_nombre: vehicle.conductor_actual_nombre || "",
      estado: vehicle.estado,
    });
    setIsModalOpen(true);
  };

  // Guardar vehículo (Crear o Actualizar)
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingVehicle) {
        await vehiculosService.update(editingVehicle.vehiculo_id, formData);
      } else {
        await vehiculosService.create(formData);
      }
      setIsModalOpen(false);
      fetchVehiculos();
    } catch (err) {
      console.error("Error al guardar:", err);
      alert(
        err.mensaje ||
        err.detail ||
        "Error al guardar el vehículo. Verifique los datos."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Lista de Vehículos
          </h1>
          <p className="text-muted-foreground">
            Gestione y exporte el registro completo de vehículos afiliados
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Filtros y Exportación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Exportación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {/* Filtro por tipo */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tipo de Vehículo
              </label>
              <select
                value={filters.tipo_vehiculo}
                onChange={(e) =>
                  handleFilterChange("tipo_vehiculo", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Todos los tipos</option>
                <option value="taxi_blanco">Taxi Blanco</option>
                <option value="taxi_amarillo">Taxi Amarillo</option>
                <option value="escalera">Escalera</option>
                <option value="campero">Campero</option>
                <option value="bus">Bus</option>
                <option value="microbus">Microbus</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => handleFilterChange("estado", e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            {/* Búsqueda */}
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Placa, propietario..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
              <Button
                onClick={handleExportExcel}
                disabled={exporting || vehiculos.length === 0}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? "Exportando..." : "Excel"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensajes de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de vehículos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehículos ({vehiculos.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Cargando vehículos...
            </div>
          ) : vehiculos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No se encontraron vehículos con los filtros aplicados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Placa
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Propietario
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Conductor
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Registro
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculos.map((vehiculo) => (
                    <tr
                      key={vehiculo.vehiculo_id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold">
                        {vehiculo.placa}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {vehiculo.tipo_vehiculo_display ||
                            vehiculo.tipo_vehiculo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {vehiculo.propietario_nombre || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {vehiculo.conductor_actual_nombre || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehiculo.estado === "activo"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {vehiculo.estado_display || vehiculo.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(vehiculo.creado_en)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAdministrador() ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(vehiculo)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={
                                vehiculo.estado === "activo"
                                  ? "destructive"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() =>
                                handleToggleEstado(
                                  vehiculo.vehiculo_id,
                                  vehiculo.estado
                                )
                              }
                              className="h-8 text-xs"
                            >
                              {vehiculo.estado === "activo"
                                ? "Desactivar"
                                : "Activar"}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Sin permisos
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edición/creación */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? "Editar Vehículo" : "Nuevo Vehículo"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="p-6 space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) =>
                    setFormData({ ...formData, placa: e.target.value.toUpperCase() })
                  }
                  placeholder="ABC123"
                  disabled={!!editingVehicle} // No editar placa una vez creado
                  required
                  minLength={6}
                  maxLength={6}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de Vehículo</Label>
                <select
                  id="tipo"
                  value={formData.tipo_vehiculo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo_vehiculo: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="taxi_blanco">Taxi Blanco</option>
                  <option value="taxi_amarillo">Taxi Amarillo</option>
                  <option value="escalera">Escalera</option>
                  <option value="campero">Campero</option>
                  <option value="bus">Bus</option>
                  <option value="microbus">Microbus</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="propietario">Propietario</Label>
                <Input
                  id="propietario"
                  value={formData.propietario_nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, propietario_nombre: e.target.value })
                  }
                  placeholder="Nombre completo"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conductor">Conductor Actual</Label>
                <Input
                  id="conductor"
                  value={formData.conductor_actual_nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      conductor_actual_nombre: e.target.value,
                    })
                  }
                  placeholder="Nombre completo"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
