/**
 * DATA VERSION — identidade determinística da janela de dados usada em uma leitura.
 *
 * Regra: o hash depende apenas do que está registrado (cliente + atendimentos).
 * `geradoEm` acompanha a leitura, mas NUNCA entra no hash — a mesma janela de
 * dados sempre produz o mesmo hash, em qualquer momento.
 */
import type { Passaporte } from "@/lib/passport-api";
import type { Brief } from "./brief";

export type DataVersionItem = {
  secao: string;
  id: string;
  rotulo: string;
  valor: string;
  natureza: "fact" | "interpretation";
};

export type DataVersion = {
  /** Hash determinístico da janela de dados registrada. */
  hash: string;
  clienteId: string;
  clienteNome: string;
  /** Quantidade de atendimentos registrados considerados. */
  atendimentos: number;
  /** Data do último atendimento registrado. */
  ultimoServico: string | null;
  /** `updated_at` do cadastro da cliente. */
  clienteAtualizadoEm: string | null;
  /** Momento da leitura — fora do hash. */
  geradoEm: string;
  /** Snapshot dos itens exibidos, para comparação entre versões. */
  itens: DataVersionItem[];
};

/** FNV-1a de 32 bits em hexadecimal — estável e sem dependências. */
export function hashEstavel(entrada: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < entrada.length; i++) {
    h ^= entrada.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/** Assinatura canônica da janela de dados (independente de ordem de leitura). */
export function assinaturaDados(p: Passaporte): string {
  const c = p.cliente;
  const cliente = [
    c.id,
    c.name,
    c.hair_type ?? "",
    c.current_procedure ?? "",
    c.cycle_days,
    c.last_service_date ?? "",
    c.notes ?? "",
    (c as { updated_at?: string | null }).updated_at ?? "",
  ].join("|");

  const atendimentos = [...p.atendimentos]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) =>
      [
        s.id,
        s.service_date,
        s.procedure,
        s.notes ?? "",
        s.next_procedure ?? "",
        s.cycle_days,
      ].join("~"),
    )
    .join(";");

  return `c:${cliente}#s:${atendimentos}`;
}

/** Calcula a data_version de uma leitura. `geradoEm` não afeta o hash. */
export function computarDataVersion(
  p: Passaporte,
  brief?: Brief,
  geradoEm: string = new Date().toISOString(),
): DataVersion {
  const itens: DataVersionItem[] = brief
    ? brief.secoes.flatMap((s) =>
        s.itens.map((i) => ({
          secao: s.titulo,
          id: `${s.key}:${i.rotulo}`,
          rotulo: i.rotulo,
          valor: i.valor,
          natureza: i.natureza,
        })),
      )
    : [];

  return {
    hash: hashEstavel(assinaturaDados(p)),
    clienteId: p.cliente.id,
    clienteNome: p.cliente.name,
    atendimentos: p.atendimentos.length,
    ultimoServico: p.ultimo?.service_date ?? p.cliente.last_service_date ?? null,
    clienteAtualizadoEm: (p.cliente as { updated_at?: string | null }).updated_at ?? null,
    geradoEm,
    itens,
  };
}

export type DiffTipo = "adicionado" | "removido" | "alterado" | "igual";

export type DiffLinha = {
  tipo: DiffTipo;
  secao: string;
  rotulo: string;
  anterior: string | null;
  atual: string | null;
};

/** Compara duas data_version do mesmo briefing item a item. */
export function compararDataVersion(a: DataVersion, b: DataVersion): DiffLinha[] {
  const mapA = new Map(a.itens.map((i) => [i.id, i]));
  const mapB = new Map(b.itens.map((i) => [i.id, i]));
  const ids = [...new Set([...mapA.keys(), ...mapB.keys()])];

  return ids.map((id) => {
    const ia = mapA.get(id);
    const ib = mapB.get(id);
    const base = ib ?? ia!;
    const tipo: DiffTipo = !ia
      ? "adicionado"
      : !ib
        ? "removido"
        : ia.valor === ib.valor
          ? "igual"
          : "alterado";
    return {
      tipo,
      secao: base.secao,
      rotulo: base.rotulo,
      anterior: ia?.valor ?? null,
      atual: ib?.valor ?? null,
    };
  });
}

export function resumoDataVersion(v: DataVersion): string {
  const partes = [
    `${v.atendimentos} atendimento${v.atendimentos === 1 ? "" : "s"}`,
    `último serviço ${v.ultimoServico ?? "—"}`,
    `cadastro ${v.clienteAtualizadoEm ? v.clienteAtualizadoEm.slice(0, 10) : "—"}`,
  ];
  return partes.join(" · ");
}
