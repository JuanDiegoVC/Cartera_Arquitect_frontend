import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Eye,
  Loader2,
  ArrowLeft,
  Wallet,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { auditoriaService } from "@/services/auditoriaService";
import { toast } from "sonner";

/**
 * Componente para ver los cierres de turno de trabajadores
 * Solo disponible para admin y gerente
 */
const VerCierresTrabajadores = ({ open, onOpenChange }) => {
  // Estados
  const [cargando, setCargando] = useState(false);
  const [cierres, setCierres] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [totalCierres, setTotalCierres] = useState(0);
  
  // Filtros
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState("");
  
  // Estado para ver detalle de un cierre
  const [cierreDetalle, setCierreDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [vistaDetalle, setVistaDetalle] = useState(false);

  // Cargar cierres cuando cambie la fecha o trabajador
  useEffect(() => {
    if (open) {
      cargarCierres();
    }
  }, [open, fechaSeleccionada, trabajadorSeleccionado]);

  const cargarCierres = async () => {
    setCargando(true);
    try {
      const filtros = { fecha: fechaSeleccionada };
      if (trabajadorSeleccionado && trabajadorSeleccionado !== "todos") {
        filtros.usuario_id = trabajadorSeleccionado;
      }
      
      const data = await auditoriaService.obtenerCierresTrabajadores(filtros);
      setCierres(data.cierres || []);
      setTrabajadores(data.trabajadores || []);
      setTotalCierres(data.total_cierres || 0);
    } catch (error) {
      console.error("Error al cargar cierres:", error);
      toast.error("Error al cargar los cierres de turno");
    } finally {
      setCargando(false);
    }
  };

  const verDetalleCierre = async (cierreId) => {
    setCargandoDetalle(true);
    setVistaDetalle(true);
    try {
      const detalle = await auditoriaService.obtenerDetalleCierreTrabajador(cierreId);
      setCierreDetalle(detalle);
    } catch (error) {
      console.error("Error al cargar detalle:", error);
      toast.error("Error al cargar el detalle del cierre");
      setVistaDetalle(false);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const volverALista = () => {
    setVistaDetalle(false);
    setCierreDetalle(null);
  };

  // Navegar fechas
  const cambiarFecha = (dias) => {
    const fecha = new Date(fechaSeleccionada);
    fecha.setDate(fecha.getDate() + dias);
    setFechaSeleccionada(fecha.toISOString().split("T")[0]);
  };

  const irAHoy = () => {
    setFechaSeleccionada(new Date().toISOString().split("T")[0]);
  };

  // Formatear moneda
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor || 0);
  };

  // Formatear fecha legible
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr + "T00:00:00");
    return fecha.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Verificar si es hoy
  const esHoy = fechaSeleccionada === new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-6 w-6 text-primary" />
            Cierres de Turno de Trabajadores
          </DialogTitle>
          <DialogDescription>
            Consulte los cierres de turno guardados por sus trabajadores
          </DialogDescription>
        </DialogHeader>

        {vistaDetalle ? (
          // Vista de Detalle de un Cierre
          <div className="flex-1 overflow-y-auto">
            <Button
              variant="ghost"
              onClick={volverALista}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </Button>

            {cargandoDetalle ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cierreDetalle ? (
              <DetalleCierreTrabajador 
                cierre={cierreDetalle} 
                formatearMoneda={formatearMoneda}
              />
            ) : null}
          </div>
        ) : (
          // Vista de Lista de Cierres
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Controles de Fecha */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => cambiarFecha(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => cambiarFecha(1)}
                  disabled={esHoy}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {!esHoy && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={irAHoy}
                  >
                    Hoy
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <User className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={trabajadorSeleccionado}
                  onValueChange={setTrabajadorSeleccionado}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Todos los trabajadores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los trabajadores</SelectItem>
                    {trabajadores.map((t) => (
                      <SelectItem key={t.usuario_id} value={String(t.usuario_id)}>
                        {t.nombre_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Resumen del día */}
            <div className="text-center py-2">
              <p className="text-lg font-medium capitalize">
                {formatearFecha(fechaSeleccionada)}
              </p>
              <p className="text-sm text-muted-foreground">
                {totalCierres === 0
                  ? "No hay cierres registrados"
                  : totalCierres === 1
                  ? "1 cierre registrado"
                  : `${totalCierres} cierres registrados`}
              </p>
            </div>

            {/* Tabla de Cierres */}
            {cargando ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cierres.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No hay cierres para esta fecha</p>
                <p className="text-sm mt-2">
                  Los cierres aparecerán aquí cuando los trabajadores guarden su cierre de turno
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Trabajador</TableHead>
                      <TableHead className="text-center">Hora Cierre</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Egresos</TableHead>
                      <TableHead className="text-right">Balance Caja</TableHead>
                      <TableHead className="text-center w-[80px]">Ver</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cierres.map((cierre) => (
                      <TableRow key={cierre.cierre_id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{cierre.usuario_nombre}</p>
                              <Badge variant="outline" className="text-xs">
                                {cierre.usuario_rol}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{cierre.hora_registro}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <p className="font-semibold text-green-600">
                              {formatearMoneda(cierre.total_ingresos)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cierre.cantidad_ingresos} mov.
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <p className="font-semibold text-red-600">
                              {formatearMoneda(cierre.total_egresos)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cierre.cantidad_egresos} mov.
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className={`font-bold ${
                            cierre.balance_caja_fisica >= 0 
                              ? "text-blue-600" 
                              : "text-orange-600"
                          }`}>
                            {formatearMoneda(cierre.balance_caja_fisica)}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => verDetalleCierre(cierre.cierre_id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Componente para mostrar el detalle completo de un cierre
 */
const DetalleCierreTrabajador = ({ cierre, formatearMoneda }) => {
  return (
    <div className="space-y-6">
      {/* Información del trabajador */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Cierre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Trabajador</p>
              <p className="font-semibold">{cierre.usuario?.nombre_completo}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {cierre.usuario?.rol}
              </Badge>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm">{cierre.usuario?.email}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Fecha del Cierre</p>
              <p className="font-medium">{cierre.fecha_cierre}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Hora de Registro</p>
              <p className="font-medium">{cierre.hora_registro}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen financiero */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium">Efectivo</span>
            </div>
            <p className="text-lg font-bold text-green-700 dark:text-green-400">
              {formatearMoneda(cierre.resumen?.total_ingresos_efectivo)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-1">
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-medium">Digitales</span>
            </div>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
              {formatearMoneda(cierre.resumen?.total_ingresos_digitales)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Total Ingresos</span>
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {formatearMoneda(cierre.resumen?.total_ingresos)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Egresos</span>
            </div>
            <p className="text-lg font-bold text-red-700 dark:text-red-400">
              {formatearMoneda(cierre.resumen?.total_egresos)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Balance Caja</span>
            </div>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-400">
              {formatearMoneda(cierre.resumen?.balance_caja_fisica)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Observaciones */}
      {cierre.observaciones && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{cierre.observaciones}</p>
          </CardContent>
        </Card>
      )}

      {/* Detalle de movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ingresos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              Ingresos ({cierre.movimientos?.ingresos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              {cierre.movimientos?.ingresos?.length > 0 ? (
                <div className="space-y-2">
                  {cierre.movimientos.ingresos.map((ingreso, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-medium">{ingreso.placa || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {ingreso.hora} - {ingreso.medio_pago}
                        </p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatearMoneda(ingreso.monto)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay ingresos registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Egresos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
              <TrendingDown className="h-4 w-4" />
              Egresos ({cierre.movimientos?.egresos?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              {cierre.movimientos?.egresos?.length > 0 ? (
                <div className="space-y-2">
                  {cierre.movimientos.egresos.map((egreso, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-medium">{egreso.categoria || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {egreso.hora} - {egreso.descripcion || "Sin descripción"}
                        </p>
                      </div>
                      <p className="font-semibold text-red-600">
                        {formatearMoneda(egreso.monto)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay egresos registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerCierresTrabajadores;
