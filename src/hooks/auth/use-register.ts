"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  authApi,
  type InstructorRegisterInput,
  type LearnerRegisterInput,
} from "@/Services/auth.service";

import { AUTH_USER_QUERY_KEY } from "./use-user";

export function useRegisterLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LearnerRegisterInput) => authApi.registerLearner(input),

    onSuccess: ({ user }) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
    },
  });
}

export function useRegisterInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: InstructorRegisterInput) =>
      authApi.registerInstructor(input),

    onSuccess: ({ user }) => {
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
    },
  });
}
