import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Car,
  User,
  Calendar,
  DollarSign,
  ArrowLeft,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Separator } from "../components/ui/separator";
import { vehiculosService } from "../services/vehiculosService";

export default function VehiculoDetalle() {
  const { placa } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadVehicleData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehiculosService.getEstadoCuenta(placa.toUpperCase());
      setVehiculo(data);
    } catch (err) {
      console.error("Error cargando vehículo:", err);
      setError(
        err.response?.data?.detalle ||
          err.detalle ||
          "Error al cargar la información del vehículo"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placa]);

  const handleRegistrarPago = () => {
    // Redirigir a taquilla con la placa en la URL
    navigate(`/taquilla?placa=${placa.toUpperCase()}`);
  };

  const calculateTotalDeuda = () => {
    if (!vehiculo?.deudas_pendientes) return 0;
    return vehiculo.deudas_pendientes.reduce(
      (sum, deuda) => sum + parseFloat(deuda.saldo_pendiente),
      0
    );
  };

  const getStatusBadge = (estadoVencimiento) => {
    const variants = {
      pagado: {
        label: "Pagado",
        className: "bg-success text-success-foreground",
      },
      pendiente: {
        label: "Pendiente",
        className: "bg-warning text-warning-foreground",
      },
      vencido: {
        label: "Vencido",
        className: "bg-danger text-danger-foreground",
      },
      programado: {
        label: "Programado",
        className:
          "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      },
    };
    const config = variants[estadoVencimiento] || variants.pendiente;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/vehiculos")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Vehículos
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalDeuda = calculateTotalDeuda();
  const deudasVencidas = vehiculo?.deudas_pendientes?.filter(
    (d) => d.estado_vencimiento === "vencido"
  ).length || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/vehiculos")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <Button
          onClick={handleRegistrarPago}
          className="gap-2"
          size="lg"
          disabled={!vehiculo?.deudas_pendientes?.length}
        >
          <CreditCard className="h-4 w-4" />
          Registrar Pago
        </Button>
      </div>

      {/* Información del Vehículo */}
      <Card className="shadow-md">
        <CardHeader className="bg-primary/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Car className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {vehiculo?.placa}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {vehiculo?.tipo_vehiculo === "taxi_blanco"
                    ? "Taxi Blanco"
                    : vehiculo?.tipo_vehiculo === "taxi_amarillo"
                    ? "Taxi Amarillo"
                    : vehiculo?.tipo_vehiculo === "escalera"
                    ? "Escalera"
                    : vehiculo?.tipo_vehiculo}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Propietario</p>
                  <p className="font-medium">{vehiculo?.propietario_nombre || "No registrado"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Conductor Actual</p>
                  <p className="font-medium">{vehiculo?.conductor_actual_nombre || "No asignado"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Deuda Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-danger">
              ${totalDeuda.toLocaleString("es-CO")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {vehiculo?.deudas_pendientes?.length || 0} rubros pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Deudas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">
              {deudasVencidas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Acción Requerida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRegistrarPago}
              className="w-full"
              disabled={!vehiculo?.deudas_pendientes?.length}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Ir a Taquilla
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Cuenta Detallado */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Estado de Cuenta Detallado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vehiculo?.deudas_pendientes?.length > 0 ? (
            <div className="space-y-3">
              {vehiculo.deudas_pendientes.map((deuda) => (
                <div
                  key={deuda.deuda_id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-base">
                        {deuda.rubro.nombre}
                      </span>
                      {getStatusBadge(deuda.estado_vencimiento)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(
                          deuda.periodo + "T00:00:00"
                        ).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Valor original: $
                      {parseFloat(deuda.valor_cargado).toLocaleString("es-CO")}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold">
                      ${parseFloat(deuda.saldo_pendiente).toLocaleString("es-CO")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Saldo pendiente
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                <DollarSign className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                ¡Todo al día!
              </h3>
              <p className="text-muted-foreground">
                Este vehículo no tiene deudas pendientes
              </p>
            </div>
          )}

          {vehiculo?.deudas_pendientes?.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total a Pagar
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ${totalDeuda.toLocaleString("es-CO")}
                  </p>
                </div>
                <Button
                  onClick={handleRegistrarPago}
                  size="lg"
                  className="gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Procesar Pago en Taquilla
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
