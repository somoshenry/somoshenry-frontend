/**
 * Script de utilidad para simular la recepción de nuevos mensajes
 * Esto es solo para pruebas y desarrollo
 *
 * Para usar en la consola del navegador:
 *
 * // Simular 3 mensajes nuevos
 * window.simulateNewMessages(3);
 *
 * // Limpiar mensajes
 * window.clearMessages();
 */

// Declaración de tipos para TypeScript
declare global {
  interface Window {
    simulateNewMessages: (count: number) => void;
    clearMessages: () => void;
  }
}

if (typeof window !== 'undefined') {
  // Simular mensajes nuevos
  window.simulateNewMessages = (count: number = 1) => {
    localStorage.setItem('unreadMessagesCount', count.toString());
    console.log(`✅ Simulados ${count} mensaje(s) nuevo(s). Refresca la página o espera unos segundos.`);
  };

  // Limpiar mensajes
  window.clearMessages = () => {
    localStorage.setItem('unreadMessagesCount', '0');
    console.log('✅ Mensajes limpiados. Refresca la página.');
  };

  console.log('💬 Utilidades de chat cargadas:');
  console.log('  - window.simulateNewMessages(count) - Simular mensajes nuevos');
  console.log('  - window.clearMessages() - Limpiar contador de mensajes');
}

export {};
