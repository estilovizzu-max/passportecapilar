import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Screen, Ornament } from "@/components/passport/ui";
import { ClienteSelect, DataVersionCard, SectionCard } from "@/components/intelligence/brief-ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { usePassaportes } from "@/lib/passport-api";
import { construirBrief } from "@/lib/intelligence/brief";
import { computarDataVersion } from "@/lib/intelligence/data-version";
import { useRegistrarReview } from "@/lib/intelligence/reviews-api";

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
  const registrar = useRegistrarReview();

  const passaporte = useMemo(() => {
    if (!data?.length) return null;
    return data.find((p) => p.cliente.id === clienteId) ?? data[0]!;
  }, [data, clienteId]);

  const brief = useMemo(() => (passaporte ? construirBrief(passaporte) : null), [passaporte]);

  const versao = useMemo(
    () => (passaporte && brief ? computarDataVersion(passaporte, brief, brief.geradoEm) : null),
    [passaporte, brief],
  );

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

      {passaporte && brief && versao && (
        <div className="mt-4 space-y-4">
          <ClienteSelect
            valor={passaporte.cliente.id}
            onChange={setClienteId}
            opcoes={(data ?? []).map((p) => ({ id: p.cliente.id, nome: p.cliente.name }))}
          />

          <DataVersionCard versao={versao} />

          {brief.secoes.map((s) => (
            <SectionCard
              key={s.key}
              titulo={s.titulo}
              descricao={s.descricao}
              itens={s.itens}
              vazio={s.vazio}
              acoes
              sectionKey={s.key}
              onAcao={(item, acao, ctx) => {
                registrar.mutate(
                  {
                    clientId: passaporte.cliente.id,
                    surface: "intelligence-brief",
                    sectionKey: ctx.sectionKey,
                    itemId: item.id,
                    itemLabel: item.rotulo,
                    itemValue: item.valor,
                    itemNatureza: item.natureza,
                    action: acao,
                    note: ctx.nota ?? null,
                    dataVersion: versao,
                  },
                  {
                    onSuccess: () => toast.success("Registrado na trilha de auditoria."),
                    onError: (e) => toast.error((e as Error).message),
                  },
                );
              }}
            />
          ))}

          <Link
            to="/preparar-atendimento"
            className="flex w-full items-center justify-center rounded-full border border-gold/70 bg-card px-6 py-3.5 font-display text-sm tracking-[0.14em] text-primary"
          >
            PREPARAR MEU ATENDIMENTO
          </Link>

          <Link
            to="/auditoria"
            className="flex w-full items-center justify-center rounded-full border border-gold/40 bg-card px-6 py-3.5 font-display text-sm tracking-[0.14em] text-muted-foreground"
          >
            TRILHA DE AUDITORIA
          </Link>

          <p className="pb-2 text-center text-[11px] leading-snug text-muted-foreground">
            Nenhuma ação aqui altera o histórico registrado da cliente.
          </p>
        </div>
      )}
    </Screen>
  );
}
