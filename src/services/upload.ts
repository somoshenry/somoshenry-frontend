import { api } from './api';

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('media', file);
  const { data } = await api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url as string;
};
