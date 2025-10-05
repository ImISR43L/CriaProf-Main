// src/components/Navbar.tsx
"use client";
import React from "react";
import Link from "next/link";
import AuthButton from "./AuthButton";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Pinte por Número
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/templates"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Templates
            </Link>
            <Link
              href="/community"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Comunidade
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Sobre
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Contato
            </Link>
          </div>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
