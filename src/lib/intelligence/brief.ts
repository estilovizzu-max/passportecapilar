import { formatDataLonga, type Passaporte } from "@/lib/passport-api";
import { construirIntelligence } from "./build";
import type { IntelligenceItem, IntelligenceRecord } from "./types";
import { declaracoesComoItens, type DeclaracaoRow } from "./declarations-api";
import { capitulos, getCapitulo, ordemCapitulos, type Capitulo } from "./capitals";

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

  // Constrói itens da seção DESIRE a partir de:
  // 1) preferências registradas da cliente
  // 2) declarações explícitas feitas pela profissional via DeclaracoesCard
  // 3) conteúdo descritivo dos capítulos do protocolo (diagnóstico, tratamento, selagem, brilho)
  const desejoItems: IntelligenceItem[] = [
    ...r.preferencias,
    ...(declarations ? declaracoesComoItens(declarations) : []),
  ];

  // Itens derivados do conteúdo dos capítulos — natureza INTERPRETAÇÃO, pois
  // representam o que a cliente pode desejar mas ainda não foi registrado como escolha.
  for (const chave of ordemCapitulos) {
    const cap = getCapitulo(chave as Capitulo);
    if (!cap) continue;
    // Só inclui se ainda não existe uma declaração equivalente (evita duplicar se já houver objetivo registrado).
    const jaDeclarado = desejoItems.some(
      (item) =>
        item.valor.toLowerCase().includes(chave) ||
        item.rotulo.toLowerCase().includes(chave),
    );
    if (!jaDeclarado) {
      desejoItems.push({
        id: `capitulo-${chave}`,
        layer: "preference-memory",
        natureza: "interpretation",
        origem: "inference",
        rotulo: `Capítulo do protocolo`,
        valor: `${cap.titulo}: ${cap.descricaoCurta}`,
        confianca: "media",
        ocorridoEm: null,
        evidencias: [
          {
            tipo: "derivado" as const,
            id: chave,
            descricao: `Conteúdo registrado em src/lib/intelligence/capitals.ts — ${cap.titulo}`,
          },
        ],
      });
    }
  }

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

// ─── NEXT DESTINATION ──────────────────────────────────────────────────────────

export type DestinoSectionKey =
  | "possible-destination"
  | "why"
  | "what-to-validate"
  | "professional-decision";

export const destinoSectionLabel: Record<DestinoSectionKey, string> = {
  "possible-destination": "POSSIBLE DESTINATION",
  why: "WHY",
  "what-to-validate": "WHAT TO VALIDATE",
  "professional-decision": "PROFESSIONAL DECISION",
};

export const destinoSectionDescription: Record<DestinoSectionKey, string> = {
  "possible-destination": "Uma direção possível para a jornada, baseada no histórico registrado.",
  why: "Os registros disponíveis indicando esta direção.",
  "what-to-validate": "Informação a confirmar com a cliente antes de qualquer decisão.",
  "professional-decision": "A decisão sobre o próximo capítulo permanece com a profissional.",
};

export type DestinoSection = {
  key: DestinoSectionKey;
  titulo: string;
  descricao: string;
  itens: IntelligenceItem[];
  vazio: string;
};

export type ProximoDestino = {
  clienteNome: string;
  geradoEm: string;
  secoes: DestinoSection[];
  temLeitura: boolean;
};

function item(
  id: string,
  rotulo: string,
  valor: string,
  natureza: "fact" | "interpretation" = "interpretation",
  confianca?: "alta" | "media" | "baixa",
): IntelligenceItem {
  return {
    id,
    layer: "guidance",
    natureza,
    origem: natureza === "fact" ? "record" : "inference",
    rotulo,
    valor,
    ...(natureza === "interpretation" && confianca
      ? { confianca }
      : { confianca: "media" as const }),
    ocorridoEm: null,
    evidencias: [],
  };
}

/** Monta "Próximo Destino" — leitura contextual da jornada registrada. */
export function construirProximoDestino(p: Passaporte, base?: IntelligenceRecord): ProximoDestino {
  const r = base ?? construirIntelligence(p);

  const proximoRegistrado = p.ultimo?.next_procedure ?? null;
  const ultimoCapitulo = p.ultimo?.procedure ?? null;
  const dataUltimo = p.ultimo ? formatDataLonga(p.ultimo.service_date) : null;

  // POSSIBLE DESTINATION
  const destinoItems: IntelligenceItem[] = [];
  if (proximoRegistrado) {
    destinoItems.push(
      item(
        "dest-proximo-registrado",
        "Próximo capítulo registrado",
        proximoRegistrado,
        "fact",
      ),
    );
  } else if (ultimoCapitulo) {
    destinoItems.push(
      item(
        "dest-derived",
        "Pode ser interessante considerar",
        `Continuidade após ${ultimoCapitulo}`,
        "interpretation",
        "media",
      ),
    );
  }

  const temLeitura = destinoItems.length > 0;

  // WHY — evidências do histórico
  const whyItems: IntelligenceItem[] = [];
  if (dataUltimo) {
    whyItems.push(
      item("why-ultimo", "Último registro", `${ultimoCapitulo} em ${dataUltimo}`, "fact"),
    );
  }
  if (r.padroes.length > 0) {
    whyItems.push(
      item(
        "why-padrao",
        "Padrão identificado",
        r.padroes[0]!.valor,
        "interpretation",
        "media",
      ),
    );
  } else if (ultimoCapitulo) {
    whyItems.push(
      item(
        "why-inference",
        "Os registros disponíveis indicam",
        `Sequência lógica após ${ultimoCapitulo}`,
        "interpretation",
        "baixa",
      ),
    );
  }

  // WHAT TO VALIDATE
  const validateItems: IntelligenceItem[] = [];
  if (r.lacunas.length > 0) {
    r.lacunas.forEach((l, idx) => {
      validateItems.push(item(`validate-${idx}`, "Vale validar com a cliente", l, "interpretation", "alta"));
    });
  } else {
    validateItems.push(
      item(
        "validate-generic",
        "Vale validar com a cliente",
        "Confirmar se o objetivo atual continua o mesmo desde o último registro.",
        "interpretation",
        "media",
      ),
    );
  }

  return {
    clienteNome: r.clienteNome,
    geradoEm: r.geradoEm,
    temLeitura,
    secoes: [
      {
        key: "possible-destination",
        titulo: destinoSectionLabel["possible-destination"],
        descricao: destinoSectionDescription["possible-destination"],
        itens: destinoItems,
        vazio: SEM_INFO,
      },
      {
        key: "why",
        titulo: destinoSectionLabel.why,
        descricao: destinoSectionDescription.why,
        itens: whyItems,
        vazio: "Sem evidências registradas suficientes para identificar uma direção.",
      },
      {
        key: "what-to-validate",
        titulo: destinoSectionLabel["what-to-validate"],
        descricao: destinoSectionDescription["what-to-validate"],
        itens: validateItems,
        vazio: "Nada pendente de validação com base no registro atual.",
      },
      {
        key: "professional-decision",
        titulo: destinoSectionLabel["professional-decision"],
        descricao: destinoSectionDescription["professional-decision"],
        itens: [
          item(
            "decision-bridge",
            " bridge",
            "O procedimento final é decidido pela profissional com base na leitura do histórico e na validação com a cliente.",
            "fact",
          ),
        ],
        vazio: SEM_INFO,
      },
    ],
  };
}
