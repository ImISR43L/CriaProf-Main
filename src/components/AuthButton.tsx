"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/AuthProvider";

export default function AuthButton() {
  const { user, supabase } = useSupabase();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return user ? (
    <div className="flex items-center gap-4">
      <Link
        href="/dashboard"
        className="text-sm font-medium text-gray-700 hover:text-blue-600"
      >
        Meus Questionários
      </Link>
      <span className="text-sm text-gray-500">
        Olá, {user.email?.split("@")[0]}
      </span>
      <button
        onClick={handleSignOut}
        className="py-2 px-4 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Sair
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      className="py-2 px-4 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Login / Cadastrar
    </Link>
  );
}
