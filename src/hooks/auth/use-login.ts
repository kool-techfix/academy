"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi, type LoginInput } from "@/Services/auth.service";

import { AUTH_USER_QUERY_KEY } from "./use-user";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),

    onSuccess: ({ user }) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
    },
  });
}
