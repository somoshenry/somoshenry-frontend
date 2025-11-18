import { api } from './api';

export const getMySubscription = async () => {
 
  const { data: current } = await api.get('/subscription/current');

 
  const { data: canPost } = await api.get('/subscription/can-post');

  return {
    plan: current.plan,
    expiresAt: current.endDate, 
    postsRemaining: canPost.remaining ?? 0,
    postsLimit: canPost.plan ? (canPost.plan === 'PLATA' ? 50 : canPost.plan === 'ORO' ? -1 : 10) : 10, 

    rawCurrent: current,
    rawCanPost: canPost,
  };
};
