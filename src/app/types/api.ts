import { ExerciseType, Question, ExerciseVisibility } from "./exercise";

export interface ExerciseSetResponse {
  id: string;
  teacherName?: string;
  title: string;
  type: ExerciseType;
  visibility?: ExerciseVisibility;
  shareSlug: string;
  createdAt?: string;
  questions?: Question[];
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
}

export interface TeacherResponse {
  name: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}
