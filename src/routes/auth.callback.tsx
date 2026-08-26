import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Entrando — Passaporte Capilar" },
      { name: "description", content: "Finalizando autenticação no Passaporte Capilar." },
      { property: "og:title", content: "Entrando — Passaporte Capilar" },
      { property: "og:description", content: "Finalizando sua autenticação com segurança." },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const search = useSearch({ strict: false }) as { next?: string };
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = false;
    const destino = search.next ?? "/inicio";

    const finish = (user: { id: string; app_metadata?: { provider?: string } }) => {
      if (done) return;
      done = true;
      void trackEvent("login", { provider: user.app_metadata?.provider ?? "unknown" });
      navigate({ to: destino, replace: true });
    };

    // O provedor (Apple/Google) pode entregar a sessão logo após o retorno,
    // então ouvimos a mudança de estado além de checar a sessão atual.
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) finish(session.user);
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session?.user) finish(data.session.user);
    });

    const timeout = setTimeout(() => {
      if (!done) setError("Não foi possível concluir o login. Tente novamente.");
    }, 8000);

    return () => {
      listener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate, search.next]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 text-center">
      {error ? (
        <div>
          <p className="text-lg text-destructive">{error}</p>
          <a href="/" className="mt-4 inline-block text-primary underline">
            Voltar ao login
          </a>
        </div>
      ) : (
        <p className="font-display text-lg text-primary">Concluindo seu acesso...</p>
      )}
    </div>
  );
}
