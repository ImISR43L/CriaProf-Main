import { SchoolColor } from "./colors";

// Interface para Categorias, agora exportada
export interface TemplateCategory {
  id: string;
  name: string;
}

// Define o tipo da pergunta
export type QuestionType = "single" | "multiple";

// Interface para uma opção de resposta individual
export interface AnswerOption {
  id: number;
  text: string;
  answer: string; // O valor que será pintado na grade
}

// Interface principal da Pergunta, agora mais completa
export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: AnswerOption[];
  correctOptionId: number;
  // Para perguntas de escolha única, a cor fica aqui
  color?: SchoolColor;
  // Para múltipla escolha, cada opção terá sua cor
  optionColors?: { [optionId: number]: SchoolColor };
}

// Ferramenta ativa para pintura na grade
export interface ActiveTool {
  answer: string;
  color: SchoolColor;
}
