export type SubscriptionPlan = 'FREE' | 'BASIC' | 'PREMIUM';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  subscription: SubscriptionPlan; 
  subscriptionExpiresAt?: string; 
}
