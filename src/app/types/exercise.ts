export enum ExerciseType {
  FILL_GAP_TEXT = "FILL_GAP_TEXT",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

export interface Question {
  id?: string;
  prompt: string;
  correctAnswer: string;
  sourceText: string;
  options?: string[];
}

export interface ExerciseSetDto {
  teacherId: string;
  title: string;
  type: ExerciseType;
  questions: Question[];
}
