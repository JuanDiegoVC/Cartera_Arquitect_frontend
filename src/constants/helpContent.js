/**
 * Archivo centralizado para todos los textos de ayuda y documentación
 * Esto permite mantener los textos en un solo lugar y facilitar traducciones futuras
 */

// =============================================================================
// TEXTOS DE TOOLTIPS POR MÓDULO
// =============================================================================

export const TOOLTIP_TEXTS = {
    // Dashboard
    dashboard: {
        recaudoDia: "Muestra el total de dinero recaudado durante el día actual. Se actualiza en tiempo real con cada pago registrado.",
        vehiculosActivos: "Número total de vehículos registrados y activos en el sistema.",
        deudasPendientes: "Suma total de todas las deudas pendientes de cobro en el sistema.",
        recaudoMes: "Acumulado de todos los pagos recibidos durante el mes actual.",
    },

    // Taquilla
    taquilla: {
        buscarPlaca: "Ingrese la placa del vehículo (ej: ABC123) para buscar su información y deudas pendientes.",
        registrarPago: "Permite registrar un pago parcial o total de las deudas seleccionadas del vehículo.",
        seleccionarDeudas: "Seleccione las deudas que desea incluir en el pago. Puede seleccionar múltiples deudas.",
        montoPago: "Ingrese el monto a pagar. Puede ser menor al total (pago parcial) o igual al total.",
        metodoPago: "Seleccione cómo el propietario realizará el pago: efectivo, transferencia, etc.",
    },

    // Vehículos
    vehiculos: {
        placa: "Placa única del vehículo. Formato colombiano: 3 letras + 3 números (ej: ABC123).",
        tipoVehiculo: "Categoría del vehículo: taxi, bus, colectivo, camioneta, etc.",
        propietario: "Nombre completo del propietario registrado del vehículo.",
        telefono: "Número de contacto del propietario para notificaciones.",
        estado: "Estado actual: Activo (puede circular), Inactivo (suspendido), o Retirado.",
        limiteDeuda: "Monto máximo de deuda permitido antes de generar alertas.",
    },

    // Configuración de Cobros
    cobros: {
        rubro: "Concepto o categoría del cobro (ej: Cuota mensual, Rodamiento, etc.).",
        tarifa: "Monto a cobrar por este concepto según el tipo de vehículo.",
        periodicidad: "Con qué frecuencia se genera este cobro: mensual, anual, único.",
        fechaVencimiento: "Fecha límite para pagar sin recargo.",
    },

    // Reportes
    reportes: {
        fechaInicio: "Fecha desde la cual se generará el reporte.",
        fechaFin: "Fecha hasta la cual se incluirán datos en el reporte.",
        exportarExcel: "Descarga el reporte en formato Excel (.xlsx) para análisis externo.",
        filtroTipoVehiculo: "Filtra el reporte para mostrar solo un tipo de vehículo específico.",
    },

    // Egresos
    egresos: {
        concepto: "Descripción del gasto realizado.",
        monto: "Valor del egreso en pesos colombianos.",
        categoria: "Tipo de egreso: operativo, administrativo, mantenimiento, etc.",
        comprobante: "Número de factura o recibo que respalda el gasto.",
    },

    // General
    general: {
        guardar: "Guarda todos los cambios realizados.",
        cancelar: "Descarta los cambios y vuelve al estado anterior.",
        eliminar: "Elimina permanentemente este registro. Esta acción no se puede deshacer.",
        editar: "Modifica la información de este registro.",
        buscar: "Escriba para buscar en la lista. La búsqueda es en tiempo real.",
    },
};

// =============================================================================
// PREGUNTAS FRECUENTES (FAQ)
// =============================================================================

