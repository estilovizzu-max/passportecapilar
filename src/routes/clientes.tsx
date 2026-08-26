import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Search, UserRound } from "lucide-react";
import { Ornament, Screen } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { clientes } from "@/lib/passport-data";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Passaporte Capilar" },
      {
        name: "description",
        content: "Lista de clientes ativas com acesso rápido ao passaporte e radar.",
      },
      { property: "og:title", content: "Clientes — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Acesse passaportes e radares de cada cliente ativa.",
      },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  useRequireAuth();
  return (
    <Screen>
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">≈</span>
        <h2 className="font-display text-2xl tracking-[0.12em] text-primary">CLIENTES</h2>
        <span className="text-gold">≈</span>
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-full border border-gold/60 bg-card px-4 py-2.5">
        <Search className="h-5 w-5 text-gold" />
        <input
          placeholder="Buscar cliente..."
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </label>

      <ul className="mt-5 space-y-3">
        {clientes.map((c) => (
          <li key={c.id}>
            <Link
              to="/radar/$clienteId"
              params={{ clienteId: c.id }}
              className="flex items-center gap-3 parchment-card px-3 py-3"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full wine-surface text-primary-foreground">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-display text-lg text-ink">{c.nome}</p>
                <p className="text-sm text-muted-foreground">
                  Capítulo {c.capitulo} de {c.totalCapitulos}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gold" />
            </Link>
          </li>
        ))}
      </ul>

      <Ornament className="mt-6" />
    </Screen>
  );
}
