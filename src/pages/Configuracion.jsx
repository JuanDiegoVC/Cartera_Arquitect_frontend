import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Settings, Users, Database, Bell, Upload } from "lucide-react";
import { CargaMasivaModal } from "../components/CargaMasiva";
import { useNotificaciones } from "../context/NotificacionesContext";

export default function Configuracion() {
  const navigate = useNavigate();
  const [cargaMasivaOpen, setCargaMasivaOpen] = useState(false);
  const { contador, tieneNotificaciones } = useNotificaciones();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Administre las configuraciones del sistema
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Carga Masiva - Nueva tarjeta */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
          onClick={() => setCargaMasivaOpen(true)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Carga Masiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Importe rubros, vehículos y cartera desde un archivo Excel
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
          onClick={() => navigate('/configuracion/usuarios')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Gestione usuarios y permisos del sistema
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
          onClick={() => navigate('/configuracion/cobros')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-success" />
              Conceptos de Cobro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Configure los rubros y tarifas de cobro
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary relative"
          onClick={() => navigate('/configuracion/notificaciones')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Notificaciones
              {tieneNotificaciones && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {contador.total_no_leidas}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Configure alertas y notificaciones automáticas
            </p>
            {tieneNotificaciones && (
              <div className="flex gap-2 mt-2">
                {contador.criticas > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {contador.criticas} crítica{contador.criticas > 1 ? "s" : ""}
                  </Badge>
                )}
                {contador.advertencias > 0 && (
                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">
                    {contador.advertencias} alerta{contador.advertencias > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
          onClick={() => navigate('/configuracion/general')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Configuraciones generales del sistema (tema, apariencia)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Carga Masiva */}
      <CargaMasivaModal
        open={cargaMasivaOpen}
        onOpenChange={setCargaMasivaOpen}
      />
    </div>
  );
}
