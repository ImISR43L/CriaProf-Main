"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeSlash } from "@/components/Icons";

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
            "Cadastro realizado! Verifique o seu e-mail para confirmar a conta.",
          );
          setMessageType("success");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setMessage("E-mail ou senha inválidos.");
          setMessageType("error");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setMessage("Ocorreu um erro inesperado.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO: Esqueci a Senha
  const handleResetPassword = async () => {
    if (!email) {
      setMessage(
        "Por favor, digite seu e-mail no campo acima para recuperar a senha.",
      );
      setMessageType("error");
      return;
    }

    // NOVA VALIDAÇÃO: Checa se o e-mail tem um formato válido (contém @ e .)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage(
        "Por favor, digite um endereço de e-mail válido (ex: nome@email.com).",
      );
      setMessageType("error");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage(`Erro: ${error.message}`);
      setMessageType("error");
    } else {
      setMessage("Instruções de recuperação enviadas para o seu e-mail!");
      setMessageType("success");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? "Crie sua conta" : "Acesse sua conta"}
          </h2>
        </div>
        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-white text-gray-900"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block">
              Senha
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md pr-10 bg-white text-gray-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlash /> : <Eye />}
              </button>
            </div>
            {/* NOVO BOTÃO: Link de esqueci a senha aparece apenas no modo Entrar */}
            {!isSignUp && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-xs text-yellow-600 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}
          </div>
          {isSignUp && (
            <div>
              <label className="text-sm font-medium text-gray-700 block">
                Confirmar Senha
              </label>
              <input
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
          className="w-full h-10 flex items-center justify-center py-2 px-4 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition-colors disabled:bg-yellow-300 disabled:cursor-not-allowed mt-6"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : isSignUp ? (
            "Registrar"
          ) : (
            "Entrar"
          )}
        </button>
        {message && (
          <p
            className={`text-center text-base mt-4 ${
              messageType === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
        <p className="text-sm text-center text-gray-600 mt-4">
          {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="ml-1 font-semibold text-yellow-600 hover:underline"
          >
            {isSignUp ? "Faça login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}
