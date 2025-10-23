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

/**
 * Obtiene el nombre del tipo de vehículo
 * @param {string} tipo - Código del tipo de vehículo
 * @returns {string} Nombre descriptivo
 */
export const getTipoVehiculoLabel = (tipo) => {
  const tipos = {
    taxi_blanco: 'Taxi Blanco',
    taxi_amarillo: 'Taxi Amarillo',
    escalera: 'Escalera',
    otro: 'Otro',
  };
  return tipos[tipo] || tipo;
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
