export type SubscriptionPlan = 'BRONCE' | 'PLATA' | 'ORO';

export interface Subscription {
  id: string;
  plan: SubscriptionPlan; // BRONCE | PLATA | ORO
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

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

  role: 'ADMIN' | 'TEACHER' | 'TA' | 'MEMBER';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';

  createdAt: string;
  updatedAt: string;

  // SUSCRIPCIÓN - Lo que el backend devuelve
  subscription?: Subscription | null; // Objeto completo de suscripción
  subscriptionExpiresAt?: string | null; // Compatibilidad con versiones antiguas

  // LEGADO
  suscriptions?: any[];
}
