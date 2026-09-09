import { api } from "@/lib/api/axios";

export type UserSettings = {
  id: string;
  name: string;
  email: string;
  role: "LEARNER" | "INSTRUCTOR";
  expertise: string | null;
  authMethod: "EMAIL" | "GOOGLE";
  courseUpdatesNotification: boolean;
  learnerActivityNotification: boolean;
};

export type UpdateProfileInput = {
  name?: string;
  expertise?: string | null;
};

export type UpdateAccountInput = {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type UpdateNotificationsInput = {
  courseUpdatesNotification?: boolean;
  learnerActivityNotification?: boolean;
};

export const settingsApi = {
  async getSettings(): Promise<UserSettings> {
    const response = await api.get<{
      data: UserSettings;
    }>("/settings");

    return response.data.data;
  },

  async updateProfile(data: UpdateProfileInput): Promise<UserSettings> {
    const response = await api.patch<{
      message: string;
      data: UserSettings;
    }>("/settings/profile", data);

    return response.data.data;
  },

  async updateNotifications(
    data: UpdateNotificationsInput,
  ): Promise<UserSettings> {
    const response = await api.patch<{
      message: string;
      data: UserSettings;
    }>("/settings/notifications", data);

    return response.data.data;
  },

  async updateAccount(data: UpdateAccountInput): Promise<UserSettings> {
    const response = await api.patch<{
      message: string;
      data: UserSettings;
    }>("/settings/account", data);

    return response.data.data;
  },
};
