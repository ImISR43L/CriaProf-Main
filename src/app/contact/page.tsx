"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/components/AuthProvider";
import Spinner from "@/components/Spinner";
import Link from "next/link";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { profile } = useSupabase();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const { data } = await supabase.from("site_content").select("*");
      if (data) {
        setEmail(
          data.find((c) => c.page_key === "contact_email")?.content_value || ""
        );
        setLinkedin(
          data.find((c) => c.page_key === "contact_linkedin")?.content_value ||
            ""
        );
      }
      setLoading(false);
    };
    fetchContent();
  }, [supabase]);

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-gray-900">Contato</h1>
        {profile?.role === "admin" && (
          <Link
            href="/admin/content"
            className="text-sm text-blue-600 hover:underline"
          >
            Editar Página
          </Link>
        )}
      </div>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Tem alguma dúvida, sugestão ou encontrou algum problema? Adoraria ouvir
        de você!
      </p>
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <p className="text-gray-800">
          Você pode me encontrar nas redes sociais ou me enviar um e-mail
          diretamente.
        </p>
        {loading ? (
          <Spinner />
        ) : (
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>
              <strong>Email:</strong> {email}
            </li>
            <li>
              <strong>LinkedIn:</strong> {linkedin}
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
