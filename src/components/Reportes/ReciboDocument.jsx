import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import logoSotrapeñol from "../../assets/Logo1.png";

// Registrar fuentes (opcional, usa las fuentes predeterminadas del sistema)
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
  reciboTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#DC2626",
    marginTop: 8,
    textAlign: "right",
  },
  reciboNumero: {
    fontSize: 11,
    color: "#374151",
    textAlign: "right",
    marginTop: 2,
  },

  // Información del cliente
  clientSection: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    marginBottom: 15,
    borderRadius: 4,
    border: "1 solid #D1D5DB",
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    textTransform: "uppercase",
    borderBottom: "1 solid #9CA3AF",
    paddingBottom: 4,
  },
  clientRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  clientLabel: {
    width: "30%",
    fontSize: 9,
    fontWeight: "bold",
    color: "#4B5563",
  },
  clientValue: {
    width: "70%",
    fontSize: 9,
    color: "#1F2937",
  },

  // Tabla de conceptos
  table: {
    marginTop: 15,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1E40AF",
    padding: 8,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #E5E7EB",
    padding: 6,
  },
  tableRowAlt: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderBottom: "1 solid #E5E7EB",
    padding: 6,
  },
  colConcepto: {
    width: "50%",
    fontSize: 9,
  },
  colPeriodo: {
    width: "25%",
    fontSize: 9,
    textAlign: "center",
  },
  colValor: {
    width: "25%",
    fontSize: 9,
    textAlign: "right",
  },

  // Totales
  totalsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: "2 solid #2563EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#374151",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1F2937",
    minWidth: 100,
    textAlign: "right",
  },
  totalPagado: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#DC2626",
    minWidth: 100,
    textAlign: "right",
  },

  // Información adicional
  additionalInfo: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 4,
    border: "1 solid #FCD34D",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#78350F",
    width: "30%",
  },
  infoValue: {
    fontSize: 9,
    color: "#92400E",
    width: "70%",
  },

  // Pie de página
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: "1 solid #D1D5DB",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  elaboradoPor: {
    fontSize: 9,
    color: "#4B5563",
  },
  firmaSection: {
    marginTop: 40,
    alignItems: "center",
  },
  firmaLinea: {
    width: 200,
    borderTop: "1 solid #000000",
    marginBottom: 4,
  },
  firmaTexto: {
    fontSize: 8,
    color: "#6B7280",
  },

  // Nota legal
  notaLegal: {
    marginTop: 20,
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
 * @returns {string} - Fecha formateada (ej: 21 de noviembre de 2025, 10:30 AM)
 */
const formatDate = (dateString) => {
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
 * Formatea periodo (YYYY-MM-DD) a "Mes YYYY"
 * @param {string} periodo - Periodo en formato YYYY-MM-DD
 * @returns {string} - Periodo formateado (ej: Noviembre 2025)
 */
const formatPeriodo = (periodo) => {
  const date = new Date(periodo + "T00:00:00");
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
  });
};

/**
 * Componente de documento PDF para Recibo de Caja
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.datosRecibo - Datos completos del recibo
 * @param {Object} props.datosRecibo.empresa - Información de la empresa
 * @param {Object} props.datosRecibo.recibo - Información del recibo (número, fecha)
 * @param {Object} props.datosRecibo.cliente - Información del cliente/vehículo
 * @param {Array} props.datosRecibo.items - Array de conceptos/deudas pagadas
 * @param {Object} props.datosRecibo.totales - Totales del recibo
 * @param {Object} props.datosRecibo.pago - Información del pago (medio, observaciones)
 * @param {Object} props.datosRecibo.cajero - Información del cajero
 */
const ReciboDocument = ({ datosRecibo }) => {
  console.log("📑 [ReciboDocument] Renderizando documento PDF");
  console.log("📦 [ReciboDocument] Datos recibidos:", datosRecibo);

  const {
    empresa,
    recibo,
    cliente,
    items = [],
    totales,
    pago,
    cajero,
  } = datosRecibo;

  console.log("🏢 [ReciboDocument] Empresa:", empresa);
  console.log("📋 [ReciboDocument] Recibo:", recibo);
  console.log("👤 [ReciboDocument] Cliente:", cliente);
  console.log("📊 [ReciboDocument] Items:", items);
  console.log("💰 [ReciboDocument] Totales:", totales);

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
            <Text style={styles.reciboTitle}>RECIBO DE CAJA</Text>
            <Text style={styles.reciboNumero}>N°: {recibo.numero}</Text>
            <Text style={styles.reciboNumero}>
              Fecha: {formatDate(recibo.fecha)}
            </Text>
          </View>
        </View>

        {/* Información del Cliente */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>Información del Vehículo</Text>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Placa:</Text>
            <Text style={styles.clientValue}>{cliente.placa}</Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Tipo:</Text>
            <Text style={styles.clientValue}>{cliente.tipo_vehiculo}</Text>
          </View>
          <View style={styles.clientRow}>
            <Text style={styles.clientLabel}>Propietario:</Text>
            <Text style={styles.clientValue}>{cliente.propietario}</Text>
          </View>
          {cliente.conductor && (
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>Conductor:</Text>
              <Text style={styles.clientValue}>{cliente.conductor}</Text>
            </View>
          )}
        </View>

        {/* Tabla de Conceptos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colConcepto}>CONCEPTO</Text>
            <Text style={styles.colPeriodo}>PERIODO</Text>
            <Text style={styles.colValor}>VALOR</Text>
          </View>
          {items.map((item, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={styles.colConcepto}>{item.concepto}</Text>
              <Text style={styles.colPeriodo}>
                {formatPeriodo(item.periodo)}
              </Text>
              <Text style={styles.colValor}>{formatCurrency(item.valor)}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL PAGADO:</Text>
            <Text style={styles.totalPagado}>
              {formatCurrency(totales.total_pagado)}
            </Text>
          </View>
        </View>

        {/* Información Adicional */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Medio de Pago:</Text>
            <Text style={styles.infoValue}>{pago.medio_pago}</Text>
          </View>
          {pago.observaciones && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Observaciones:</Text>
              <Text style={styles.infoValue}>{pago.observaciones}</Text>
            </View>
          )}
        </View>

        {/* Pie de Página */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.elaboradoPor}>
              Elaborado por: {cajero.nombre}
            </Text>
            <Text style={styles.elaboradoPor}>Usuario: {cajero.usuario}</Text>
          </View>

          <View style={styles.firmaSection}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaTexto}>Firma del Cliente</Text>
          </View>

          <Text style={styles.notaLegal}>
            Este documento es un comprobante oficial de pago. Consérvelo para
            futuros reclamos.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReciboDocument;
