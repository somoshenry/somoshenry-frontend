/**
 * Utilidad para debuggear el flujo de suscripción
 * Úsalo en la consola del navegador para ver qué datos devuelve el backend
 */

export async function debugGetUserMe() {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.log('❌ No hay token guardado');
    return;
  }

  console.log('🔍 Consultando /users/me...');
  try {
    const response = await fetch('https://somoshenry-backend.onrender.com/users/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('✅ Respuesta completa:', data);
    console.log('✅ user.subscriptionPlan:', data.user?.subscriptionPlan);
    console.log('✅ user.subscriptionExpiresAt:', data.user?.subscriptionExpiresAt);
    console.log('✅ user.subscription:', data.user?.subscription);

    return data;
  } catch (error) {
    console.error('❌ Error al consultar /users/me:', error);
  }
}

// Exponerlo globalmente para usarlo en consola
if (typeof window !== 'undefined') {
  (window as any).debugGetUserMe = debugGetUserMe;
}
