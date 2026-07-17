import apiClient from "./client";

export const registerUser = async (email: string, password: string) => {
  const { data } = await apiClient.post("/auth/register", { email, password });
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
};