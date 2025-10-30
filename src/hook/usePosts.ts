import { useContext } from 'react';
import { PostContext } from '../context/PostContext';

export function usePosts() {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error('usePosts debe usarse dentro de <PostProvider>');
  return ctx;
}
