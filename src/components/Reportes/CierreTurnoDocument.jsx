import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import logoSotrapeñol from "../../assets/SOTRAPEÑOL.png";

// Registrar fuentes
Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }, { src: "Helvetica-Bold", fontWeight: "bold" }],
});

// Estilos del documento
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  // Encabezado
  header: {
    flexDirection: "row",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: "2 solid #2563EB",
  },
  logoContainer: {
    width: "25%",
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
  companyInfo: {
    width: "75%",
    paddingLeft: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: "#4B5563",
    marginBottom: 2,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DC2626",
    marginTop: 8,
    textAlign: "right",
  },
  dateInfo: {
    fontSize: 11,
    color: "#374151",
    textAlign: "right",
    marginTop: 2,
  },

  // Tarjetas de resumen
  summarySection: {
    marginBottom: 20,
  },
  summaryCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  summaryCard: {
    width: "32%",
    padding: 10,
    borderRadius: 4,
    border: "1 solid #D1D5DB",
  },
  cardGreen: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  cardBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  cardRed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  cardTitleGreen: {
    color: "#047857",
  },
  cardTitleBlue: {
    color: "#1D4ED8",
  },
  cardTitleRed: {
    color: "#DC2626",
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardAmountGreen: {
    color: "#047857",
  },
  cardAmountBlue: {
    color: "#1D4ED8",
  },
  cardAmountRed: {
    color: "#DC2626",
  },
  cardSubtitle: {
    fontSize: 7,
    color: "#6B7280",
  },

  // Sección de movimientos
  movementSection: {
    marginTop: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottom: "1 solid #D1D5DB",
    paddingBottom: 5,
  },

  // Tabla de movimientos
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    padding: 6,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #E5E7EB",
    padding: 5,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottom: "1 solid #E5E7EB",
    padding: 5,
  },

  // Columnas de tabla de ingresos (actualizado para más detalle)
  colHora: {
    width: "8%",
    fontSize: 7,
  },
  colPlaca: {
    width: "12%",
    fontSize: 7,
    fontWeight: "bold",
  },
  colPropietario: {
    width: "18%",
    fontSize: 7,
  },
  colTipoVehiculo: {
    width: "12%",
    fontSize: 6,
  },
  colConcepto: {
    width: "14%",
    fontSize: 7,
  },
  colPeriodo: {
    width: "12%",
    fontSize: 7,
  },
  colMedio: {
    width: "10%",
    fontSize: 7,
  },
  colMonto: {
    width: "14%",
    fontSize: 7,
    textAlign: "right",
  },

  // Columnas de tabla de egresos
  colHoraEgreso: {
    width: "10%",
    fontSize: 7,
  },
  colCategoria: {
    width: "22%",
    fontSize: 7,
  },
  colDescripcion: {
    width: "38%",
    fontSize: 7,
  },
  colMetodo: {
    width: "15%",
    fontSize: 7,
  },
  colMontoEgreso: {
    width: "15%",
    fontSize: 7,
    textAlign: "right",
  },

  // Badges
  badge: {
    fontSize: 7,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 3,
    textAlign: "center",
  },
  badgeGreen: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  badgeBlue: {
    backgroundColor: "#DBEAFE",
    color: "#1E40AF",
  },

  // Sección de firmas
  signatureSection: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #D1D5DB",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  signatureBox: {
    width: "45%",
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderTop: "1 solid #000000",
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#4B5563",
    fontWeight: "bold",
  },
  signatureName: {
    fontSize: 7,
    color: "#6B7280",
    marginTop: 2,
  },

  // Pie de página
  footer: {
    marginTop: 20,
    fontSize: 7,
    color: "#9CA3AF",
    textAlign: "center",
    fontStyle: "italic",
  },

  // Mensaje sin datos
  emptyMessage: {
    fontSize: 8,
    color: "#9CA3AF",
    textAlign: "center",
    fontStyle: "italic",
    padding: 10,
  },
});

