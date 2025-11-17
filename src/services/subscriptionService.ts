import { api } from "./api";

export const getMySubscription = async () => {
  const { data } = await api.get("/subscription/current");
  return data;
};