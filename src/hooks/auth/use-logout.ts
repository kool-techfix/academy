"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/Services/auth.service";

import { AUTH_USER_QUERY_KEY } from "./use-user";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,

    onSuccess: () => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);

      queryClient.removeQueries({
        queryKey: AUTH_USER_QUERY_KEY,
      });
    },
  });
}
