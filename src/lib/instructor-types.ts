export type QuizQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
};

export type Lesson = {
  id: string;
  title: string;
  youtubeLink: string;
  notesFilename?: string;
};

// export interface QuizQuestion {
//   id: string;
//   questionText: string;
//   options: string[];
//   correctAnswer: string;
// }

export interface Quiz {
  id: string;
  moduleId?: string | null;
  courseId?: string | null;
  passScore: number;
  allowRetake: boolean;
  questions: QuizQuestion[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;

  lessons: Lesson[];
  quiz?: Quiz | null;
}

export type InstructorCourse = {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Published';
  modules: Module[];
  finalAssessment: QuizQuestion[];
  enrolleeCount: number;
};

export type EnrolleeQuizResult = {
  moduleId: string;
  score: number;
  total: number;
};

export type Enrollee = {
  id: string;
  name: string;
  progress: number;
  finalAssessmentResult: number | 'In progress';
  moduleResults: EnrolleeQuizResult[];
};
