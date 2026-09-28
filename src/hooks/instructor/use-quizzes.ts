/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  quizApi,
  type CreateQuizPayload,
  type UpdateQuizPayload,
  type CreateQuestionPayload,
  type UpdateQuestionPayload,
} from "@/Services/quiz.service";

type QuizQueryContext =
  | {
      type: "MODULE";
      moduleId: string;
      courseId: string;
    }
  | {
      type: "FINAL";
      courseId: string;
    };

    function invalidateQuizQuery(
  queryClient: ReturnType<typeof useQueryClient>,
  context: QuizQueryContext,
) {
  if (context.type === "MODULE") {
    queryClient.invalidateQueries({
      queryKey: [
        "module-quiz",
        context.moduleId,
        context.courseId,
      ],
    });

    return;
  }

  queryClient.invalidateQueries({
    queryKey: [
      "course-final-assessment",
      context.courseId,
    ],
  });
}

/**
 * Get the quiz attached to a module
 */
export function useModuleQuiz(moduleId: string, courseId: string) {
  return useQuery({
    queryKey: ["module-quiz", moduleId, courseId],

    queryFn: () => quizApi.getByModule(moduleId, courseId),

    enabled: Boolean(moduleId && courseId),
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
      courseId,
      data,
    }: {
      moduleId: string;
      data: CreateQuizPayload;
      courseId: string;
    }) => quizApi.createForModule(moduleId, courseId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["module-quiz", variables.moduleId, variables.courseId],
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
      if (updatedQuiz.moduleId && updatedQuiz.courseId) {
        queryClient.invalidateQueries({
          queryKey: [
            "module-quiz",
            updatedQuiz.moduleId,
            updatedQuiz.courseId,
          ],
        });
      }

      if (updatedQuiz.courseId && !updatedQuiz.moduleId) {
        queryClient.invalidateQueries({
          queryKey: [
            "course-final-assessment",
            updatedQuiz.courseId,
          ],
        });
      }

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
      context,
    }: {
      quizId: string;
      data: CreateQuestionPayload;
      context: QuizQueryContext;
    }) => quizApi.createQuestion(quizId, data),

    onSuccess: (_, variables) => {
      invalidateQuizQuery(
        queryClient,
        variables.context,
      );
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
      context: QuizQueryContext;
    }) => quizApi.updateQuestion(questionId, data),

    onSuccess: (_, variables) => {
      invalidateQuizQuery(
        queryClient,
        variables.context
      );
    },
  });
}

/**
 * Delete a question
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({questionId, context}: { questionId: string; context: QuizQueryContext }) => quizApi.deleteQuestion(questionId),

    onSuccess: (_, variables) => {
      invalidateQuizQuery(
        queryClient,
        variables.context
      );
    },
  });
}

/**
 * Get the final assessment attached to a course
 */
export function useCourseFinalAssessment(courseId: string) {
  return useQuery({
    queryKey: ["course-final-assessment", courseId],

    queryFn: () => quizApi.getByCourse(courseId),

    enabled: Boolean(courseId),
  });
}

/**
 * Create a final assessment for a course
 */
export function useCreateCourseFinalAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      data,
    }: {
      courseId: string;
      data: CreateQuizPayload;
    }) => quizApi.createForCourse(courseId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["course-final-assessment", variables.courseId],
      });

      queryClient.invalidateQueries({
        queryKey: ["instructor-course", variables.courseId],
      });
    },
  });
}
