export enum ExerciseType {
  FILL_GAP_TEXT = "FILL_GAP_TEXT",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

export enum ExerciseVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface Question {
  id?: string;
  prompt: string;
  correctAnswer: string;
  sourceText: string;
  options?: string[];
}

export interface ExerciseSetDto {
  title: string;
  type: ExerciseType;
  visibility: ExerciseVisibility;
  questions: Question[];
}

export interface ExerciseFormData {
  title: string;
  type: ExerciseType;
  visibility: ExerciseVisibility;
  bulkInput: string;
}
