import { formatDataLonga, type Passaporte } from "@/lib/passport-api";
import { construirIntelligence } from "./build";
import type { IntelligenceItem, IntelligenceRecord } from "./types";
import { declaracoesComoItens, type DeclaracaoRow } from "./declarations-api";

export const SEM_INFO = "Informação insuficiente para uma leitura segura.";

export type BriefSectionKey =
  | "who"
  | "now"
  | "history"
  | "change"
  | "desire"
  | "pattern"
  | "next"
  | "attention";

export const briefSectionLabel: Record<BriefSectionKey, string> = {
  who: "WHO",
  now: "NOW",
  history: "HISTORY",
  change: "CHANGE",
  desire: "DESIRE",
  pattern: "PATTERN",
  next: "NEXT",
  attention: "ATTENTION",
};

export const briefSectionDescription: Record<BriefSectionKey, string> = {
  who: "Descrição a partir do que está registrado na jornada.",
  now: "Estado atual registrado da jornada.",
  history: "Capítulos anteriores relevantes.",
  change: "Diferenças detectadas entre o registro anterior e o atual.",
  desire: "Objetivos e preferências declarados pela cliente.",
  pattern: "Padrões sustentados por múltiplos registros.",
  next: "Considerações possíveis — a decisão é da profissional.",
  attention: "Informação a revisar ou confirmar com a cliente.",
};

export type BriefSection = {
  key: BriefSectionKey;
  titulo: string;
  descricao: string;
  itens: IntelligenceItem[];
  /** Texto exibido quando não há itens registrados suficientes. */
  vazio: string;
};

export type Brief = {
  record: IntelligenceRecord;
  clienteNome: string;
  geradoEm: string;
  secoes: BriefSection[];
  lacunas: string[];
};

const secao = (
  key: BriefSectionKey,
  itens: IntelligenceItem[],
  vazio = SEM_INFO,
): BriefSection => ({
  key,
  titulo: briefSectionLabel[key],
  descricao: briefSectionDescription[key],
  itens,
  vazio,
});

/** Monta o Intelligence Brief a partir apenas do que está registrado. */
export function construirBrief(
  p: Passaporte,
  base?: IntelligenceRecord,
  declarations?: DeclaracaoRow[],
): Brief {
  const r = base ?? construirIntelligence(p);

  const identidade = r.fatos.filter((i) =>
    ["Tipo de cabelo", "Protocolo atual", "Ciclo registrado"].includes(i.rotulo),
  );

  const desejoItems = [
    ...r.preferencias,
    ...(declarations ? declaracoesComoItens(declarations) : []),
  ];

  return {
    record: r,
    clienteNome: r.clienteNome,
    geradoEm: r.geradoEm,
    lacunas: r.lacunas,
    secoes: [
      secao("who", identidade),
      secao("now", r.contexto),
      secao("history", r.jornada.slice(0, 6)),
      secao("change", r.mudancas),
      secao("desire", desejoItems),
      secao("pattern", r.padroes),
      secao("next", r.consideracoes),
      secao(
        "attention",
        r.lacunas.map((l, idx) => ({
          id: `attention-${idx}`,
          layer: "guidance" as const,
          natureza: "interpretation" as const,
          origem: "inference" as const,
          rotulo: "A confirmar",
          valor: l,
          confianca: "alta" as const,
          ocorridoEm: null,
          evidencias: [],
        })),
        "Nada pendente de confirmação com base no registro atual.",
      ),
    ],
  };
}

export type PrepSectionKey =
  | "last-chapter"
  | "relevant-history"
  | "current-goal"
  | "continuity"
  | "points-to-review"
  | "recommended-question";

export const prepSectionLabel: Record<PrepSectionKey, string> = {
  "last-chapter": "LAST CHAPTER",
  "relevant-history": "RELEVANT HISTORY",
  "current-goal": "CURRENT GOAL",
  continuity: "CONTINUITY",
  "points-to-review": "POINTS TO REVIEW",
  "recommended-question": "RECOMMENDED QUESTION",
};