export const FAQ_CATEGORIES = [
    {
        id: "general",
        title: "General",
        icon: "HelpCircle",
        roles: ["all"],
        questions: [
            {
                id: "g1",
                question: "¿Cómo inicio sesión en el sistema?",
                answer: "Ingrese su nombre de usuario y contraseña en la pantalla de inicio de sesión. Si olvidó su contraseña, contacte al administrador del sistema para restablecerla."
            },
            {
                id: "g2",
                question: "¿Cómo cambio mi contraseña?",
                answer: "Vaya a Configuración → Mi Perfil y seleccione la opción 'Cambiar Contraseña'. Deberá ingresar su contraseña actual y la nueva contraseña dos veces para confirmar."
            },
            {
                id: "g3",
                question: "¿Qué significan los colores en los semáforos?",
                answer: "🟢 Verde: Todo en orden, sin problemas. 🟡 Amarillo: Advertencia, requiere atención pronto. 🔴 Rojo: Crítico, requiere acción inmediata."
            },
        ]
    },
    {
        id: "taquilla",
        title: "Taquilla y Pagos",
        icon: "CreditCard",
        roles: ["taquilla", "administrador", "gerente"],
        questions: [
            {
                id: "t1",
                question: "¿Cómo registro un pago?",
                answer: "1. Busque el vehículo por su placa. 2. Seleccione las deudas a pagar. 3. Ingrese el monto recibido. 4. Seleccione el método de pago. 5. Haga clic en 'Registrar Pago'."
            },
            {
                id: "t2",
                question: "¿Puedo registrar pagos parciales?",
                answer: "Sí, puede ingresar un monto menor al total de las deudas seleccionadas. El sistema aplicará el pago y dejará el saldo restante como pendiente."
            },
            {
                id: "t3",
                question: "¿Cómo anulo un pago registrado por error?",
                answer: "Los pagos no se pueden anular directamente. Contacte al administrador o gerente, quien puede realizar ajustes desde el módulo de Auditoría."
            },
            {
                id: "t4",
                question: "¿Qué hago si el vehículo no aparece en la búsqueda?",
                answer: "Verifique que la placa esté correctamente escrita. Si el vehículo es nuevo, primero debe registrarse en el módulo de Vehículos antes de poder cobrarle."
            },
        ]
    },
    {
        id: "vehiculos",
        title: "Vehículos",
        icon: "Car",
        roles: ["administrador", "gerente", "taquilla"],
        questions: [
            {
                id: "v1",
                question: "¿Cómo registro un nuevo vehículo?",
                answer: "Vaya a Vehículos → Nuevo Vehículo. Complete todos los campos obligatorios: placa, tipo de vehículo, propietario y datos de contacto. Luego haga clic en 'Guardar'."
            },
            {
                id: "v2",
                question: "¿Cómo cambio el propietario de un vehículo?",
                answer: "Busque el vehículo, haga clic en 'Editar' y actualice los datos del propietario. El historial del propietario anterior se conserva."
            },
            {
                id: "v3",
                question: "¿Qué pasa cuando desactivo un vehículo?",
                answer: "El vehículo dejará de generar nuevas deudas automáticas, pero las deudas existentes permanecen activas y cobrables."
            },
        ]
    },
    {
        id: "reportes",
        title: "Reportes",
        icon: "FileText",
        roles: ["administrador", "gerente"],
        questions: [
            {
                id: "r1",
                question: "¿Cómo genero el reporte de recaudo diario?",
                answer: "Vaya a Reportes → Recaudo del Día. El reporte se genera automáticamente con la fecha actual. Puede exportarlo a Excel haciendo clic en el botón de descarga."
            },
            {
                id: "r2",
                question: "¿Qué es el reporte de morosidad?",
                answer: "Muestra todos los vehículos con deudas pendientes, ordenados por nivel de riesgo (semáforo). Permite identificar rápidamente los casos críticos."
            },
            {
                id: "r3",
                question: "¿Puedo programar reportes automáticos?",
                answer: "Actualmente los reportes se generan manualmente. Esta funcionalidad está en desarrollo para futuras versiones."
            },
        ]
    },
    {
        id: "configuracion",
        title: "Configuración",
        icon: "Settings",
        roles: ["administrador", "gerente"],
        questions: [
            {
                id: "c1",
                question: "¿Cómo creo un nuevo concepto de cobro (rubro)?",
                answer: "Vaya a Configuración → Cobros → pestaña 'Rubros'. Haga clic en 'Nuevo Rubro', complete el nombre y descripción, y guarde."
            },
            {
                id: "c2",
                question: "¿Cómo modifico las tarifas?",
                answer: "En Configuración → Cobros → pestaña 'Tarifas', busque la tarifa a modificar y haga clic en 'Editar'. Actualice el monto y guarde los cambios."
            },
            {
                id: "c3",
                question: "¿Quién puede acceder a la configuración?",
                answer: "Solo los usuarios con rol de Administrador o Gerente tienen acceso a los módulos de configuración."
            },
        ]
    },
];

