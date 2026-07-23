import apiClient from "./client";

export interface NotificationSettings {
  emailRemindersEnabled: boolean;
  reminderDaysBefore: number;
  remindOnlyActive: boolean;
  weeklyDigestEnabled: boolean;
}

export const getSettings = async (): Promise<NotificationSettings> => {
  const { data } = await apiClient.get("/settings");
  return data.settings;
};

export const updateSettings = async (
  payload: Partial<NotificationSettings>
): Promise<NotificationSettings> => {
  const { data } = await apiClient.put("/settings", payload);
  return data.settings;
};