"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Não precisamos mais de importar o ThemeProviderProps
// Passamos o tipo diretamente na definição do componente

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
