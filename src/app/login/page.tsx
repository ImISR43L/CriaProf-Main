// src/app/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeSlash } from "@/components/Icons"; // Voltamos a usar o alias @/
import Spinner from "@/components/Spinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuthAction = async () => {
    setMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          setMessage("A senha deve ter pelo menos 6 caracteres.");
          setMessageType("error");
          return;
        }
        if (password !== confirmPassword) {
          setMessage("As senhas não coincidem.");
          setMessageType("error");
          return;
        }

        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(`Erro ao cadastrar: ${error.message}`);
          setMessageType("error");
        } else {
          setMessage(
            "Cadastro realizado! Verifique o seu e-mail para confirmar a conta."
          );
          setMessageType("success");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setMessage(`Erro ao fazer login: ${error.message}`);
          setMessageType("error");
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen -mt-16">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {isSignUp ? "Criar Nova Conta" : "Aceder à Conta"}
        </h1>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="seu@email.com"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-500"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeSlash /> : <Eye />}
            </button>
          </div>
          {isSignUp && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900"
                placeholder="••••••••"
              />
            </div>
          )}
        </div>
        <button
          onClick={handleAuthAction}
          disabled={loading}
          className="w-full h-10 flex items-center justify-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isSignUp ? (
            "Registar"
          ) : (
            "Entrar"
          )}
        </button>
        {message && (
          <p
            className={`text-center text-base ${
              messageType === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
        <p className="text-sm text-center text-gray-600">
          {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="ml-1 font-semibold text-blue-600 hover:underline"
          >
            {isSignUp ? "Faça login" : "Registe-se"}
          </button>
        </p>
      </div>
    </div>
  );
}
