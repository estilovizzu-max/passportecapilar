import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Ornament, Screen } from "@/components/passport/ui";
import { ClienteSelect, InsightCard, SectionCard } from "@/components/intelligence/brief-ui";
import { usePassaportes } from "@/lib/passport-api";
import { construirIntelligence } from "@/lib/intelligence/build";
import type { IntelligenceItem } from "@/lib/intelligence/types";

type InsightSectionKey =
  | "what-happened"
  | "what-changed"
  | "pattern"
  | "context"
  | "what-to-review";

const sectionLabel: Record<InsightSectionKey, string> = {
  "what-happened": "WHAT HAPPENED",
  "what-changed": "WHAT CHANGED",
  pattern: "PATTERN",
  context: "CONTEXT",
  "what-to-review": "WHAT TO REVIEW",
};

const sectionDescription: Record<InsightSectionKey, string> = {
  "what-happened": "Eventos relevantes registrados no historico.",
  "what-changed": "Diferencas significativas entre registros anteriores e atuais.",
  pattern: "Padroes sustentados por multiplos registros.",
  context: "Posicao atual da cliente na jornada registrada.",
  "what-to-review": "Informacao a confirmar antes de tomar uma decisao.",
};

function buildJourneyInsight(p: ReturnType<typeof usePassaportes>["data"][number] | undefined) {
  if (!p) return null;
  const r = construirIntelligence(p);

  const whatHappened: IntelligenceItem[] = r.jornada.slice(0, 6).map((i) => ({ ...i, highlight: false }));
  const whatChanged: IntelligenceItem[] = r.mudancas.map((i) => ({ ...i, highlight: false }));
  const patternItems: IntelligenceItem[] = r.padroes.map((i) => ({ ...i, highlight: true }));
  const contextItems: IntelligenceItem[] = r.contexto.map((i) => ({ ...i, highlight: false }));
  const whatToReview: IntelligenceItem[] = r.lacunas.map((l, idx) => ({
    id: `review-${idx}`,
    layer: "guidance" as const,
    natureza: "interpretation" as const,
    origem: "inference" as const,
    rotulo: "A confirmar",
    valor: l,
    confianca: "alta" as const,
    highlight: false,
    ocorridoEm: null,
    evidencias: [],
  }));

  return {
    clienteId: p.cliente.id,
    clienteNome: r.clienteNome,
    geradoEm: r.geradoEm,
    sections: [
      { key: "what-happened", label: sectionLabel["what-happened"], description: sectionDescription["what-happened"], items: whatHappened, empty: "Nenhum evento registrado encontrado." },
      { key: "what-changed", label: sectionLabel["what-changed"], description: sectionDescription["what-changed"], items: whatChanged, empty: "Nenhuma mudanca significativa detectada entre os registros." },
      { key: "pattern", label: sectionLabel.pattern, description: sectionDescription.pattern, items: patternItems, empty: "Padrao insuficiente para leitura segura." },
      { key: "context", label: sectionLabel.context, description: sectionDescription.context, items: contextItems, empty: "Informacao insuficiente para definir o contexto atual." },
      { key: "what-to-review", label: sectionLabel["what-to-review"], description: sectionDescription["what-to-review"], items: whatToReview, empty: "Nada pendente de confirmacao com base no registro atual." },
    ],
  };
}

export const Route = createFileRoute("/journey-insight")({
  head: () => ({
    meta: [
      { title: "Journey Insight — Passaporte Capilar" },
      { name: "description", content: "Leitura da evolucao da jornada ao longo dos capitulos registrados. Observacao profissional, nao conclusao clinica." },
      { property: "og:title", content: "Journey Insight — Passaporte Capilar" },
    ],
  }),
  component: JourneyInsightPage,
});

function JourneyInsightPage() {
  const { data: passaportes, isLoading } = usePassaportes();
  const primeira = passaportes?.[0]?.cliente.id ?? "";
  const [clienteId, setClienteId] = useState(primeira);

  useEffect(() => {
    if (primeira) setClienteId(primeira);
  }, [primeira]);

  const cliente = passaportes?.find((p) => p.cliente.id === clienteId);
  const insight = cliente ? buildJourneyInsight(cliente) : null;

  return (
    <Screen back backTo="/inicio">
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">*</span>
        <h2 className="font-display text-2xl tracking-[0.08em] text-primary">JOURNEY INSIGHT</h2>
        <span className="text-gold">*</span>
      </div>
      <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
        Leitura da evolucao da jornada a partir dos registros existentes.
        <br />
        Observacao profissional — nao conclusao clinica.
      </p>
      <Ornament className="my-4" />

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Carregando...</p>
      ) : passaportes && passaportes.length > 0 ? (
        <>
          <ClienteSelect
            valor={clienteId}
            opcoes={passaportes.map((p) => ({ id: p.cliente.id, nome: p.cliente.name }))}
            onChange={(id) => setClienteId(id)}
          />
          {insight ? (
            <div className="mt-4 space-y-3">
              {insight.sections.map((section) => (
                <SectionCard
                  key={section.key}
                  titulo={section.label}
                  descricao={section.description}
                  itens={section.items}
                  vazio={section.empty}
                  acoes={true}
                  sectionKey={section.key}
                  onAcao={(item, acao, ctx) => {
                    console.log("[Journey Insight] acao:", acao, "item:", item.id, "ctx:", ctx);
                  }}
                />
              ))}
              <div className="mt-4 rounded-xl border border-gold/40 bg-gold/5 p-4">
                <p className="text-center font-display text-[11px] tracking-[0.14em] text-gold">PASSAPORTE INTELLIGENCE</p>
                <p className="mt-1 text-center text-[10px] leading-snug text-muted-foreground">
                  O Passaporte guarda o historico. A Inteligencia interpreta.<br />A profissional decide o proximo capitulo.
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm italic text-muted-foreground">Selecione uma cliente para iniciar a leitura.</p>
          )}
        </>
      ) : (
        <p className="mt-6 text-center text-sm italic text-muted-foreground">Nenhuma cliente encontrada. Registre uma cliente para usar o Journey Insight.</p>
      )}
    </Screen>
  );
}
