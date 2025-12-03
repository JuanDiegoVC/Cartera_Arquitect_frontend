import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Loader2,
  Search,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  DollarSign,
  Banknote,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  obtenerCategorias,
  obtenerHistorialEgresos,
} from "@/services/egresosService";
import { formatCurrency } from "@/utils/formatters";

export default function HistorialEgresos() {
  const navigate = useNavigate();
  const [egresos, setEgresos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Estados de totales
  const [totales, setTotales] = useState({
    total: 0,
    efectivo: 0,
    transferencia: 0,
  });

  // Estados de filtros
  const [filtros, setFiltros] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    categoria: "",
    medio_pago: "",
  });

  // Cargar categorías al montar
  useEffect(() => {
    cargarCategorias();
  }, []);

  // Cargar egresos cuando cambian filtros o página
  useEffect(() => {
    cargarEgresos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategorias();
      const categoriasList = data.results || (Array.isArray(data) ? data : []);
      setCategorias(categoriasList);
    } catch (err) {
      console.error("Error cargando categorías:", err);
      setCategorias([]);
    }
  };

  const cargarEgresos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        page_size: pageSize,
      };

      // Agregar filtros si existen
      if (filtros.fecha_inicio) params.fecha_inicio = filtros.fecha_inicio;
      if (filtros.fecha_fin) params.fecha_fin = filtros.fecha_fin;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.medio_pago) params.medio_pago = filtros.medio_pago;

      const data = await obtenerHistorialEgresos(params);

      setEgresos(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / pageSize));
      setTotales(data.totales || { total: 0, efectivo: 0, transferencia: 0 });
    } catch (err) {
      setError("Error al cargar el historial de egresos");
      console.error("Error cargando historial:", err);
      setEgresos([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filtros]);

  const handleFiltroChange = (field, value) => {
    setFiltros((prev) => ({ ...prev, [field]: value }));
  };

  const aplicarFiltros = () => {
    setCurrentPage(1);
    cargarEgresos();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_inicio: "",
      fecha_fin: "",
      categoria: "",
      medio_pago: "",
    });
    setCurrentPage(1);
    // Después de limpiar, cargar con filtros vacíos
    setTimeout(() => cargarEgresos(), 0);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/egresos")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Historial de Egresos
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Consulta y filtrado de todos los gastos registrados
          </p>
        </div>
      </div>

      {/* Tarjetas de Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total General</p>
                <p className="text-xl font-bold">
                  {formatCurrency(totales.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Efectivo</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(totales.efectivo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Transferencia</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(totales.transferencia)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Fecha Inicio */}
            <div className="space-y-2">
              <Label htmlFor="fecha_inicio" className="text-sm">
                Desde
              </Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={filtros.fecha_inicio}
                onChange={(e) =>
                  handleFiltroChange("fecha_inicio", e.target.value)
                }
              />
            </div>

            {/* Fecha Fin */}
            <div className="space-y-2">
              <Label htmlFor="fecha_fin" className="text-sm">
                Hasta
              </Label>
              <Input
                id="fecha_fin"
                type="date"
                value={filtros.fecha_fin}
                onChange={(e) =>
                  handleFiltroChange("fecha_fin", e.target.value)
                }
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm">
                Categoría
              </Label>
              <Select
                value={filtros.categoria}
                onValueChange={(value) =>
                  handleFiltroChange("categoria", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem
                      key={cat.categoria_id}
                      value={cat.categoria_id.toString()}
                    >
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Medio de Pago */}
            <div className="space-y-2">
              <Label htmlFor="medio_pago" className="text-sm">
                Método Pago
              </Label>
              <Select
                value={filtros.medio_pago}
                onValueChange={(value) =>
                  handleFiltroChange("medio_pago", value === "all" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botones */}
            <div className="flex items-end gap-2">
              <Button
                onClick={aplicarFiltros}
                className="flex-1"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button
                variant="outline"
                onClick={limpiarFiltros}
                disabled={loading}
              >
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de Resultados */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-lg">
              Egresos ({totalCount} registros)
            </CardTitle>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
                <SelectItem value="100">100 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : egresos.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No se encontraron egresos con los filtros aplicados
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {egresos.map((egreso) => (
                      <TableRow key={egreso.egreso_id}>
                        <TableCell className="whitespace-nowrap">
                          {formatearFecha(egreso.fecha_egreso)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {egreso.hora || "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {egreso.categoria_nombre}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {egreso.descripcion || "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              egreso.medio_pago === "efectivo"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {egreso.medio_pago_display || egreso.medio_pago}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {egreso.usuario_nombre}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(egreso.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * pageSize + 1} -{" "}
                    {Math.min(currentPage * pageSize, totalCount)} de{" "}
                    {totalCount} registros
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Anterior</span>
                    </Button>
                    <span className="text-sm px-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages || loading}
                    >
                      <span className="hidden sm:inline mr-1">Siguiente</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
