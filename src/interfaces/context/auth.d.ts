export type SubscriptionPlan = 'BRONCE' | 'PLATA' | 'ORO';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  coverPicture?: string | null;
  biography?: string | null;
  location?: string | null;
  website?: string | null;
  joinDate?: string | null;

  role: 'ADMIN' | 'TEACHER' | 'MEMBER';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';

  createdAt: string;
  updatedAt: string;

  // CAMPOS DE SUSCRIPCIÓN - Lo que el backend devuelve
  subscriptionPlan?: SubscriptionPlan; // 'BRONCE' | 'PLATA' | 'ORO' (del backend)
  subscription?: SubscriptionPlan; // Alias para compatibilidad con componentes
  subscriptionExpiresAt?: string | null; // Fecha de vencimiento

  // CAMPO LEGADO (por compatibilidad con componentes viejos)
  suscriptions?: any[];
}
