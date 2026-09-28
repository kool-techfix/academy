import { CourseRepository } from "@/Repositories/CourseRepository";
import { QuizRepository } from "@/Repositories/QuizRepository";

export type QuizType = "MODULE" | "FINAL";

export type QuizQuestionData = {
  questionText: string;
  options: string[];
  correctAnswer: string;
};

export type CreateQuizData = {
  type: QuizType;
  passScore?: number;
  allowRetake?: boolean;
  questions?: QuizQuestionData[];
};

export type UpdateQuizData = {
  passScore?: number;
  allowRetake?: boolean;
};

export class QuizService {
  private quizRepository: QuizRepository;
  private courseRepository: CourseRepository;

  constructor() {
    this.quizRepository = new QuizRepository();
    this.courseRepository = new CourseRepository();
  }

  async getQuiz(quizId: string) {
    const quiz = await this.quizRepository.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    return quiz;
  }

  async getModuleQuiz(moduleId: string) {
    return this.quizRepository.findByModule(moduleId);
  }

  async getCourseQuiz(courseId: string) {
    return this.quizRepository.findByCourse(courseId);
  }

  async createModuleQuiz(
    instructorId: string,
    moduleId: string,
    data: CreateQuizData,
  ) {
    const courseModule = await this.getModuleWithCourse(moduleId);

    await this.ensureInstructorHasAccess(
      instructorId,
      courseModule.courseId,
    );

    if (data.type !== "MODULE") {
      throw new Error("Module quiz must have type MODULE");
    }

    const existingQuiz =
      await this.quizRepository.findByModule(moduleId);

    if (existingQuiz) {
      throw new Error("This module already has a quiz");
    }

    this.validatePassScore(data.passScore);

    const quiz = await this.quizRepository.create({
      type: "MODULE",
      passScore: data.passScore ?? 70,
      allowRetake: data.allowRetake ?? true,
      module: {
        connect: {
          id: moduleId,
        },
      },
    });

    if (data.questions?.length) {
      await this.createQuestions(
        quiz.id,
        data.questions,
      );
    }

    return this.quizRepository.findById(quiz.id);
  }

  async createFinalQuiz(
    instructorId: string,
    courseId: string,
    data: CreateQuizData,
  ) {
    await this.ensureInstructorHasAccess(
      instructorId,
      courseId,
    );

    if (data.type !== "FINAL") {
      throw new Error("Final quiz must have type FINAL");
    }

    const existingQuiz =
      await this.quizRepository.findByCourse(courseId);

    if (existingQuiz) {
      throw new Error("This course already has a final quiz");
    }

    this.validatePassScore(data.passScore);

    const quiz = await this.quizRepository.create({
      type: "FINAL",
      passScore: data.passScore ?? 70,
      allowRetake: data.allowRetake ?? true,
      course: {
        connect: {
          id: courseId,
        },
      },
    });

    if (data.questions?.length) {
      await this.createQuestions(
        quiz.id,
        data.questions,
      );
    }

    return this.quizRepository.findById(quiz.id);
  }

  async updateQuiz(
    instructorId: string,
    quizId: string,
    data: UpdateQuizData,
  ) {
    const quiz = await this.quizRepository.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const courseId = await this.getQuizCourseId(quiz);

    await this.ensureInstructorHasAccess(
      instructorId,
      courseId,
    );

    this.validatePassScore(data.passScore);

    return this.quizRepository.update(
      quizId,
      {
        ...(data.passScore !== undefined && {
          passScore: data.passScore,
        }),
        ...(data.allowRetake !== undefined && {
          allowRetake: data.allowRetake,
        }),
      },
    );
  }

  async deleteQuiz(
    instructorId: string,
    quizId: string,
  ) {
    const quiz = await this.quizRepository.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const courseId = await this.getQuizCourseId(quiz);

    await this.ensureInstructorHasAccess(
      instructorId,
      courseId,
    );

    await this.quizRepository.deleteQuestionsByQuiz(
      quizId,
    );

    await this.quizRepository.delete(quizId);
  }

