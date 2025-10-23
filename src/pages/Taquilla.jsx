import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Search, Car, InfoIcon, DollarSign, Calendar } from "lucide-react";
import { Separator } from "../components/ui/separator";

export default function Taquilla() {
  const [plate, setPlate] = useState("");
  const [searchedVehicle, setSearchedVehicle] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  // Mock data - In production, this would come from an API
  const mockVehicleData = {
    plate: "ABC123",
    owner: "Juan Pérez Rodríguez",
    items: [
      { id: "1", concept: "Administración", month: "Enero 2025", amount: 45000, status: "overdue" },
      { id: "2", concept: "Seguridad", month: "Enero 2025", amount: 35000, status: "overdue" },
      { id: "3", concept: "Pólizas", month: "Enero 2025", amount: 28000, status: "pending" },
      { id: "4", concept: "Administración", month: "Febrero 2025", amount: 45000, status: "pending" },
      { id: "5", concept: "Seguridad", month: "Febrero 2025", amount: 35000, status: "pending" },
    ],
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (plate.trim()) {
      // Simulate API call
      setSearchedVehicle(mockVehicleData);
      setSelectedItems([]);
    }
  };

  const handleToggleItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handlePayment = () => {
    if (selectedItems.length === 0) {
      alert("Por favor seleccione al menos un rubro para pagar");
      return;
    }
    const total = searchedVehicle.items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.amount, 0);
    
    alert(`Procesando pago de $${total.toLocaleString('es-CO')} para ${selectedItems.length} rubros`);
    // Here you would call your payment API
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: { variant: "default", label: "Pagado", className: "bg-success text-success-foreground" },
      pending: { variant: "secondary", label: "Pendiente", className: "bg-warning text-warning-foreground" },
      overdue: { variant: "destructive", label: "Vencido", className: "bg-danger text-danger-foreground" },
    };
    const config = variants[status] || variants.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const pendingItems = searchedVehicle?.items.filter(item => item.status !== "paid") || [];
  const totalSelected = searchedVehicle?.items
    .filter(item => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.amount, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Taquilla</h1>
        <p className="text-muted-foreground">
          Procese pagos de forma rápida y eficiente
        </p>
      </div>

      {/* Vehicle Search Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Buscar Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Ingrese placa del vehículo (ej: ABC123)"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="pl-10 text-lg font-semibold"
              />
            </div>
            <Button type="submit" size="lg" className="px-8">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchedVehicle && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Account Status Card */}
            <Card className="shadow-md">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg">
                  Estado de Cuenta
                </CardTitle>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xl font-bold">{searchedVehicle.plate}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Propietario: {searchedVehicle.owner}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {searchedVehicle.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{item.concept}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{item.month}</span>
                        </div>
                      </div>
                      <span className="text-lg font-bold ml-4">${item.amount.toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="shadow-md">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Procesar Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Seleccione rubros a pagar:</h3>
                    <div className="space-y-2">
                      {pendingItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={item.id}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={() => handleToggleItem(item.id)}
                          />
                          <label
                            htmlFor={item.id}
                            className="flex-1 flex items-center justify-between cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">{item.concept}</div>
                              <div className="text-sm text-muted-foreground">{item.month}</div>
                            </div>
                            <span className="font-bold">${item.amount.toLocaleString('es-CO')}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Rubros seleccionados:</span>
                      <span className="font-medium">{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total a pagar:</span>
                      <span className="text-primary">${totalSelected.toLocaleString('es-CO')}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    className="w-full" 
                    size="lg"
                    disabled={selectedItems.length === 0}
                  >
                    Procesar Pago
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <InfoIcon className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>Pago Múltiple:</strong> Puede seleccionar varios rubros simultáneamente para consolidarlos en un único recibo.
            </AlertDescription>
          </Alert>
        </>
      )}

      {!searchedVehicle && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <InfoIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Busque un vehículo para comenzar</h3>
          <p className="text-muted-foreground">
            Ingrese la placa del vehículo en el campo de búsqueda superior
          </p>
        </div>
      )}
    </div>
  );
}
