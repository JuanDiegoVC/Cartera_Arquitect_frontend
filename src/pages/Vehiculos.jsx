import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Car, Plus, Search } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Vehiculos() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Vehículos</h1>
          <p className="text-muted-foreground">
            Gestione el registro de vehículos afiliados
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Vehículo
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vehículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground mt-1">Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">-</div>
            <p className="text-xs text-muted-foreground mt-1">Al día en sus pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Con Deudas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">-</div>
            <p className="text-xs text-muted-foreground mt-1">Tienen pagos pendientes</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
          <Car className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Gestión de Vehículos</h3>
        <p className="text-muted-foreground mb-4">
          Use el buscador superior o agregue un nuevo vehículo
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            Buscar Vehículo
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Vehículo
          </Button>
        </div>
      </div>
    </div>
  );
}
