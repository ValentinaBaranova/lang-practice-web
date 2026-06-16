import { ExerciseType, Question, ExerciseVisibility } from "./exercise";

export interface ExerciseSetResponse {
  id: string;
  title: string;
  type: ExerciseType;
  visibility: ExerciseVisibility; // now always provided by API
  questions: Question[]; // always provided by API
  shareSlug?: string; // may be absent for non-public sets
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface AttemptResponse {
  id: string;
  exerciseSetId: string;
  studentName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  createdAt: string;
}

export interface AttemptQuestionResponse {
  id: string;
  attemptId: string;
  questionId: string;
  answers: GapAnswerResponse[];
}

export interface GapAnswerResponse {
  index: number;
  answer: string;
  isCorrect: boolean;
  expectedAnswer?: string | null;
}

export interface TeacherResponse {
  name: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}
