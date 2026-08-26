import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookMarked, Calendar, ChevronRight, Lock } from "lucide-react";
import { Emblema, Ornament, WineButton } from "@/components/passport/ui";

export const Route = createFileRoute("/acesso-cliente")({
  head: () => ({
    meta: [
      { title: "Meu Passaporte Capilar — Acesso da cliente" },
      {
        name: "description",
        content:
          "Digite o código do seu passaporte e acompanhe sua jornada de cuidado capilar, capítulo por capítulo.",
      },
      { property: "og:title", content: "Meu Passaporte Capilar" },
      {
        property: "og:description",
        content: "Acompanhe sua jornada de cuidado: seu histórico, seus capítulos, sua história.",
      },
    ],
  }),
  component: AcessoCliente,
});

function AcessoCliente() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-2xl border border-gold/50 p-4">
        <div className="rounded-xl border border-gold/30 px-4 py-8">
          <div className="flex flex-col items-center">
            <Emblema className="h-14" />
            <h1 className="mt-4 text-center font-display text-3xl leading-tight tracking-[0.03em] text-primary">
              MEU PASSAPORTE
              <br />
              CAPILAR<sup className="text-[0.45em]">TM</sup>
            </h1>
            <Ornament className="mt-3 w-full" />
            <p className="mt-4 font-display text-base text-ink">
              Acompanhe sua jornada de cuidado
            </p>
          </div>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/passaporte" });
            }}
          >
            <div className="rounded-xl border border-gold/60 bg-card px-4 pb-3 pt-2.5">
              <span className="text-[11px] tracking-[0.18em] text-gold">CÓDIGO DO PASSAPORTE</span>
              <div className="mt-1 flex items-center gap-3">
                <BookMarked className="h-5 w-5 text-primary" />
                <input
                  required
                  placeholder="Digite o código do seu passaporte"
                  className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gold/60 bg-card px-4 pb-3 pt-2.5">
              <span className="text-[11px] tracking-[0.18em] text-gold">DATA DE NASCIMENTO</span>
              <div className="mt-1 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gold" />
                <input
                  required
                  placeholder="dd/mm/aaaa"
                  className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="pt-3">
              <WineButton type="submit">
                <Lock className="h-5 w-5" />
                ACESSAR MEU PASSAPORTE
                <ChevronRight className="h-5 w-5" />
              </WineButton>
            </div>
          </form>

          <Ornament className="mt-8" />

          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-2 font-display text-base text-primary"
          >
            <BookMarked className="h-5 w-5" />
            <span className="underline underline-offset-8">Ainda não tenho um passaporte</span>
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Ornament className="mt-8" />
          <p className="mt-6 text-center font-display text-sm italic text-ink">
            Seu histórico, seus capítulos, sua história.
          </p>
        </div>
      </div>
    </div>
  );
}
