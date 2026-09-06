import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  quizApi,
  type CreateQuizPayload,
  type UpdateQuizPayload,
  type CreateQuestionPayload,
  type UpdateQuestionPayload,
} from "@/Services/quiz.service";

/**
 * Get the quiz attached to a module
 */
export function useModuleQuiz(moduleId: string) {
  return useQuery({
    queryKey: ["module-quiz", moduleId],

    queryFn: () => quizApi.getByModule(moduleId),

    enabled: Boolean(moduleId),
  });
}

/**
 * Create a quiz for a module
 */
export function useCreateModuleQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      data,
    }: {
      moduleId: string;
      data: CreateQuizPayload;
    }) => quizApi.createForModule(moduleId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["module-quiz", variables.moduleId],
      });

      // The instructor course detail may contain quiz information.
      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

/**
 * Update quiz settings
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      data,
    }: {
      quizId: string;
      data: UpdateQuizPayload;
    }) => quizApi.update(quizId, data),

    onSuccess: (updatedQuiz) => {
      queryClient.invalidateQueries({
        queryKey: ["module-quiz", updatedQuiz.moduleId],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

/**
 * Delete a quiz
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => quizApi.delete(quizId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-quiz"],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course"],
      });
    },
  });
}

/**
 * Create a question
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      quizId,
      data,
    }: {
      quizId: string;
      data: CreateQuestionPayload;
    }) => quizApi.createQuestion(quizId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-quiz"],
      });
    },
  });
}

/**
 * Update a question
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string;
      data: UpdateQuestionPayload;
    }) => quizApi.updateQuestion(questionId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-quiz"],
      });
    },
  });
}

/**
 * Delete a question
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => quizApi.deleteQuestion(questionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-quiz"],
      });
    },
  });
}
