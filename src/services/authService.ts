import { api } from './api';
import { User } from '../interfaces/context/auth';
import { tokenStore } from './tokenStore';
import { IRegisterFormProps } from '../interfaces/IRegisterFormProps';

export async function register(userData: IRegisterFormProps) {
  // Preparamos los datos para el registro, excluyendo la confirmación de contraseña
  const registerData = {
    name: userData.name,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password,
    role: 'TEACHER', // o 'STUDENT' según tu necesidad
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
    // Manejamos los errores del registro
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error en el registro');
  }
}

export async function login(email: string, password: string) {
  // El backend devuelve: { token } (JWT)
  // No devuelve el usuario directamente, necesitarás llamar a /users/me después
  const { data } = await api.post('/auth/login', {
    username: email, // Según tu implementación previa
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
  return data as { user: User };
}

export async function logout() {
  try {
    // Si tu backend tiene endpoint de logout, úsalo aquí
    // await api.post('/auth/logout');
  } finally {
    tokenStore.clear();
  }
}
