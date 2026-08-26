import { createFileRoute, Navigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Entrando — Passaporte Capilar" },
      { name: "description", content: "Finalizando autenticação no Passaporte Capilar." },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const search = useSearch({ strict: false }) as { next?: string };
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data.session) {
          setError("Sessão não encontrada. Tente novamente.");
        }
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <p className="text-lg text-destructive">{error}</p>
          <a href="/" className="mt-4 inline-block text-primary underline">
            Voltar ao login
          </a>
        </div>
      </div>
    );
  }

  return <Navigate to={search.next ?? "/inicio"} replace />;
}
