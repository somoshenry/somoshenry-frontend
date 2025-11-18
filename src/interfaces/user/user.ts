export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription: SubscriptionPlan; 
  subscriptionExpiresAt?: string; 
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
  role: "ADMIN" | "TEACHER" | "MEMBER";
  status: "ACTIVE" | "SUSPENDED" | "DELETED";
  createdAt: string;
  updatedAt: string;

  // 🔥 ESTA ES LA RELACIÓN QUE TE FALTABA
  subscription?: Subscription | null;
}