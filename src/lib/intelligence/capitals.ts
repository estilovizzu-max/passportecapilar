import type { IntelligenceItem } from "./types";

export type Capitulo =
  | "diagnostico"
  | "tratamento"
  | "selagem"
  | "brilho";

export const ordemCapitulos: Capitulo[] = [
  "diagnostico",
  "tratamento",
  "selagem",
  "brilho",
];

export type CapituloData = {
  id: Capitulo;
  titulo: string;
  descricaoCurta: string;
  descricao: string;
  itens: IntelligenceItem[];
};

export const capitulos: Record<Capitulo, CapituloData> = {
  diagnostico: {
    id: "diagnostico",
    titulo: "Diagnóstico",
    descricaoCurta: "Análise do estado atual dos fios e couro cabeludo.",
    descricao:
      "Etapa inicial de avaliação técnica e visual para identificar condições, necessidades e potenciais do cabelo.",
    itens: [],
  },
  tratamento: {
    id: "tratamento",
    titulo: "Tratamento",
    descricaoCurta: "Aplicação de procedimentos corretivos e nutritivos.",
    descricao:
      "Etapa de aplicação de ativos e protocolos direcionados para reconstrução, hidratação ou botox capilar.",
    itens: [],
  },
  selagem: {
    id: "selagem",
    titulo: "Selagem",
    descricaoCurta: "Fechamento da cutícula e bloqueio de porosidade.",
    descricao:
      "Etapa de selamento das cutículas para bloquear nutrientes e devolver brilho e maciez aos fios.",
    itens: [],
  },
  brilho: {
    id: "brilho",
    titulo: "Brilho",
    descricaoCurta: "Finalização com brilho e definição.",
    descricao:
      "Etapa de finalização que potencializa o brilho, a definição e a redução de frizz.",
    itens: [],
  },
};

export function getCapitulo(chave: Capitulo): CapituloData | undefined {
  return capitulos[chave];
}

export function getCapitulos(): CapituloData[] {
  return ordemCapitulos.map((c) => capitulos[c]);
}
