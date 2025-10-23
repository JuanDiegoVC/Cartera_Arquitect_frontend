import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { FileText, TrendingUp, AlertCircle } from "lucide-react";

export default function Reportes() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reportes</h1>
        <p className="text-muted-foreground">
          Consulte y genere reportes del sistema
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Recaudos del Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Genere un reporte detallado de los recaudos realizados en el día
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-success" />
              Reporte Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Consulte el resumen de recaudos del mes actual o anteriores
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-warning" />
              Deudores Morosos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Lista de vehículos con pagos vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Módulo de Reportes</h3>
        <p className="text-muted-foreground">
          Seleccione un tipo de reporte para continuar
        </p>
      </div>
    </div>
  );
}
