import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, Ornament } from "@/components/passport/ui";
import { ClienteSelect, SectionCard } from "@/components/intelligence/brief-ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { usePassaportes } from "@/lib/passport-api";
import { construirPreparacao } from "@/lib/intelligence/brief";

export const Route = createFileRoute("/preparar-atendimento")({
  head: () => ({
    meta: [
      { title: "Preparar Meu Atendimento — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Briefing curto antes do atendimento: último capítulo, histórico relevante, objetivo registrado e pontos a confirmar.",
      },
      { property: "og:title", content: "Preparar Meu Atendimento" },
      {
        property: "og:description",
        content: "Briefing profissional montado a partir do histórico registrado da cliente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrepararAtendimento,
});

function PrepararAtendimento() {
  useRequireAuth();
  const { data, isLoading } = usePassaportes();
  const [clienteId, setClienteId] = useState("");

  const passaporte = useMemo(() => {
    if (!data?.length) return null;
    return data.find((p) => p.cliente.id === clienteId) ?? data[0]!;
  }, [data, clienteId]);

  const prep = useMemo(
    () => (passaporte ? construirPreparacao(passaporte) : null),
    [passaporte],
  );

  return (
    <Screen back backTo="/intelligence">
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">◈</span>
        <h2 className="font-display text-xl tracking-[0.08em] text-primary">
          PREPARAR MEU ATENDIMENTO
        </h2>
        <span className="text-gold">◈</span>
      </div>
      <Ornament className="mt-3" />

      {isLoading && <p className="mt-6 text-center text-sm text-muted-foreground">Carregando…</p>}

      {!isLoading && (!data || data.length === 0) && (
        <p className="mt-6 text-center text-sm italic text-muted-foreground">
          Informação insuficiente para uma leitura segura.
        </p>
      )}

      {passaporte && prep && (
        <div className="mt-4 space-y-4">
          <ClienteSelect
            valor={passaporte.cliente.id}
            onChange={setClienteId}
            opcoes={(data ?? []).map((p) => ({ id: p.cliente.id, nome: p.cliente.name }))}
          />

          {prep.secoes.map((s) => (
            <SectionCard
              key={s.key}
              titulo={s.titulo}
              descricao={s.descricao}
              itens={s.itens}
              vazio={s.vazio}
            />
          ))}

          <p className="parchment-card p-3 text-[11px] leading-snug text-muted-foreground">
            {prep.aviso}
          </p>

          <Link
            to="/intelligence"
            className="flex w-full items-center justify-center rounded-full border border-gold/70 bg-card px-6 py-3.5 font-display text-sm tracking-[0.14em] text-primary"
          >
            VER INTELLIGENCE BRIEF
          </Link>
        </div>
      )}
    </Screen>
  );
}
