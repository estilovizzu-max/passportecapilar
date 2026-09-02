/**
 * PASSAPORTE INTELLIGENCE™ — camada contextual de leitura.
 *
 * Princípio: o Passaporte guarda o histórico, a Inteligência interpreta o
 * histórico, a profissional decide o próximo capítulo.
 *
 * Regra estrutural: FATOS e INTERPRETAÇÕES nunca se misturam. Toda inferência
 * nasce como `interpretation` e só vira fato depois de confirmação humana
 * explícita (nunca automaticamente).
 */

/** Origem do dado. `record` = registrado no Passaporte; `inference` = derivado. */
export type Origem = "record" | "declared" | "inference";

/** Natureza epistemológica. Fatos e interpretações vivem em trilhas separadas. */
export type Natureza = "fact" | "interpretation";

/** Confiança de uma interpretação (nunca se aplica a fatos). */
export type Confianca = "alta" | "media" | "baixa";

export type IntelligenceLayer =
  | "fact-memory"
  | "preference-memory"
  | "journey-memory"
  | "context"
  | "pattern"
  | "change"
  | "guidance";

export const layerLabel: Record<IntelligenceLayer, string> = {
  "fact-memory": "MEMÓRIA DE FATOS",
  "preference-memory": "MEMÓRIA DE PREFERÊNCIAS",
  "journey-memory": "MEMÓRIA DA JORNADA",
  context: "CONTEXTO",
  pattern: "PADRÃO",
  change: "MUDANÇA",
  guidance: "CONSIDERAÇÕES",
};

export const layerDescription: Record<IntelligenceLayer, string> = {
  "fact-memory": "Informações verificadas e explicitamente registradas no Passaporte.",
  "preference-memory": "Preferências declaradas pela cliente ou registradas pela profissional.",
  "journey-memory": "Histórico cronológico de capítulos, procedimentos, visitas e eventos.",
  context: "Posição atual da cliente dentro da jornada registrada.",
  pattern: "Padrões identificados a partir de múltiplos registros existentes.",
  change: "Diferenças relevantes entre a informação anterior e a atual.",
  guidance: "Considerações possíveis, baseadas apenas na informação disponível.",
};

/** Referência à evidência que originou o item (id de atendimento, reativação, etc.). */
export type Evidencia = {
  tipo: "cliente" | "atendimento" | "reativacao" | "derivado";
  id: string;
  descricao: string;
};

/** Unidade mínima e reutilizável de inteligência. */
export type IntelligenceItem = {
  id: string;
  layer: IntelligenceLayer;
  natureza: Natureza;
  origem: Origem;
  rotulo: string;
  valor: string;
  /** Presente somente quando `natureza === "interpretation"`. */
  confianca?: Confianca;
  /** Indica que o item deve ser exibido como cartão de destaque visual (INSIGHT). */
  highlight?: boolean;
  ocorridoEm?: string | null;
  evidencias: Evidencia[];
};

/** Estrutura completa e reutilizável, consumida por todas as superfícies. */
export type IntelligenceRecord = {
  clienteId: string;
  clienteNome: string;
  geradoEm: string;
  /** Trilha verificada — nunca contém inferências. */
  fatos: IntelligenceItem[];
  preferencias: IntelligenceItem[];
  jornada: IntelligenceItem[];
  /** Trilha interpretativa — nunca é persistida como fato. */
  contexto: IntelligenceItem[];
  padroes: IntelligenceItem[];
  mudancas: IntelligenceItem[];
  consideracoes: IntelligenceItem[];
  /** Lacunas conhecidas. A camada nunca inventa informação ausente. */
  lacunas: string[];
};

/** Superfícies futuras que consomem o mesmo `IntelligenceRecord`. */
export type IntelligenceSurface =
  | "intelligence-brief"
  | "journey-insight"
  | "prepare-appointment"
  | "next-destination"
  | "ask-the-code";

export const surfaceLabel: Record<IntelligenceSurface, string> = {
  "intelligence-brief": "Intelligence Brief",
  "journey-insight": "Journey Insight",
  "prepare-appointment": "Preparar Meu Atendimento",
  "next-destination": "Próximo Destino",
  "ask-the-code": "Perguntar ao Código",
};

export const surfaceDescription: Record<IntelligenceSurface, string> = {
  "intelligence-brief": "Resumo estruturado da cliente antes do atendimento.",
  "journey-insight": "Leitura da evolução da jornada ao longo dos capítulos.",
  "prepare-appointment": "Checklist contextual para o atendimento seguinte.",
  "next-destination": "Sugestão de próximo capítulo para decisão da profissional.",
  "ask-the-code": "Consulta guiada ao histórico autorizado.",
};

/** Quais camadas alimentam cada superfície (contrato de leitura). */
export const surfaceLayers: Record<IntelligenceSurface, IntelligenceLayer[]> = {
  "intelligence-brief": ["fact-memory", "preference-memory", "context", "change"],
  "journey-insight": ["journey-memory", "pattern", "change"],
  "prepare-appointment": ["fact-memory", "preference-memory", "context", "guidance"],
  "next-destination": ["context", "pattern", "guidance"],
  "ask-the-code": ["fact-memory", "preference-memory", "journey-memory"],
};
