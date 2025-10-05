// src/components/AuthButton.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";

export default function AuthButton() {
  const { user, supabase } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redireciona para a home após o logout
    router.refresh();
  };

  // Se o estado do usuário ainda não foi determinado, não renderiza nada para evitar um "flash"
  if (user === undefined) {
    return null;
  }

  return user ? (
    // -- Visual para usuário LOGADO --
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-gray-600 hover:text-blue-600"
      >
        Meus Questionários
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 hidden sm:inline">
          Olá, {user.email?.split("@")[0]}
        </span>
        <button
          onClick={handleSignOut}
          className="py-2 px-3 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Sair
        </button>
      </div>
    </div>
  ) : (
    // -- Visual para usuário DESLOGADO --
    <Link
      href="/login"
      className="py-2 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Login / Cadastrar
    </Link>
  );
}
