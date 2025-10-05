// src/components/Navbar.tsx
"use client";
import React from "react";
import Link from "next/link";
import AuthButton from "./AuthButton";
import ThemeToggleButton from "./ThemeToggleButton"; // Importe o novo botão

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-blue-600 dark:text-blue-400"
        >
          Pinte por Número
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/templates"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Templates
            </Link>
            <Link
              href="/community"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Comunidade
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Sobre
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Contato
            </Link>
          </div>
          <AuthButton />
          <ThemeToggleButton /> {/* Adicione o botão de tema aqui */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
