// src/lib/colors.ts

export interface SchoolColor {
  name: string;
  value: string;
}

// Paleta expandida para 24 cores
export const schoolColorPalette: SchoolColor[] = [
  { name: "Branco", value: "#FFFFFF" },
  { name: "Rosa Claro", value: "#F4C2C2" },
  { name: "Salmão", value: "#FA8072" },
  { name: "Magenta", value: "#FF00FF" },
  { name: "Vermelho", value: "#FF0000" },
  { name: "Vinho", value: "#722F37" },
  { name: "Laranja", value: "#FFA500" },
  { name: "Amarelo", value: "#FFFF00" },
  { name: "Amarelo Limão", value: "#E3FF00" },
  { name: "Verde Claro", value: "#90EE90" },
  { name: "Verde", value: "#008000" },
  { name: "Verde Escuro", value: "#006400" },
  { name: "Ciano", value: "#00FFFF" },
  { name: "Azul Céu", value: "#87CEEB" },
  { name: "Azul", value: "#0000FF" },
  { name: "Azul Marinho", value: "#000080" },
  { name: "Violeta", value: "#8A2BE2" },
  { name: "Roxo", value: "#800080" },
  { name: "Cobre", value: "#B87333" },
  { name: "Castanho", value: "#A52A2A" },
  { name: "Marrom", value: "#704214" },
  { name: "Cinzento", value: "#808080" },
  { name: "Prata", value: "#C0C0C0" },
  { name: "Preto", value: "#000000" },
];