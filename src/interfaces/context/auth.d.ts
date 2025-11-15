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

  // 🔥 CAMPOS NECESARIOS PARA PLANES
  subscription?: SubscriptionPlan;            // BRONCE | PLATA | ORO
  subscriptionExpiresAt?: string | null;      // Fecha de renovación
}
