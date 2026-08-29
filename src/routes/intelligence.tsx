import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, Ornament } from "@/components/passport/ui";
import { ClienteSelect, SectionCard } from "@/components/intelligence/brief-ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { usePassaportes } from "@/lib/passport-api";
import { construirBrief } from "@/lib/intelligence/brief";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "Intelligence Brief — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Leitura estruturada da jornada registrada da cliente, separando informação registrada de interpretação.",
      },
      { property: "og:title", content: "Intelligence Brief" },
      {
        property: "og:description",
        content: "Leitura estruturada da jornada registrada, sem inventar informação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: IntelligenceBrief,
});

function IntelligenceBrief() {
  useRequireAuth();
  const { data, isLoading } = usePassaportes();
  const [clienteId, setClienteId] = useState("");

  const passaporte = useMemo(() => {
    if (!data?.length) return null;
    return data.find((p) => p.cliente.id === clienteId) ?? data[0]!;
  }, [data, clienteId]);

  const brief = useMemo(() => (passaporte ? construirBrief(passaporte) : null), [passaporte]);

  return (
    <Screen back backTo="/clientes">
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">◈</span>
        <h2 className="font-display text-xl tracking-[0.08em] text-primary">INTELLIGENCE BRIEF</h2>
        <span className="text-gold">◈</span>
      </div>
      <p className="mt-2 text-center text-xs leading-snug text-muted-foreground">
        O Passaporte guarda o histórico. A Inteligência interpreta o histórico. A decisão final é
        sempre da profissional.
      </p>
      <Ornament className="mt-3" />

      {isLoading && <p className="mt-6 text-center text-sm text-muted-foreground">Carregando…</p>}

      {!isLoading && (!data || data.length === 0) && (
        <p className="mt-6 text-center text-sm italic text-muted-foreground">
          Informação insuficiente para uma leitura segura.
        </p>
      )}

      {passaporte && brief && (
        <div className="mt-4 space-y-4">
          <ClienteSelect
            valor={passaporte.cliente.id}
            onChange={setClienteId}
            opcoes={(data ?? []).map((p) => ({ id: p.cliente.id, nome: p.cliente.name }))}
          />

          {brief.secoes.map((s) => (
            <SectionCard
              key={s.key}
              titulo={s.titulo}
              descricao={s.descricao}
              itens={s.itens}
              vazio={s.vazio}
              acoes
            />
          ))}

          <Link
            to="/preparar-atendimento"
            className="flex w-full items-center justify-center rounded-full border border-gold/70 bg-card px-6 py-3.5 font-display text-sm tracking-[0.14em] text-primary"
          >
            PREPARAR MEU ATENDIMENTO
          </Link>

          <p className="pb-2 text-center text-[11px] leading-snug text-muted-foreground">
            Nenhuma ação aqui altera o histórico registrado da cliente.
          </p>
        </div>
      )}
    </Screen>
  );
}
