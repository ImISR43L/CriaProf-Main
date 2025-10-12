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
    router.push("/");
    router.refresh();
  };

  // Enquanto o 'user' é 'undefined', significa que a autenticação ainda está a ser verificada
  if (user === undefined) {
    return (
      <div className="w-48 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
      >
        Meus Questionários
      </Link>
      <Link
        href="/account"
        className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
        title="Minha Conta"
      >
        Olá, {user.email?.split("@")[0]}
      </Link>
      <button
        onClick={handleSignOut}
        className="py-2 px-3 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Sair
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="py-2 px-4 text-sm bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors min-w-[140px] text-center"
    >
      Login / Cadastrar
    </Link>
  );
}
