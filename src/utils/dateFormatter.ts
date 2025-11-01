/**
 * Formatea una fecha para mostrar en la zona horaria de Argentina
 * @param dateString - La fecha en formato ISO string desde el backend
 * @returns Fecha formateada en español argentino
 */
export function formatDateArgentina(dateString: string | Date): string {
  if (!dateString) return '';
  
  let date = new Date(dateString);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return '';
  
  // El backend guarda la hora en zona horaria local de Argentina pero sin timezone
  // JavaScript la interpreta como UTC, así que necesitamos restar 3 horas
  date = new Date(date.getTime() - (3 * 60 * 60 * 1000));
  
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
