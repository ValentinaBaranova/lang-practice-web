export enum ExerciseType {
  FILL_GAP_TEXT = "FILL_GAP_TEXT",
}

export interface Question {
  id?: string;
  prompt: string;
  correctAnswer: string;
}

export interface ExerciseSetDto {
  teacherId: string;
  title: string;
  type: ExerciseType;
  questions: Question[];
}
