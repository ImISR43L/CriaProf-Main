// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar"; // Importar a Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gerador de Atividades",
  description: "Crie atividades de pinte-por-número personalizadas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <Navbar /> {/* Adicionar a Navbar aqui */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
