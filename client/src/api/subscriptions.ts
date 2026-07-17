import apiClient from "./client";

export interface Subscription {
  id: string;
  name: string;
  price: string;
  currency: string;
  billingCycle: "weekly" | "monthly" | "yearly";
  nextBillingAt: string;
  category: string | null;
  isActive: boolean;
}

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const { data } = await apiClient.get("/subscriptions");
  return data.subscriptions;
};

export const createSubscription = async (payload: {
  name: string;
  price: number;
  billingCycle: string;
  nextBillingAt: string;
  category?: string;
}) => {
  const { data } = await apiClient.post("/subscriptions", payload);
  return data.subscription;
};

export const deleteSubscription = async (id: string) => {
  await apiClient.delete(`/subscriptions/${id}`);
};

export const updateSubscription = async (
  id: string,
  payload: {
    name: string;
    price: number;
    billingCycle: string;
    nextBillingAt: string;
    category?: string;
    isActive?: boolean;
  }
) => {
  const { data } = await apiClient.put(`/subscriptions/${id}`, payload);
  return data.subscription;
};