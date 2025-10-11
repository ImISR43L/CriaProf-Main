// src/lib/types.ts
import { SchoolColor } from "./colors";

// Movemos todas as interfaces partilhadas para este ficheiro
export interface Question {
  id: number;
  text: string;
  answer: string;
}

export interface ColorGroup {
  id: number;
  color: SchoolColor;
  questions: Question[];
}

export interface ActiveTool {
  answer: string;
  color: SchoolColor;
}