  async addQuestion(
    instructorId: string,
    quizId: string,
    data: QuizQuestionData,
  ) {
    const quiz = await this.quizRepository.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const courseId = await this.getQuizCourseId(quiz);

    await this.ensureInstructorHasAccess(
      instructorId,
      courseId,
    );

    this.validateQuestion(data);

    return this.quizRepository.createQuestion({
      questionText: data.questionText.trim(),
      options: data.options,
      correctAnswer: data.correctAnswer,
      quiz: {
        connect: {
          id: quizId,
        },
      },
    });
  }

  async updateQuestion(
    instructorId: string,
    questionId: string,
    data: QuizQuestionData,
  ) {
    const question =
      await this.quizRepository.findQuestionById(
        questionId,
      );

    if (!question) {
      throw new Error("Question not found");
    }

    const quiz = await this.quizRepository.findById(
      question.quizId,
    );

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const courseId = await this.getQuizCourseId(quiz);

    await this.ensureInstructorHasAccess(
      instructorId,
      courseId,
    );

    this.validateQuestion(data);

    return this.quizRepository.updateQuestion(
      questionId,
      {
        questionText: data.questionText.trim(),
        options: data.options,
        correctAnswer: data.correctAnswer,
      },
    );
  }

  async deleteQuestion(
    instructorId: string,
    questionId: string,
  ) {
    const question =
      await this.quizRepository.findQuestionById(
        questionId,
      );

    if (!question) {
      throw new Error("Question not found");
    }

    const quiz = await this.quizRepository.findById(
      question.quizId,
    );

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    const courseId = await this.getQuizCourseId(quiz);

    await this.ensureInstructorHasAccess(
      instructorId,
      courseId,
    );

    await this.quizRepository.deleteQuestion(
      questionId,
    );
  }

  private async createQuestions(
    quizId: string,
    questions: QuizQuestionData[],
  ) {
    for (const question of questions) {
      this.validateQuestion(question);

      await this.quizRepository.createQuestion({
        questionText: question.questionText.trim(),
        options: question.options,
        correctAnswer: question.correctAnswer,
        quiz: {
          connect: {
            id: quizId,
          },
        },
      });
    }
  }

  private async getModuleWithCourse(moduleId: string) {
  const courseModule =
    await this.courseRepository.getModuleWithCourse(
      moduleId,
    );

  if (!courseModule) {
    throw new Error("Module not found");
  }

  return courseModule;
}

  private async getQuizCourseId(quiz: {
    moduleId: string | null;
    courseId: string | null;
  }) {
    if (quiz.courseId) {
      return quiz.courseId;
    }

    if (quiz.moduleId) {
      const courseModule =
        await this.courseRepository.getModuleWithCourse(
          quiz.moduleId,
        );

      if (!courseModule) {
        throw new Error("Quiz module not found");
      }

      return courseModule.courseId;
    }

    throw new Error(
      "Quiz is not associated with a course or module",
    );
  }

  private async ensureInstructorHasAccess(
    instructorId: string,
    courseId: string,
  ) {
    const isAuthor =
      await this.courseRepository.isAuthor(
        courseId,
        instructorId,
      );

    if (!isAuthor) {
      throw new Error(
        "You do not have permission to manage this quiz",
      );
    }
  }

  private validatePassScore(passScore?: number) {
    if (passScore === undefined) {
      return;
    }

    if (
      !Number.isInteger(passScore) ||
      passScore < 0 ||
      passScore > 100
    ) {
      throw new Error(
        "Pass score must be an integer between 0 and 100",
      );
    }
  }

  private validateQuestion(
    question: QuizQuestionData,
  ) {
    if (!question.questionText?.trim()) {
      throw new Error("Question text is required");
    }

    if (
      !Array.isArray(question.options) ||
      question.options.length < 2
    ) {
      throw new Error(
        "A question must have at least two options",
      );
    }

    const options = question.options.map((option) =>
      option.trim(),
    );

    if (options.some((option) => !option)) {
      throw new Error(
        "Question options cannot be empty",
      );
    }

    if (!options.includes(question.correctAnswer)) {
      throw new Error(
        "Correct answer must match one of the question options",
      );
    }
  }
}