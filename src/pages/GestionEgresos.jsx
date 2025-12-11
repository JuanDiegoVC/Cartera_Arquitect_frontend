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
import { Loader2, DollarSign, Save, X, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  obtenerCategorias,
  crearEgreso,
  obtenerEgresosHoy,
} from "@/services/egresosService";
import { formatCurrency, getTodayLocalDate } from "@/utils/formatters";
import { useCurrencyInput } from "@/hooks/useCurrencyInput";
import { useAuth } from "@/hooks/useAuth";

export default function GestionEgresos() {
  const [categorias, setCategorias] = useState([]);
  const [egresos, setEgresos] = useState([]);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tipoDespachador, setTipoDespachador] = useState(""); // "blancos" o "amarillos"
  const navigate = useNavigate();
  const { isAdministrador, isGerente } = useAuth();

  // Hook para formato de moneda
  const currencyInput = useCurrencyInput("");

  // Estado del formulario
  const [formData, setFormData] = useState({
    categoria: "",
    fecha_egreso: getTodayLocalDate(),
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

  // Helper para verificar si la categoría es Despachadores
  const categoriaEsDespachadores = (nombreCategoria) => {
    if (!nombreCategoria) return false;
    return nombreCategoria.toLowerCase().includes("despachador");
  };

  const handleInputChange = (field, value) => {
    if (field === "valor") {
      // Usar el hook para formatear moneda
      const formatted = currencyInput.handleChange(value);
      setFormData((prev) => ({ ...prev, [field]: formatted }));
    } else if (field === "categoria") {
      // Limpiar tipo de despachador al cambiar categoría
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTipoDespachador("");
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.categoria) {
      setError("Debe seleccionar una categoría");
      return;
    }

    const catSeleccionada = categorias.find(
      (c) => c.categoria_id === parseInt(formData.categoria)
    );

    // Validar que categoría Despachadores tenga tipo seleccionado
    if (categoriaEsDespachadores(catSeleccionada?.nombre) && !tipoDespachador) {
      setError("Debe seleccionar el tipo de despachador (Blancos o Amarillos)");
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
      // Construir descripción con tipo de despachador si aplica
      let descripcionFinal = formData.descripcion;
      if (
        categoriaEsDespachadores(catSeleccionada?.nombre) &&
        tipoDespachador
      ) {
        const tipoLabel =
          tipoDespachador === "blancos" ? "Blancos" : "Amarillos";
        descripcionFinal = descripcionFinal
          ? `[${tipoLabel}] ${descripcionFinal}`
          : `Despachadores ${tipoLabel}`;
      }

      const egresoData = {
        categoria: parseInt(formData.categoria),
        fecha_egreso: formData.fecha_egreso,
        medio_pago: formData.medio_pago,
        valor: valorNumerico,
        descripcion:
          descripcionFinal || `Egreso categoría ${catSeleccionada?.nombre}`,
      };

      await crearEgreso(egresoData);

      setSuccess(true);

      // Limpiar formulario
      setFormData({
        categoria: "",
        fecha_egreso: getTodayLocalDate(),
        medio_pago: "efectivo",
        valor: "",
        descripcion: "",
      });
      setTipoDespachador("");
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Egresos
          </h1>
          <p className="text-muted-foreground">
            Registro y control de gastos operativos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Botón de Historial - Solo para Admin y Gerente */}
          {(isAdministrador() || isGerente()) && (
            <Button
              variant="outline"
              onClick={() => navigate("/egresos/historial")}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historial</span>
            </Button>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Total Hoy: {formatCurrency(totalEgresos)}
            </span>
          </div>
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

              {/* Tipo de Despachador - Solo para categoría Despachadores */}
              {formData.categoria &&
                categoriaEsDespachadores(
                  categorias.find(
                    (c) => c.categoria_id === parseInt(formData.categoria)
                  )?.nombre
                ) && (
                  <div className="space-y-2">
                    <Label htmlFor="tipo_despachador">
                      Tipo de Despachador *
                    </Label>
                    <Select
                      value={tipoDespachador}
                      onValueChange={(value) => setTipoDespachador(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blancos">Blancos</SelectItem>
                        <SelectItem value="amarillos">Amarillos</SelectItem>
                      </SelectContent>
                    </Select>
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
                  max={getTodayLocalDate()}
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
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${egreso.medio_pago === "efectivo"
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
