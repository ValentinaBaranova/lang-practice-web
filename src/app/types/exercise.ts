export enum ExerciseType {
  FILL_GAP_TEXT = "FILL_GAP_TEXT",
  FILL_GAP_TEXT_MULTILINE = "FILL_GAP_TEXT_MULTILINE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

export enum ExerciseVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface Question {
  id?: string;
  prompt: string;
  sourceText: string;
  options?: string[];
  gaps?: Gap[];
}

export interface Gap {
  index: number;
  correctAnswer: string;
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
  bulkInput: string;
}
