"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/Services/auth.service";

export const AUTH_USER_QUERY_KEY = ["auth", "me"];

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