/**
 * Formatea un número como moneda colombiana
 */
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `$${num.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Formatea una fecha en formato legible
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Componente de documento PDF para Cierre de Turno
 */
const CierreTurnoDocument = ({ datosCierre }) => {
  console.log("📑 [CierreTurnoDocument] Renderizando documento PDF");
  console.log("📦 [CierreTurnoDocument] Datos recibidos:", datosCierre);

  const { empresa, fecha, resumen, movimientos, cajero } = datosCierre;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image src={logoSotrapeñol} style={styles.logo} />
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{empresa.nombre}</Text>
            <Text style={styles.companyDetails}>NIT: {empresa.nit}</Text>
            <Text style={styles.companyDetails}>
              Dirección: {empresa.direccion}
            </Text>
            <Text style={styles.companyDetails}>
              Teléfono: {empresa.telefono}
            </Text>
            <Text style={styles.documentTitle}>CIERRE DE TURNO</Text>
            <Text style={styles.dateInfo}>{formatDate(fecha)}</Text>
          </View>
        </View>

        {/* Tarjetas de Resumen */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCards}>
            {/* Balance en Caja */}
            <View style={[styles.summaryCard, styles.cardGreen]}>
              <Text style={[styles.cardTitle, styles.cardTitleGreen]}>
                Balance en Caja (Efectivo)
              </Text>
              <Text style={[styles.cardAmount, styles.cardAmountGreen]}>
                {formatCurrency(resumen.balance_caja_fisica)}
              </Text>
              <Text style={styles.cardSubtitle}>
                {formatCurrency(resumen.total_ingresos_efectivo)} -{" "}
                {formatCurrency(resumen.total_egresos)}
              </Text>
            </View>

            {/* Total Bancos/Digital */}
            <View style={[styles.summaryCard, styles.cardBlue]}>
              <Text style={[styles.cardTitle, styles.cardTitleBlue]}>
                Total Bancos/Digital
              </Text>
              <Text style={[styles.cardAmount, styles.cardAmountBlue]}>
                {formatCurrency(resumen.total_ingresos_digitales)}
              </Text>
              <Text style={styles.cardSubtitle}>
                Transferencias y otros medios
              </Text>
            </View>

            {/* Total Gastado */}
            <View style={[styles.summaryCard, styles.cardRed]}>
              <Text style={[styles.cardTitle, styles.cardTitleRed]}>
                Total Gastado Hoy
              </Text>
              <Text style={[styles.cardAmount, styles.cardAmountRed]}>
                {formatCurrency(resumen.total_egresos)}
              </Text>
              <Text style={styles.cardSubtitle}>
                {movimientos.egresos.length}{" "}
                {movimientos.egresos.length === 1
                  ? "transacción"
                  : "transacciones"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tabla de Ingresos - Versión Detallada */}
        <View style={styles.movementSection}>
          <Text style={styles.sectionTitle}>Detalle de Ingresos del Día</Text>
          {movimientos.ingresos.length === 0 ? (
            <Text style={styles.emptyMessage}>
              No hay ingresos registrados en este turno
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colHora}>Hora</Text>
                <Text style={styles.colPlaca}>Placa</Text>
                <Text style={styles.colPropietario}>Propietario</Text>
                <Text style={styles.colTipoVehiculo}>Tipo</Text>
                <Text style={styles.colConcepto}>Concepto</Text>
                <Text style={styles.colPeriodo}>Periodo</Text>
                <Text style={styles.colMedio}>Medio</Text>
                <Text style={styles.colMonto}>Monto</Text>
              </View>
              {movimientos.ingresos.map((ingreso, index) => (
                <View
                  key={index}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={styles.colHora}>{ingreso.hora}</Text>
                  <Text style={styles.colPlaca}>{ingreso.placa}</Text>
                  <Text style={styles.colPropietario}>
                    {ingreso.propietario || "Sin propietario"}
                  </Text>
                  <Text style={styles.colTipoVehiculo}>
                    {ingreso.tipo_vehiculo || "-"}
                  </Text>
                  <Text style={styles.colConcepto}>
                    {ingreso.concepto || "-"}
                  </Text>
                  <Text style={styles.colPeriodo}>
                    {ingreso.periodo || "-"}
                  </Text>
                  <Text style={styles.colMedio}>
                    {ingreso.medio_pago || "-"}
                  </Text>
                  <Text style={styles.colMonto}>
                    {formatCurrency(ingreso.monto)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tabla de Egresos */}
        <View style={styles.movementSection}>
          <Text style={styles.sectionTitle}>Detalle de Egresos del Día</Text>
          {movimientos.egresos.length === 0 ? (
            <Text style={styles.emptyMessage}>
              No hay egresos registrados en este turno
            </Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colHoraEgreso}>Hora</Text>
                <Text style={styles.colCategoria}>Categoría</Text>
                <Text style={styles.colDescripcion}>Descripción</Text>
                <Text style={styles.colMetodo}>Método</Text>
                <Text style={styles.colMontoEgreso}>Monto</Text>
              </View>
              {movimientos.egresos.map((egreso, index) => (
                <View
                  key={index}
                  style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                >
                  <Text style={styles.colHoraEgreso}>{egreso.hora}</Text>
                  <Text style={styles.colCategoria}>{egreso.categoria}</Text>
                  <Text style={styles.colDescripcion}>
                    {egreso.descripcion || "-"}
                  </Text>
                  <Text style={styles.colMetodo}>{egreso.medio_pago}</Text>
                  <Text style={styles.colMontoEgreso}>
                    {formatCurrency(egreso.monto)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sección de Firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Cajero</Text>
              <Text style={styles.signatureName}>{cajero.nombre}</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Supervisor</Text>
            </View>
          </View>
        </View>

        {/* Pie de página */}
        <Text style={styles.footer}>
          Documento generado el{" "}
          {new Date().toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" - "}
          Este es un documento oficial de cierre de turno. Consérvelo para
          auditorías futuras.
        </Text>
      </Page>
    </Document>
  );
};

export default CierreTurnoDocument;
