import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, Car, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { dashboardService } from "../services/dashboardService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const summary = await dashboardService.getSummary();
        setData(summary);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("Error al cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al Sistema de Gestión de Recaudos Sotrapeñol
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recaudos del Día
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.recaudos_del_dia || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total recaudado hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vehículos Activos
            </CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.vehiculos_activos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Afiliados al sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Deudas Pendientes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.deudas_pendientes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Vehículos con deudas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recaudo Mensual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data?.recaudo_mensual || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total del mes en curso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors flex items-center gap-3"
              onClick={() => navigate('/taquilla')}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Procesar Pago</div>
                <div className="text-sm text-muted-foreground">Registrar un nuevo recaudo</div>
              </div>
            </button>

            <button
              className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors flex items-center gap-3"
              onClick={() => navigate('/vehiculos/lista', { state: { openCreateModal: true } })}
            >
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Car className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="font-medium">Registrar Vehículo</div>
                <div className="text-sm text-muted-foreground">Agregar nuevo vehículo al sistema</div>
              </div>
            </button>

            <button
              className="w-full text-left p-4 rounded-lg border hover:bg-accent transition-colors flex items-center gap-3"
              onClick={() => navigate('/reportes')}
            >
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="font-medium">Ver Reportes</div>
                <div className="text-sm text-muted-foreground">Consultar estadísticas y reportes</div>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.actividad_reciente && data.actividad_reciente.length > 0 ? (
                data.actividad_reciente.map((actividad, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Pago registrado - {actividad.placa}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(actividad.monto)} • {formatDate(actividad.fecha)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3 pb-4">
                  <div className="w-2 h-2 rounded-full bg-muted mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">No hay actividad reciente</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
