"use client";
import React from "react";
import Link from "next/link";
import AuthButton from "./AuthButton";
import { useSupabase } from "./AuthProvider";

const Navbar = () => {
  const { profile } = useSupabase();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-yellow-500">
          Pinte por Número
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
            {/* Links de Administração */}
            {profile?.role === "admin" && (
              <div className="flex items-center gap-4 p-2 rounded-md bg-yellow-50 border border-yellow-200">
                <Link
                  href="/admin/content"
                  className="text-sm font-bold text-yellow-600 hover:text-yellow-800"
                >
                  Conteúdo
                </Link>
                <Link
                  href="/admin/templates"
                  className="text-sm font-bold text-yellow-600 hover:text-yellow-800"
                >
                  Templates
                </Link>
                <Link
                  href="/admin/news"
                  className="text-sm font-bold text-yellow-600 hover:text-yellow-800"
                >
                  Notícias
                </Link>
                <Link
                  href="/admin/roadmap"
                  className="text-sm font-bold text-yellow-600 hover:text-yellow-800"
                >
                  Futuro
                </Link>
              </div>
            )}
            {/* Links Públicos */}
            <Link
              href="/create"
              className="text-sm text-gray-600 hover:text-yellow-600"
            >
              Criar atividade
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-yellow-600"
            >
              Templates
            </Link>
            <Link
              href="/community"
              className="text-sm text-gray-600 hover:text-yellow-600"
            >
              Comunidade
            </Link>
            <Link
              href="/news"
              className="text-sm text-gray-600 hover:text-yellow-600"
            >
              Notícias
            </Link>{" "}
            <Link
              href="/roadmap"
              className="text-sm text-gray-600 hover:text-yellow-600"
            >
              Futuro
            </Link>{" "}
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-yellow-600"
            >
              Sobre
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray-600 hover:text-yellow-600"
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
