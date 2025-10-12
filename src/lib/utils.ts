/**
 * Calcula se a cor do texto deve ser preta ou branca com base no brilho da cor de fundo.
 * @param hexColor - A cor de fundo em formato hexadecimal (ex: "#FF0000").
 * @returns Retorna "#000000" (preto) para fundos claros e "#FFFFFF" (branco) para fundos escuros.
 */
export const getContrastColor = (hexColor: string): string => {
  // Se a cor for inválida, retorna preto como padrão
  if (!hexColor || hexColor.length < 7) {
    return "#000000";
  }

  // Converte o hexadecimal para os componentes R, G, B
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Fórmula para calcular a luminância (brilho percebido)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Se o brilho for maior que 128 (numa escala de 0 a 255), a cor é considerada clara.
  return luminance > 128 ? "#000000" : "#FFFFFF";
};
