import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, DollarSign, Save, X } from "lucide-react";
import {
  obtenerCategorias,
  crearEgreso,
  obtenerEgresosHoy,
} from "@/services/egresosService";
import { vehiculosService } from "@/services/vehiculosService";
import { formatCurrency } from "@/utils/formatters";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";

export default function GestionEgresos() {
  const [categorias, setCategorias] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [vehiculos, setVehiculos] = useState([]);
  const [busquedaVehiculo, setBusquedaVehiculo] = useState("");
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [buscandoVehiculos, setBuscandoVehiculos] = useState(false);

  // Hook para formato de moneda
  const currencyInput = useCurrencyInput("");

  // Estado del formulario
  const [formData, setFormData] = useState({
    categoria: "",
    vehiculo: null,
    fecha_egreso: new Date().toISOString().split("T")[0],
    medio_pago: "efectivo",
    valor: "",
    descripcion: "",
  });

  // Cargar categorías al montar
  useEffect(() => {
    cargarCategorias();
    cargarEgresosHoy();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      // Manejar respuesta paginada de Django REST
      const categoriasList = data.results || (Array.isArray(data) ? data : []);
      setCategorias(categoriasList);
    } catch (err) {
      setError("Error al cargar las categorías");
      console.error("Error cargando categorías:", err);
      setCategorias([]);
    }
  };

  const cargarEgresosHoy = async () => {
    setLoading(true);
    try {
      const data = await obtenerEgresosHoy();
      setEgresos(data.egresos || []);
      setTotalEgresos(data.total || 0);
    } catch (err) {
      setError("Error al cargar los egresos");
      console.error("Error cargando egresos:", err);
      setEgresos([]);
      setTotalEgresos(0);
    } finally {
      setLoading(false);
    }
  };

  // Categorías que requieren selección de vehículo
  const categoriasConVehiculo = ["Parqueadero", "Seguros", "Seguro", "Poliza", "Póliza"];

  // Helper para verificar si una categoría requiere vehículo
  const categoriaRequiereVehiculo = (nombreCategoria) => {
    if (!nombreCategoria) return false;
    return categoriasConVehiculo.some(
      (cat) => nombreCategoria.toLowerCase().includes(cat.toLowerCase())
    );
  };

  const handleInputChange = (field, value) => {
    if (field === "valor") {
      // Usar el hook para formatear moneda
      const formatted = currencyInput.handleChange(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else if (field === "categoria") {
      // Limpiar vehículo al cambiar categoría
      setFormData((prev) => ({ ...prev, [field]: value, vehiculo: null }));
      setVehiculoSeleccionado(null);
      setBusquedaVehiculo("");
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setError(null);
    setSuccess(false);
  };

  const buscarVehiculos = async (query) => {
    if (!query || query.length < 2) {
      setVehiculos([]);
      return;
    }

    setBuscandoVehiculos(true);
    try {
      const resultado = await vehiculosService.getAll({ search: query });
      const listaVehiculos =
        resultado.results || (Array.isArray(resultado) ? resultado : []);
      setVehiculos(listaVehiculos.slice(0, 5)); // Limitar a 5 resultados
    } catch (err) {
      console.error("Error al buscar vehículos:", err);
      setVehiculos([]);
    } finally {
      setBuscandoVehiculos(false);
    }
  };

  const seleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
    setFormData((prev) => ({ ...prev, vehiculo: vehiculo.vehiculo_id }));
    setBusquedaVehiculo("");
    setVehiculos([]);
  };

  const limpiarVehiculo = () => {
    setVehiculoSeleccionado(null);
    setFormData((prev) => ({ ...prev, vehiculo: null }));
    setBusquedaVehiculo("");
    setVehiculos([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.categoria) {
      setError("Debe seleccionar una categoría");
      return;
    }

    // Validar que categorías que requieren vehículo lo tengan seleccionado
    const catSeleccionada = categorias.find(
      (c) => c.categoria_id === parseInt(formData.categoria)
    );
    if (categoriaRequiereVehiculo(catSeleccionada?.nombre) && !formData.vehiculo) {
      setError(`Debe seleccionar un vehículo para ${catSeleccionada?.nombre}`);
      return;
    }

    // Convertir el valor formateado (1.000,50) a número (1000.50)
    const valorNumerico = parseFloat(
      formData.valor.replace(/\./g, "").replace(",", ".")
    );

    if (!formData.valor || valorNumerico <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const egresoData = {
        categoria: parseInt(formData.categoria),
        fecha_egreso: formData.fecha_egreso,
        medio_pago: formData.medio_pago,
        valor: valorNumerico,
        descripcion:
          formData.descripcion || `Egreso categoría ${catSeleccionada?.nombre}`,
      };

      // Agregar vehículo si está disponible
      if (formData.vehiculo) {
        egresoData.vehiculo = formData.vehiculo;
      }

      await crearEgreso(egresoData);

      setSuccess(true);

      // Limpiar formulario
      setFormData({
        categoria: "",
        vehiculo: null,
        fecha_egreso: new Date().toISOString().split("T")[0],
        medio_pago: "efectivo",
        valor: "",
        descripcion: "",
      });
      setVehiculoSeleccionado(null);
      currencyInput.setValue("");

      // Recargar lista
      await cargarEgresosHoy();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Error al guardar el egreso");
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Egresos
          </h1>
          <p className="text-muted-foreground">
            Registro y control de gastos operativos
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">
            Total Hoy: {formatCurrency(totalEgresos)}
          </span>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-50">
          <AlertDescription className="text-green-700">
            ✅ Egreso registrado exitosamente
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle>Registrar Egreso</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) =>
                    handleInputChange("categoria", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(categorias) && categorias.length > 0 ? (
                      categorias.map((cat) => (
                        <SelectItem
                          key={`cat-${cat.categoria_id}`}
                          value={cat.categoria_id.toString()}
                        >
                          {cat.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Sin categorías disponibles
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehículo - Para categorías que lo requieren (Parqueadero, Seguros, Poliza) */}
              {formData.categoria &&
                categoriaRequiereVehiculo(
                  categorias.find(
                    (c) => c.categoria_id === parseInt(formData.categoria)
                  )?.nombre
                ) && (
                  <div className="space-y-2">
                    <Label htmlFor="vehiculo">Vehículo *</Label>
                    {vehiculoSeleccionado ? (
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-200">
                        <div>
                          <p className="font-semibold text-sm">
                            {vehiculoSeleccionado.placa}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {vehiculoSeleccionado.tipo_vehiculo} -{" "}
                            {vehiculoSeleccionado.conductor?.nombre_completo ||
                              "Sin conductor"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={limpiarVehiculo}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          id="buscar-vehiculo"
                          placeholder="Buscar por placa (ej: HUB204)"
                          value={busquedaVehiculo}
                          onChange={(e) => {
                            setBusquedaVehiculo(e.target.value);
                            buscarVehiculos(e.target.value);
                          }}
                        />
                        {buscandoVehiculos && (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          </div>
                        )}
                        {vehiculos.length > 0 && (
                          <div className="border rounded-md max-h-40 overflow-y-auto">
                            {vehiculos.map((veh) => (
                              <button
                                key={veh.vehiculo_id}
                                type="button"
                                onClick={() => seleccionarVehiculo(veh)}
                                className="w-full text-left p-2 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                              >
                                <p className="font-semibold text-sm">
                                  {veh.placa}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {veh.tipo_vehiculo} -{" "}
                                  {veh.conductor?.nombre_completo ||
                                    "Sin conductor"}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* Fecha */}
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha_egreso}
                  onChange={(e) =>
                    handleInputChange("fecha_egreso", e.target.value)
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Medio de Pago */}
              <div className="space-y-2">
                <Label htmlFor="medio_pago">Método de Pago *</Label>
                <Select
                  value={formData.medio_pago}
                  onValueChange={(value) =>
                    handleInputChange("medio_pago", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="valor">Monto *</Label>
                <Input
                  id="valor"
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={currencyInput.value}
                  onChange={(e) => handleInputChange("valor", e.target.value)}
                  className="text-right font-mono"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (opcional)</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalles del egreso..."
                  value={formData.descripcion}
                  onChange={(e) =>
                    handleInputChange("descripcion", e.target.value)
                  }
                  rows={3}
                />
              </div>

              {/* Botón */}
              <Button type="submit" className="w-full" disabled={guardando}>
                {guardando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Egreso
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabla de egresos del día */}
        <Card>
          <CardHeader>
            <CardTitle>Egresos de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : egresos.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No hay egresos registrados hoy
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-[400px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Vehículo/Conductor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {egresos.map((egreso) => (
                        <TableRow key={egreso.egreso_id}>
                          <TableCell className="font-medium">
                            {egreso.categoria_nombre}
                          </TableCell>
                          <TableCell className="text-sm">
                            {egreso.vehiculo_placa ? (
                              <div>
                                <p className="font-semibold">
                                  {egreso.vehiculo_placa}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {egreso.conductor_nombre || "Sin conductor"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                egreso.medio_pago === "efectivo"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                            >
                              {egreso.medio_pago_display ||
                                egreso.medio_pago ||
                                "Efectivo"}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {egreso.hora}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(egreso.valor)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="font-semibold">Total del día:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(totalEgresos)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