export const prepSectionDescription: Record<PrepSectionKey, string> = {
  "last-chapter": "Informação do capítulo mais recente registrado.",
  "relevant-history": "Registros anteriores úteis para a continuidade.",
  "current-goal": "Último objetivo explicitamente registrado.",
  continuity: "Recorrências sustentadas pela jornada registrada.",
  "points-to-review": "Informação a confirmar com a cliente.",
  "recommended-question": "Uma pergunta contextual para atualizar a jornada.",
};

export type PrepSection = {
  key: PrepSectionKey;
  titulo: string;
  descricao: string;
  itens: IntelligenceItem[];
  vazio: string;
};

export type Preparacao = {
  clienteNome: string;
  geradoEm: string;
  secoes: PrepSection[];
  /** Aviso permanente: briefing profissional, nunca conclusão clínica. */
  aviso: string;
};

const AVISO =
  "Este é um briefing profissional montado a partir do histórico registrado. Não é diagnóstico, prescrição ou definição de procedimento — a decisão permanece com a profissional.";

function texto(
  key: string,
  rotulo: string,
  valor: string,
  natureza: "fact" | "interpretation",
): IntelligenceItem {
  return {
    id: `prep-${key}`,
    layer: "guidance",
    natureza,
    origem: natureza === "fact" ? "record" : "inference",
    rotulo,
    valor,
    ...(natureza === "interpretation" ? { confianca: "media" as const } : {}),
    ocorridoEm: null,
    evidencias: [],
  };
}

/** Monta o briefing "Preparar Meu Atendimento" — apenas leitura do registrado. */
export function construirPreparacao(p: Passaporte, base?: IntelligenceRecord): Preparacao {
  const r = base ?? construirIntelligence(p);
  const objetivo =
    p.ultimo?.next_procedure ?? p.cliente.current_procedure ?? null;

  const pergunta = p.ultimo
    ? `Desde ${formatDataLonga(p.ultimo.service_date)}, mudou alguma coisa na rotina de cuidado que valha registrar no Passaporte?`
    : null;

  return {
    clienteNome: r.clienteNome,
    geradoEm: r.geradoEm,
    aviso: AVISO,
    secoes: [
      {
        key: "last-chapter",
        titulo: prepSectionLabel["last-chapter"],
        descricao: prepSectionDescription["last-chapter"],
        itens: p.ultimo
          ? [
              texto(
                "last",
                formatDataLonga(p.ultimo.service_date),
                p.ultimo.notes
                  ? `${p.ultimo.procedure} — ${p.ultimo.notes}`
                  : p.ultimo.procedure,
                "fact",
              ),
            ]
          : [],
        vazio: SEM_INFO,
      },
      {
        key: "relevant-history",
        titulo: prepSectionLabel["relevant-history"],
        descricao: prepSectionDescription["relevant-history"],
        itens: r.jornada.slice(1, 5),
        vazio: SEM_INFO,
      },
      {
        key: "current-goal",
        titulo: prepSectionLabel["current-goal"],
        descricao: prepSectionDescription["current-goal"],
        itens: objetivo ? [texto("goal", "Objetivo registrado", objetivo, "fact")] : [],
        vazio: SEM_INFO,
      },
      {
        key: "continuity",
        titulo: prepSectionLabel.continuity,
        descricao: prepSectionDescription.continuity,
        itens: r.padroes,
        vazio: SEM_INFO,
      },
      {
        key: "points-to-review",
        titulo: prepSectionLabel["points-to-review"],
        descricao: prepSectionDescription["points-to-review"],
        itens: r.lacunas.map((l, idx) => texto(`gap-${idx}`, "A confirmar", l, "interpretation")),
        vazio: "Nada pendente de confirmação com base no registro atual.",
      },
      {
        key: "recommended-question",
        titulo: prepSectionLabel["recommended-question"],
        descricao: prepSectionDescription["recommended-question"],
        itens: pergunta ? [texto("q", "Pergunta sugerida", pergunta, "interpretation")] : [],
        vazio: SEM_INFO,
      },
    ],
  };
}
