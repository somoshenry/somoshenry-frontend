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
  };

  try {
    // Esperamos: { accessToken, refreshToken, user }
    const { data } = await api.post('/auth/register', registerData);
    const { accessToken, refreshToken, user } = data as {
      accessToken: string;
      refreshToken: string;
      user: User;
    };

    // Guardamos los tokens
    tokenStore.setAccess(accessToken);
    tokenStore.setRefresh(refreshToken);

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
  // Esperamos: { accessToken, refreshToken, user }
  const { data } = await api.post('/auth/login', { email, password });
  const { accessToken, refreshToken, user } = data as {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  tokenStore.setAccess(accessToken);
  tokenStore.setRefresh(refreshToken);
  return { user };
}

// se necesita un /auth/me, solicitar al backend que lo implemente
export async function me() {
  // Requiere Authorization; si expira, el interceptor hará refresh
  const { data } = await api.get('/auth/me');
  return data as { user: User };
}

export async function logout() {
  // En este enfoque, solemos invalidar el refresh en backend
  const refreshToken = tokenStore.getRefresh();
  try {
    if (refreshToken) await api.post('/auth/logout', { refreshToken });
  } finally {
    tokenStore.clear();
  }
}
