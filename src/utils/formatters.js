/**
 * Formatea un número como moneda colombiana
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatea una fecha
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'datetime')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    datetime: {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat('es-CO', options[format]).format(dateObj);
};

/**
 * Returns today's date in YYYY-MM-DD format, in local timezone.
 * Use this instead of new Date().toISOString().split('T')[0] to avoid
 * the UTC issue where dates shift after 7 PM Colombia time.
 * @returns {string} Date in YYYY-MM-DD format
 */
export const getTodayLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns the current month in YYYY-MM format, in local timezone.
 * Use this instead of new Date().toISOString().slice(0, 7) to avoid UTC issues.
 * @returns {string} Month in YYYY-MM format
 */
export const getCurrentMonthLocal = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Converts a Date object to YYYY-MM-DD format in local timezone.
 * @param {Date} date - Date object to convert
 * @returns {string} Date in YYYY-MM-DD format
 */
export const toLocalDateString = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string from backend for display in local timezone.
 * Fixes the issue where 'YYYY-MM-DD' is interpreted as UTC midnight,
 * causing dates to shift to the previous day after 7 PM local time.
 * @param {string} dateString - Date string from backend (e.g., '2025-12-10')
 * @param {string} format - Format: 'short', 'long', 'datetime'
 * @returns {string} Formatted date in local timezone
 */
export const formatLocalDate = (dateString, format = 'short') => {
  if (!dateString) return '-';

  // Append T00:00:00 to date-only strings to force local interpretation
  // This prevents UTC conversion that shifts dates back a day after 7 PM
  let dateToFormat = dateString;
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    dateToFormat = dateString + 'T00:00:00';
  }

  const date = new Date(dateToFormat);
  if (isNaN(date.getTime())) return dateString;

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
  };

  return new Intl.DateTimeFormat('es-CO', options[format] || options.short).format(date);
};

/**
 * Formatea una placa de vehículo en mayúsculas
 * @param {string} placa - Placa a formatear
 * @returns {string} Placa formateada
 */
export const formatPlaca = (placa) => {
  if (!placa) return '';
  return placa.toUpperCase().trim();
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const VEHICLE_TYPES = [
  { value: "automovil_municipal", label: "Automóvil Municipal" },
  { value: "automovil_intermunicipal", label: "Automóvil Intermunicipal" },
  { value: "bus_rojo", label: "Bus rojo" },
  { value: "buseta_municipal", label: "Buseta Municipal" },
  { value: "buseta_rojo", label: "Buseta rojo" },
  { value: "camioneta_intermunicipal", label: "Camioneta Intermunicipal" },
  { value: "campero_municipal", label: "Campero Municipal" },
  { value: "escalera_municipal", label: "Escalera Municipal" },
  { value: "micro_rojo", label: "Micro rojo" },
  { value: "microbus_municipal", label: "Microbús Municipal" },
  { value: "microbus_rojo", label: "Microbús rojo" },
];

/**
 * Obtiene el nombre del tipo de vehículo
 * @param {string} tipo - Código del tipo de vehículo
 * @returns {string} Nombre descriptivo
 */
export const getTipoVehiculoLabel = (tipo) => {
  const found = VEHICLE_TYPES.find(t => t.value === tipo);
  return found ? found.label : tipo;
};

/**
 * Obtiene el color del estado de deuda
 * @param {string} estado - Estado de la deuda
 * @returns {string} Clase CSS o color
 */
export const getEstadoDeudaColor = (estado) => {
  const colores = {
    pendiente: 'red',
    abonado: 'orange',
    pagado: 'green',
  };
  return colores[estado] || 'gray';
};
