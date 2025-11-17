import { api } from './api';
import { User } from '../interfaces/context/auth';
import { tokenStore } from './tokenStore';
import { IRegisterFormProps } from '../interfaces/login-register/IRegisterFormProps';

export async function register(userData: IRegisterFormProps) {
  const registerData = {
    name: userData.name,
    username: userData.email,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    role: 'MEMBER', // o 'TEACHER' lo cambia el adminitrador desde su terminal!
    status: 'ACTIVE',
  };

  try {
    // El backend devuelve: { message, user }
    const { data } = await api.post('/auth/register', registerData);
    const { user } = data as {
      message: string;
      user: User;
    };

    return { user, success: true };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error en el registro');
  }
}

export async function login(username: string, password: string) {
  // El backend devuelve: { token } (JWT)
  // No devuelve el usuario directamente, necesitarás llamar a /users/me después
  const { data } = await api.post('/auth/login', {
    username, // Según tu imagen, el backend espera "username"
    password,
  });

  const { token } = data as { token: string };

  // Guardamos el token como access token
  tokenStore.setAccess(token);

  // Obtenemos los datos del usuario
  const userData = await me();

  return { user: userData.user };
}

// Endpoint /users/me para obtener datos del usuario autenticado
export async function me() {
  // Requiere Authorization Bearer token
  const { data } = await api.get('/users/me');
  const userResponse = data as { user: User; message?: string };
  const user = userResponse.user;

  console.log('🔐 authService.me() - Datos recibidos:', {
    subscriptionPlan: user?.subscriptionPlan,
    subscriptionExpiresAt: user?.subscriptionExpiresAt,
    subscription: user?.subscription,
  });

  // Mapear subscriptionPlan (del backend) a subscription (para componentes)
  if (user && user.subscriptionPlan) {
    console.log('✅ authService.me() - Mapeando:', user.subscriptionPlan);
    user.subscription = user.subscriptionPlan;
  }

  return { user };
}

export async function logout() {
  try {
    // Si tu backend tiene endpoint de logout, úsalo aquí
    // await api.post('/auth/logout');
  } finally {
    tokenStore.clear();
  }
}

export async function handleUrlTokenLogin(token: string) {
  tokenStore.setAccess(token);

  try {
    const userData = await me();
    return { user: userData.user };
  } catch (error) {
    console.error('Error al validar el token de URL:', error);
    tokenStore.clear();
    throw new Error('Token de URL inválido o expirado.');
  }
}
