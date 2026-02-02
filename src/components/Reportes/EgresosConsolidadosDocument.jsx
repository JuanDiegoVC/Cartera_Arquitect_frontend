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
        alignItems: "center",
    },
    logo: {
        width: 60,
        height: 60,
        marginRight: 15,
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1E40AF",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: "#6B7280",
    },
    dateInfo: {
        fontSize: 10,
        color: "#4B5563",
        marginTop: 2,
    },
    // Información del usuario
    userInfo: {
        backgroundColor: "#F3F4F6",
        padding: 10,
        borderRadius: 4,
        marginBottom: 15,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    userInfoItem: {
        fontSize: 9,
    },
    userInfoLabel: {
        color: "#6B7280",
    },
    userInfoValue: {
        fontWeight: "bold",
        color: "#1F2937",
    },
    // Tabla
    table: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#DC2626",
        padding: 8,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    tableHeaderText: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1 solid #E5E7EB",
        padding: 8,
        backgroundColor: "#FFFFFF",
    },
    tableRowAlt: {
        flexDirection: "row",
        borderBottom: "1 solid #E5E7EB",
        padding: 8,
        backgroundColor: "#FEF2F2",
    },
    // Columnas
    colCategoria: {
        width: "25%",
        fontSize: 8,
    },
    colDescripcion: {
        width: "35%",
        fontSize: 8,
    },
    colMedioPago: {
        width: "15%",
        fontSize: 8,
        textAlign: "center",
    },
    colHora: {
        width: "10%",
        fontSize: 8,
        textAlign: "center",
    },
    colMonto: {
        width: "15%",
        fontSize: 9,
        textAlign: "right",
        fontWeight: "bold",
    },
    // Total
    totalSection: {
        marginTop: 15,
        paddingTop: 10,
        borderTop: "2 solid #DC2626",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#1F2937",
        marginRight: 15,
    },
    totalValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#DC2626",
        backgroundColor: "#FEF2F2",
        padding: "5 15",
        borderRadius: 4,
    },
    // Pie de página
    footer: {
        position: "absolute",
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: "center",
        fontSize: 8,
        color: "#9CA3AF",
        borderTop: "1 solid #E5E7EB",
        paddingTop: 10,
    },
    noData: {
        textAlign: "center",
        fontSize: 12,
        color: "#9CA3AF",
        marginTop: 40,
        padding: 20,
        backgroundColor: "#F9FAFB",
        borderRadius: 4,
    },
});

// Formatear moneda
const formatCurrency = (value) => {
    const numero = parseFloat(value) || 0;
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(numero);
};

// Formatear fecha
const formatDate = (dateString) => {
    const fecha = new Date(dateString + "T00:00:00");
    return fecha.toLocaleDateString("es-CO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

/**
 * Documento PDF para Reporte Consolidado de Egresos
 * @param {Object} props
 * @param {Object} props.datosReporte - Datos del reporte
 * @param {string} props.datosReporte.fecha - Fecha del reporte (YYYY-MM-DD)
 * @param {Object} props.datosReporte.usuario - Info del usuario de taquilla
 * @param {Array} props.datosReporte.egresos - Lista de egresos
 * @param {number} props.datosReporte.total - Total de egresos
 */
const EgresosConsolidadosDocument = ({ datosReporte }) => {
    console.log("📑 [EgresosConsolidadosDocument] Renderizando documento PDF");
    console.log("📦 [EgresosConsolidadosDocument] Datos recibidos:", datosReporte);

    const { fecha, usuario, egresos = [], total = 0 } = datosReporte;

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Encabezado */}
                <View style={styles.header}>
                    <Image src={logoSotrapeñol} style={styles.logo} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.title}>REPORTE CONSOLIDADO DE EGRESOS</Text>
                        <Text style={styles.subtitle}>SOTRAPEÑOL LTDA</Text>
                        <Text style={styles.dateInfo}>{formatDate(fecha)}</Text>
                    </View>
                </View>

                {/* Información del usuario */}
                <View style={styles.userInfo}>
                    <View>
                        <Text style={styles.userInfoItem}>
                            <Text style={styles.userInfoLabel}>Usuario: </Text>
                            <Text style={styles.userInfoValue}>{usuario?.nombre || "N/A"}</Text>
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userInfoItem}>
                            <Text style={styles.userInfoLabel}>ID Usuario: </Text>
                            <Text style={styles.userInfoValue}>{usuario?.id || "N/A"}</Text>
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userInfoItem}>
                            <Text style={styles.userInfoLabel}>Total Egresos: </Text>
                            <Text style={styles.userInfoValue}>{egresos.length}</Text>
                        </Text>
                    </View>
                </View>

                {/* Tabla de Egresos */}
                {egresos.length > 0 ? (
                    <View style={styles.table}>
                        {/* Header de tabla */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, styles.colCategoria]}>Categoría</Text>
                            <Text style={[styles.tableHeaderText, styles.colDescripcion]}>Descripción</Text>
                            <Text style={[styles.tableHeaderText, styles.colMedioPago]}>Medio Pago</Text>
                            <Text style={[styles.tableHeaderText, styles.colHora]}>Hora</Text>
                            <Text style={[styles.tableHeaderText, styles.colMonto]}>Monto</Text>
                        </View>

                        {/* Filas de datos */}
                        {egresos.map((egreso, index) => (
                            <View
                                key={egreso.egreso_id || index}
                                style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
                            >
                                <Text style={styles.colCategoria}>
                                    {egreso.categoria_nombre || "Sin categoría"}
                                </Text>
                                <Text style={styles.colDescripcion}>
                                    {egreso.descripcion || "-"}
                                </Text>
                                <Text style={styles.colMedioPago}>
                                    {egreso.medio_pago_display || egreso.medio_pago || "Efectivo"}
                                </Text>
                                <Text style={styles.colHora}>
                                    {egreso.hora || "-"}
                                </Text>
                                <Text style={styles.colMonto}>
                                    {formatCurrency(egreso.valor)}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.noData}>
                        <Text>No hay egresos registrados para esta fecha</Text>
                    </View>
                )}

                {/* Total */}
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>TOTAL GENERAL:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                </View>

                {/* Pie de página */}
                <View style={styles.footer} fixed>
                    <Text>
                        Documento generado el {new Date().toLocaleString("es-CO")} - SOTRAPEÑOL LTDA
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default EgresosConsolidadosDocument;
