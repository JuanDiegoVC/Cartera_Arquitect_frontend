import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Componente ResumenPorConcepto
 * Muestra los totales agrupados por concepto/categoría de forma visual.
 *
 * @param {Object} props
 * @param {Array} props.resumen - Array con { concepto, total, cantidad }
 * @param {string} props.titulo - Título de la sección (ej: "Ingresos por Concepto")
 * @param {string} props.tipo - "ingresos" | "egresos" para estilos
 * @param {Function} props.formatearMoneda - Función para formatear montos
 */
const ResumenPorConcepto = ({
  resumen = [],
  titulo = "Resumen por Concepto",
  tipo = "ingresos",
  formatearMoneda = (v) => `$${v.toLocaleString("es-CO")}`,
}) => {
  if (!resumen || resumen.length === 0) {
    return null;
  }

  // Colores según el tipo
  const estilos = {
    ingresos: {
      border: "border-green-200",
      bg: "bg-green-50 dark:bg-green-950/20",
      badgeBg: "bg-green-100 dark:bg-green-900/40",
      badgeText: "text-green-700 dark:text-green-300",
      totalText: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-500",
    },
    egresos: {
      border: "border-red-200",
      bg: "bg-red-50 dark:bg-red-950/20",
      badgeBg: "bg-red-100 dark:bg-red-900/40",
      badgeText: "text-red-700 dark:text-red-300",
      totalText: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-500",
    },
  };

  const estilo = estilos[tipo] || estilos.ingresos;

  // Calcular total general
  const totalGeneral = resumen.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className={`${estilo.border} ${estilo.bg}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resumen.map((item) => (
            <div
              key={item.concepto}
              className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${estilo.badgeBg} ${estilo.badgeText}`}
                >
                  {item.concepto}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({item.cantidad} {item.cantidad === 1 ? "registro" : "registros"})
                </span>
              </div>
              <span className={`font-semibold ${estilo.totalText}`}>
                {formatearMoneda(item.total)}
              </span>
            </div>
          ))}

          {/* Total General */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t-2 border-gray-300 dark:border-gray-600">
            <span className="font-bold text-sm">TOTAL GENERAL</span>
            <span className={`font-bold text-lg ${estilo.totalText}`}>
              {formatearMoneda(totalGeneral)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

ResumenPorConcepto.propTypes = {
  resumen: PropTypes.arrayOf(
    PropTypes.shape({
      concepto: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
      cantidad: PropTypes.number.isRequired,
    })
  ),
  titulo: PropTypes.string,
  tipo: PropTypes.oneOf(["ingresos", "egresos"]),
  formatearMoneda: PropTypes.func,
};

export default ResumenPorConcepto;
