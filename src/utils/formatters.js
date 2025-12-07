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
  { value: "automovil", label: "Automóvil" },
  { value: "automovil_municipal", label: "Automóvil Municipal" },
  { value: "automovil_intermunicipal", label: "Automóvil Intermunicipal" },
  { value: "bus", label: "Bus" },
  { value: "bus_municipal", label: "Bus Municipal" },
  { value: "bus_intermunicipal", label: "Bus Intermunicipal" },
  { value: "buseta", label: "Buseta" },
  { value: "buseta_municipal", label: "Buseta Municipal" },
  { value: "buseta_intermunicipal", label: "Buseta Intermunicipal" },
  { value: "camioneta", label: "Camioneta" },
  { value: "camioneta_municipal", label: "Camioneta Municipal" },
  { value: "camioneta_intermunicipal", label: "Camioneta Intermunicipal" },
  { value: "campero", label: "Campero" },
  { value: "campero_municipal", label: "Campero Municipal" },
  { value: "campero_intermunicipal", label: "Campero Intermunicipal" },
  { value: "escalera", label: "Escalera" },
  { value: "escalera_municipal", label: "Escalera Municipal" },
  { value: "escalera_intermunicipal", label: "Escalera Intermunicipal" },
  { value: "micro", label: "Micro" },
  { value: "micro_municipal", label: "Micro Municipal" },
  { value: "micro_intermunicipal", label: "Micro Intermunicipal" },
  { value: "microbus", label: "Microbús" },
  { value: "microbus_municipal", label: "Microbús Municipal" },
  { value: "microbus_intermunicipal", label: "Microbús Intermunicipal" },
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
