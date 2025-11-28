import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Settings, Users, Database, Bell, Upload } from "lucide-react";
import { CargaMasivaModal } from "../components/CargaMasiva";

export default function Configuracion() {
  const [cargaMasivaOpen, setCargaMasivaOpen] = useState(false);

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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => window.location.href = '/configuracion/cobros'}
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Configure alertas y notificaciones automáticas
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
          onClick={() => window.location.href = '/configuracion/general'}
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