// =============================================================================
// GUÍA RÁPIDA
// =============================================================================

export const QUICK_GUIDE = {
    title: "Guía Rápida de Uso",
    sections: [
        {
            title: "Primeros Pasos",
            roles: ["all"],
            content: `
1. **Iniciar sesión**: Use sus credenciales proporcionadas por el administrador.
2. **Dashboard**: Al ingresar, verá el resumen del día con los indicadores principales.
3. **Navegación**: Use el menú lateral para acceder a los diferentes módulos.
      `
        },
        {
            title: "Operación Diaria - Taquilla",
            roles: ["taquilla", "administrador"],
            content: `
**1. Apertura de Turno**
Al iniciar el día, asegúrese de tener cambio disponible y verifique que el sistema esté en línea.

**2. Cobro a Vehículos**
- Cuando llega un conductor, solicite la placa o número interno.
- Ingrese la placa en el buscador principal.
- Verifique la identidad del conductor/propietario.
- Seleccione los conceptos a pagar (Rodamiento, Ahorro, etc.).
- Reciba el dinero y confirme el monto en el sistema.
- Entregue el recibo generado (impreso o digital).

**3. Registro de Egresos**
Si debe realizar un pago (ej: compra de insumos), regístrelo inmediatamente en el módulo de "Egresos" para mantener la caja cuadrada.

**4. Cierre de Turno**
Al finalizar, vaya a "Cierre de Turno", cuente el dinero físico y compárelo con el total del sistema. Reporte cualquier diferencia.
      `
        },
        {
            title: "Gestión Administrativa",
            roles: ["administrador", "gerente"],
            content: `
**Gestión de Usuarios**
Para crear nuevos usuarios de taquilla, vaya a Configuración > Usuarios. Asigne siempre el rol mínimo necesario.

**Ajuste de Tarifas**
Las tarifas se pueden programar para cambiar automáticamente o ajustarse manualmente en Configuración > Cobros.

**Auditoría**
Revise periódicamente el módulo de Auditoría para detectar anulaciones sospechosas o cambios no autorizados en la configuración.
      `
        },
        {
            title: "Atajos de Teclado",
            roles: ["all"],
            content: `
- **Enter**: Confirmar búsqueda o acción
- **Escape**: Cerrar modal o cancelar
- **Ctrl + S**: Guardar cambios (en formularios)
      `
        },
    ]
};

// =============================================================================
// HELPER PARA OBTENER TEXTOS
// =============================================================================

/**
 * Obtiene un texto de tooltip por su clave
 * @param {string} key - Clave en formato "modulo.campo" (ej: "taquilla.buscarPlaca")
 * @returns {string} Texto del tooltip o cadena vacía si no existe
 */
export function getTooltipText(key) {
    if (!key || typeof key !== 'string') return '';

    const [module, field] = key.split('.');
    return TOOLTIP_TEXTS[module]?.[field] || '';
}

/**
 * Busca en las FAQ por término, filtrando opcionalmente por rol
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} userRole - Rol del usuario actual (opcional)
 * @returns {Array} Preguntas que coinciden con el término
 */
export function searchFAQ(searchTerm, userRole = null) {
    if (!searchTerm || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results = [];

    FAQ_CATEGORIES.forEach(category => {
        // Filtrar categoría por rol si se proporciona
        if (userRole && category.roles && !category.roles.includes("all") && !category.roles.includes(userRole)) {
            return;
        }

        category.questions.forEach(q => {
            if (
                q.question.toLowerCase().includes(term) ||
                q.answer.toLowerCase().includes(term)
            ) {
                results.push({
                    ...q,
                    category: category.title,
                });
            }
        });
    });

    return results;
}
