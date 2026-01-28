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
    paddingBottom: 15,
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
    fontSize: 20,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    marginTop: 10,
    textAlign: "right",
  },
  documentDate: {
    fontSize: 10,
    color: "#374151",
    textAlign: "right",
    marginTop: 4,
  },

  // Información del vehículo
  vehicleSection: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    marginBottom: 20,
    borderRadius: 4,
    border: "1 solid #D1D5DB",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
    textTransform: "uppercase",
    borderBottom: "1 solid #9CA3AF",
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: "30%",
    fontSize: 10,
    fontWeight: "bold",
    color: "#4B5563",
  },
  infoValue: {
    width: "70%",
    fontSize: 10,
    color: "#1F2937",
  },

  // Resumen de cuenta
  summarySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryCard: {
    width: "48%",
    padding: 12,
    borderRadius: 4,
    border: "1 solid #D1D5DB",
  },
  summaryCardRed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },
  summaryCardBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
  },
  summaryCardTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  summaryCardTitleRed: {
    color: "#DC2626",
  },
  summaryCardTitleBlue: {
    color: "#1D4ED8",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  summaryAmountRed: {
    color: "#DC2626",
  },
  summaryAmountBlue: {
    color: "#1D4ED8",
  },
  summarySubtitle: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 4,
  },

  // Tabla de deudas
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    padding: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #E5E7EB",
    padding: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottom: "1 solid #E5E7EB",
    padding: 8,
  },
  colConcepto: {
    width: "30%",
    fontSize: 9,
  },
  colPeriodo: {
    width: "20%",
    fontSize: 9,
    textAlign: "center",
  },
  colValor: {
    width: "17%",
    fontSize: 9,
    textAlign: "right",
  },
  colAbonado: {
    width: "16%",
    fontSize: 9,
    textAlign: "right",
    color: "#10B981",
  },
  colSaldo: {
    width: "17%",
    fontSize: 9,
    textAlign: "right",
    fontWeight: "bold",
    color: "#DC2626",
  },

  // Total
  totalSection: {
    marginTop: 10,
    paddingTop: 15,
    borderTop: "2 solid #2563EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#DC2626",
    minWidth: 120,
    textAlign: "right",
  },

  // Mensaje de invitación al pago
  paymentInvitation: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    border: "2 solid #F59E0B",
  },
  invitationTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 8,
    textAlign: "center",
  },
  invitationText: {
    fontSize: 10,
    color: "#78350F",
    textAlign: "center",
    lineHeight: 1.5,
    marginBottom: 6,
  },
  invitationHighlight: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#DC2626",
    textAlign: "center",
    marginTop: 8,
  },

  // Pie de página
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: "1 solid #D1D5DB",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  footerText: {
    fontSize: 8,
    color: "#6B7280",
  },
  notaLegal: {
    marginTop: 15,
    fontSize: 7,
    color: "#9CA3AF",
    textAlign: "center",
    fontStyle: "italic",
  },
});

/**
 * Formatea un número como moneda colombiana
 * @param {number|string} value - Valor a formatear
 * @returns {string} - Valor formateado (ej: $120.000)
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
 * @param {string} dateString - Fecha en formato ISO o string
 * @returns {string} - Fecha formateada (ej: 21 de noviembre de 2025)
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formatea una fecha con hora
 * @param {string} dateString - Fecha en formato ISO o string
 * @returns {string} - Fecha formateada (ej: 21 de noviembre de 2025, 10:30 AM)
 */
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formatea periodo (YYYY-MM) a "Mes de YYYY"
 * @param {string} periodo - Periodo en formato YYYY-MM
 * @returns {string} - Periodo formateado (ej: Noviembre de 2025)
 */
const formatPeriodo = (periodo) => {
  const [year, month] = periodo.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 15);
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
  });
};

/**
 * Componente de documento PDF para Estado de Cuenta
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.datosEstadoCuenta - Datos completos del estado de cuenta
 * @param {Object} props.datosEstadoCuenta.empresa - Información de la empresa
 * @param {Object} props.datosEstadoCuenta.vehiculo - Información del vehículo
 * @param {Array} props.datosEstadoCuenta.deudas - Array de deudas pendientes
 * @param {Object} props.datosEstadoCuenta.resumen - Resumen con totales
 * @param {string} props.datosEstadoCuenta.fechaGeneracion - Fecha de generación del documento
 */
