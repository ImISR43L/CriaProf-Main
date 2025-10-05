// src/app/contact/page.tsx
import React from "react";

export default function ContactPage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
        Contato
      </h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
        Tem alguma dúvida, sugestão ou encontrou algum problema? Adoraria ouvir
        de você!
      </p>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <p className="text-gray-800 dark:text-gray-200">
          Você pode me encontrar nas redes sociais ou me enviar um e-mail
          diretamente.
        </p>
        <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
          <li>
            <strong>Email:</strong> seu-email@exemplo.com
          </li>
          <li>
            <strong>LinkedIn:</strong> linkedin.com/in/seu-perfil
          </li>
        </ul>
      </div>
    </div>
  );
}
