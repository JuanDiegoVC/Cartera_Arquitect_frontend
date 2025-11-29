import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  FileText,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import ReporteCarteraModal from "../components/Reportes/ReporteCarteraModal";
import ReporteMensualModal from "../components/Reportes/ReporteMensualModal";

export default function Reportes() {
  const [modalCarteraOpen, setModalCarteraOpen] = useState(false);
  const [modalMensualOpen, setModalMensualOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Reportes</h1>
        <p className="text-muted-foreground">
          Consulte y genere reportes del sistema
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2 hover:border-primary"
          onClick={() => navigate("/cierre-turno")}
        >
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

        <Card
          className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2 hover:border-success"
          onClick={() => setModalMensualOpen(true)}
        >
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

        <Card
          className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2 hover:border-warning"
          onClick={() => navigate("/reportes/morosos")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-warning" />
              Cartera Vencida
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Lista de vehículos con pagos vencidos
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-all cursor-pointer hover:scale-105 border-2 border-blue-200 hover:border-blue-600"
          onClick={() => setModalCarteraOpen(true)}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Cartera Detallada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Desglose completo de deudas por mes, vehículo y rubro en Excel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Reporte de Cartera */}
      <ReporteCarteraModal
        open={modalCarteraOpen}
        onOpenChange={setModalCarteraOpen}
      />

      {/* Modal de Reporte Mensual */}
      <ReporteMensualModal
        open={modalMensualOpen}
        onOpenChange={setModalMensualOpen}
      />
    </div>
  );
}
