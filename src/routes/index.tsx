import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Emblema, Ornament, OutlineButton, WineButton } from "@/components/passport/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Passaporte Capilar — Acesso do profissional" },
      {
        name: "description",
        content:
          "Entre no Passaporte Capilar e acompanhe protocolos, capítulos e retornos de cada cliente.",
      },
      { property: "og:title", content: "Passaporte Capilar — Acesso" },
      {
        property: "og:description",
        content: "Seu protocolo começa aqui. Gerencie a jornada capilar das suas clientes.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/inicio" });
  }

  async function signInWithGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/auth/callback",
    });
    if (result.error) {
      toast.error(result.error.message);
    }
  }

  async function signInWithApple() {
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin + "/auth/callback",
    });
    if (result.error) {
      toast.error(result.error.message);
    }
  }


  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-2xl border border-gold/50 p-4">
        <div className="rounded-xl border border-gold/30 px-4 py-8">
          <div className="flex flex-col items-center">
            <Emblema className="h-16" />
            <h1 className="mt-4 text-center font-display text-3xl tracking-[0.05em] gold-text">
              PASSAPORTE CAPILAR<sup className="text-[0.45em]">TM</sup>
            </h1>
            <Ornament className="mt-3 w-full" />
            <p className="mt-4 font-display text-base text-ink">Seu protocolo começa aqui</p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="flex items-center gap-3 rounded-xl border border-gold/60 bg-card px-4 py-3.5">
              <Mail className="h-5 w-5 text-gold" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-gold/60 bg-card px-4 py-3.5">
              <Lock className="h-5 w-5 text-gold" />
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                aria-label="Mostrar senha"
                onClick={() => setShow((v) => !v)}
                className="text-gold"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </label>

            <div className="pt-2">
              <WineButton type="submit">{loading ? "ENTRANDO..." : "ENTRAR"}</WineButton>
            </div>
          </form>

          <p className="mt-5 text-center font-display text-sm text-primary underline underline-offset-8">
            Esqueci minha senha
          </p>

          <div className="mt-8">
            <OutlineButton onClick={signInWithGoogle}>
              <UserRound className="h-5 w-5 text-primary" />
              Entrar com Google
            </OutlineButton>
          </div>

          <div className="mt-3">
            <OutlineButton onClick={signInWithApple}>
              <Apple className="h-5 w-5 text-primary" />
              Entrar com Apple
            </OutlineButton>
          </div>


          <div className="mt-3">
            <OutlineButton to="/acesso-cliente">
              <UserRound className="h-5 w-5 text-primary" />
              Acessar como cliente
            </OutlineButton>
          </div>

          <Ornament className="mt-8" />
        </div>
      </div>
    </div>
  );
}
