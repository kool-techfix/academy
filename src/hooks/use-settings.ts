import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  settingsApi,
  UpdateAccountInput,
  type UpdateNotificationsInput,
  type UpdateProfileInput,
} from "@/Services/settings.service";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsApi.getSettings,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => settingsApi.updateProfile(data),

    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.all, updatedSettings);
    },
  });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationsInput) =>
      settingsApi.updateNotifications(data),

    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.all, updatedSettings);
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAccountInput) => settingsApi.updateAccount(data),

    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(settingsKeys.all, updatedSettings);
    },
  });
}
