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
        <Link href="/" className="text-xl font-bold text-blue-600">
          Pinte por Número
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
            {/* Links de Administração */}
            {profile?.role === "admin" && (
              <div className="flex items-center gap-4 p-2 rounded-md bg-red-50 border border-red-200">
                <Link
                  href="/admin/content"
                  className="text-sm font-bold text-red-600 hover:text-red-800"
                >
                  Conteúdo
                </Link>
                <Link
                  href="/admin/templates"
                  className="text-sm font-bold text-red-600 hover:text-red-800"
                >
                  Templates
                </Link>
                <Link
                  href="/admin/news"
                  className="text-sm font-bold text-red-600 hover:text-red-800"
                >
                  Notícias
                </Link>
                <Link
                  href="/admin/roadmap"
                  className="text-sm font-bold text-red-600 hover:text-red-800"
                >
                  Roadmap
                </Link>
              </div>
            )}
            {/* Links Públicos */}
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
              href="/news"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Notícias
            </Link>{" "}
            <Link
              href="/roadmap"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Roadmap
            </Link>{" "}
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
