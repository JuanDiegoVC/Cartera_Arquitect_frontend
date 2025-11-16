import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Car, Plus, Search, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function Vehiculos() {
  const navigate = useNavigate();
  const [searchPlate, setSearchPlate] = useState("");
  const [error, setError] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    setError(null);
    
    if (searchPlate.trim().length < 3) {
      setError("Ingrese al menos 3 caracteres de la placa");
      return;
    }

    // Navegar a la vista de detalle del vehículo
    navigate(`/vehiculos/${searchPlate.trim().toUpperCase()}`);
  };

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

      {/* Búsqueda de Vehículo */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Buscar Vehículo por Placa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Ingrese placa del vehículo (ej: ABC123)"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                  className="text-lg font-semibold"
                />
              </div>
              <Button type="submit" size="lg" className="gap-2">
                <Search className="h-4 w-4" />
                Buscar
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
          <Car className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Gestión de Vehículos</h3>
        <p className="text-muted-foreground mb-4">
          Busque un vehículo por placa para ver su información completa y estado de cuenta
        </p>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-6">
          <Card className="text-left hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Consultar Estado</h4>
                  <p className="text-sm text-muted-foreground">
                    Vea el estado de cuenta y deudas pendientes de cualquier vehículo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="text-left hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Ir a Taquilla</h4>
                  <p className="text-sm text-muted-foreground">
                    Desde la vista del vehículo puede registrar pagos directamente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