const EstadoCuentaDocument = ({ datosEstadoCuenta }) => {
  const {
    empresa,
    vehiculo,
    deudas = [],
    resumen,
    fechaGeneracion,
  } = datosEstadoCuenta;

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
            <Text style={styles.documentTitle}>ESTADO DE CUENTA</Text>
            <Text style={styles.documentDate}>
              Generado: {formatDateTime(fechaGeneracion)}
            </Text>
          </View>
        </View>

        {/* Información del Vehículo */}
        <View style={styles.vehicleSection}>
          <Text style={styles.sectionTitle}>Información del Vehículo</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Placa:</Text>
            <Text style={styles.infoValue}>{vehiculo.placa}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Vehículo:</Text>
            <Text style={styles.infoValue}>{vehiculo.tipo_vehiculo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Propietario:</Text>
            <Text style={styles.infoValue}>{vehiculo.propietario}</Text>
          </View>
          {vehiculo.conductor && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Conductor:</Text>
              <Text style={styles.infoValue}>{vehiculo.conductor}</Text>
            </View>
          )}
          {vehiculo.numero_interno && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Número Interno:</Text>
              <Text style={styles.infoValue}>{vehiculo.numero_interno}</Text>
            </View>
          )}
        </View>

        {/* Resumen de Cuenta */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryCard, styles.summaryCardRed]}>
            <Text style={[styles.summaryCardTitle, styles.summaryCardTitleRed]}>
              Total Deuda Pendiente
            </Text>
            <Text style={[styles.summaryAmount, styles.summaryAmountRed]}>
              {formatCurrency(resumen.totalDeuda)}
            </Text>
            <Text style={styles.summarySubtitle}>
              {resumen.cantidadDeudas} concepto(s) pendiente(s)
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Text style={[styles.summaryCardTitle, styles.summaryCardTitleBlue]}>
              Total Cargado
            </Text>
            <Text style={[styles.summaryAmount, styles.summaryAmountBlue]}>
              {formatCurrency(resumen.totalCargado)}
            </Text>
            <Text style={styles.summarySubtitle}>
              Abonado: {formatCurrency(resumen.totalAbonado)}
            </Text>
          </View>
        </View>

        {/* Tabla de Deudas */}
        <Text style={styles.sectionTitle}>Detalle de Deudas Pendientes</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colConcepto}>CONCEPTO</Text>
            <Text style={styles.colPeriodo}>PERIODO</Text>
            <Text style={styles.colValor}>VALOR</Text>
            <Text style={styles.colAbonado}>ABONADO</Text>
            <Text style={styles.colSaldo}>SALDO</Text>
          </View>
          {deudas.map((deuda, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={styles.colConcepto}>{deuda.concepto}</Text>
              <Text style={styles.colPeriodo}>{formatPeriodo(deuda.periodo)}</Text>
              <Text style={styles.colValor}>{formatCurrency(deuda.valor)}</Text>
              <Text style={styles.colAbonado}>{formatCurrency(deuda.abonado)}</Text>
              <Text style={styles.colSaldo}>{formatCurrency(deuda.saldo)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PENDIENTE POR PAGAR:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(resumen.totalDeuda)}
            </Text>
          </View>
        </View>

        {/* Mensaje de Invitación al Pago - break="avoid" evita que se corte entre páginas */}
        <View style={styles.paymentInvitation} break={false} wrap={false}>
          <Text style={styles.invitationTitle}>
            ¡INVITACIÓN AL PAGO OPORTUNO!
          </Text>
          <Text style={styles.invitationText}>
            Estimado(a) afiliado(a), le recordamos la importancia de mantener
            su cuenta al día.
          </Text>
          <Text style={styles.invitationText}>
            El pago puntual de sus obligaciones contribuye al buen funcionamiento
            de nuestra cooperativa y garantiza la prestación de servicios de calidad
            para todos nuestros asociados.
          </Text>
          <Text style={styles.invitationHighlight}>
            ¡Gracias por su compromiso y puntualidad!
          </Text>
        </View>

        {/* Pie de Página */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Documento generado automáticamente
            </Text>
            <Text style={styles.footerText}>
              Fecha: {formatDate(fechaGeneracion)}
            </Text>
          </View>

          <Text style={styles.notaLegal}>
            Este documento es un extracto informativo del estado de cuenta.
            Para cualquier aclaración, por favor comuníquese con nuestras oficinas.
            Los valores pueden estar sujetos a cambios por pagos o ajustes posteriores a la fecha de generación.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default EstadoCuentaDocument;
