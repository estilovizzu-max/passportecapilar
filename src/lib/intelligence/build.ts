import {
  formatDataLonga,
  statusLabel,
  type Passaporte,
  type ServiceRow,
} from "@/lib/passport-api";
import type {
  Confianca,
  Evidencia,
  IntelligenceItem,
  IntelligenceLayer,
  IntelligenceRecord,
} from "./types";

let seq = 0;
const nextId = (layer: IntelligenceLayer) => `${layer}-${++seq}`;

function fato(
  layer: IntelligenceLayer,
  rotulo: string,
  valor: string,
  evidencias: Evidencia[],
  ocorridoEm?: string | null,
): IntelligenceItem {
  return {
    id: nextId(layer),
    layer,
    natureza: "fact",
    origem: layer === "preference-memory" ? "declared" : "record",
    rotulo,
    valor,
    ocorridoEm: ocorridoEm ?? null,
    evidencias,
  };
}

function interpretacao(
  layer: IntelligenceLayer,
  rotulo: string,
  valor: string,
  confianca: Confianca,
  evidencias: Evidencia[],
): IntelligenceItem {
  return {
    id: nextId(layer),
    layer,
    natureza: "interpretation",
    origem: "inference",
    rotulo,
    valor,
    confianca,
    ocorridoEm: null,
    evidencias,
  };
}

const evCliente = (p: Passaporte): Evidencia => ({
  tipo: "cliente",
  id: p.cliente.id,
  descricao: "Cadastro da cliente",
});

const evServico = (s: ServiceRow): Evidencia => ({
  tipo: "atendimento",
  id: s.id,
  descricao: `Atendimento de ${formatDataLonga(s.service_date)}`,
});

/**
 * Deriva o `IntelligenceRecord` a partir do que já está registrado.
 * Não chama IA, não escreve no banco e não preenche informação ausente:
 * o que falta é declarado em `lacunas`.
 */
export function construirIntelligence(p: Passaporte): IntelligenceRecord {
  const c = p.cliente;
  const fatos: IntelligenceItem[] = [];
  const preferencias: IntelligenceItem[] = [];
  const jornada: IntelligenceItem[] = [];
  const contexto: IntelligenceItem[] = [];
  const padroes: IntelligenceItem[] = [];
  const mudancas: IntelligenceItem[] = [];
  const consideracoes: IntelligenceItem[] = [];
  const lacunas: string[] = [];

  // 1. FACT MEMORY
  if (c.hair_type) fatos.push(fato("fact-memory", "Tipo de cabelo", c.hair_type, [evCliente(p)]));
  else lacunas.push("Tipo de cabelo não registrado.");

  if (c.current_procedure)
    fatos.push(fato("fact-memory", "Protocolo atual", c.current_procedure, [evCliente(p)]));

  if (p.ultimo)
    fatos.push(
      fato(
        "fact-memory",
        "Último capítulo realizado",
        `${p.ultimo.procedure} — ${formatDataLonga(p.ultimo.service_date)}`,
        [evServico(p.ultimo)],
        p.ultimo.service_date,
      ),
    );
  else lacunas.push("Nenhum atendimento registrado até agora.");

  fatos.push(
    fato("fact-memory", "Ciclo registrado", `${p.ultimo?.cycle_days ?? c.cycle_days} dias`, [
      evCliente(p),
    ]),
  );

  // 2. PREFERENCE MEMORY
  preferencias.push(
    fato("preference-memory", "Canal de contato preferido", c.channel, [evCliente(p)]),
  );
  if (c.notes) preferencias.push(fato("preference-memory", "Observações", c.notes, [evCliente(p)]));
  else lacunas.push("Nenhuma preferência descrita em observações.");

  // 3. JOURNEY MEMORY
  for (const s of p.atendimentos) {
    jornada.push(
      fato(
        "journey-memory",
        formatDataLonga(s.service_date),
        s.next_procedure ? `${s.procedure} → ${s.next_procedure}` : s.procedure,
        [evServico(s)],
        s.service_date,
      ),
    );
  }
  for (const r of p.reativacoes) {
    jornada.push(
      fato(
        "journey-memory",
        "Reativação",
        `${r.channel} — ${r.outcome}`,
        [{ tipo: "reativacao", id: r.id, descricao: "Registro de reativação" }],
        r.created_at.slice(0, 10),
      ),
    );
  }

  // 4. CONTEXT
  contexto.push(
    fato("context", "Status do ciclo", statusLabel[p.status], [evCliente(p)]),
  );
  if (p.proximoRetorno)
    contexto.push(
      fato("context", "Janela de retorno", formatDataLonga(p.proximoRetorno), [evCliente(p)], p.proximoRetorno),
    );
  contexto.push(
    fato("context", "Capítulos registrados", String(p.atendimentos.length), [evCliente(p)]),
  );
  if (p.diasRestantes != null)
    contexto.push(
      interpretacao(
        "context",
        "Posição na jornada",
        p.diasRestantes < 0
          ? `${Math.abs(p.diasRestantes)} dias além do ciclo registrado.`
          : `Faltam ${p.diasRestantes} dias para a janela registrada.`,
        "alta",
        [evCliente(p)],
      ),
    );

  // 5. PATTERN — apenas com múltiplos registros
  if (p.atendimentos.length >= 2) {
    const datas = p.atendimentos.map((s) => new Date(`${s.service_date}T12:00:00`).getTime());
    const gaps: number[] = [];
    for (let i = 0; i < datas.length - 1; i++)
      gaps.push(Math.round((datas[i]! - datas[i + 1]!) / 86_400_000));
    const medio = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    padroes.push(
      interpretacao(
        "pattern",
        "Intervalo médio entre capítulos",
        `${medio} dias em ${gaps.length} intervalo(s) registrado(s).`,
        gaps.length >= 3 ? "alta" : "media",
        p.atendimentos.map(evServico),
      ),
    );

    const contagem = new Map<string, number>();
    for (const s of p.atendimentos) contagem.set(s.procedure, (contagem.get(s.procedure) ?? 0) + 1);
    const recorrente = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0];
    if (recorrente && recorrente[1] > 1)
      padroes.push(
        interpretacao(
          "pattern",
          "Procedimento mais recorrente",
          `${recorrente[0]} — ${recorrente[1]} registros.`,
          "media",
          p.atendimentos.filter((s) => s.procedure === recorrente[0]).map(evServico),
        ),
      );
  } else {
    lacunas.push("Registros insuficientes para identificar padrões (mínimo de 2 capítulos).");
  }

  // 6. CHANGE — diferença entre o penúltimo e o último registro
  const [ultimo, anterior] = p.atendimentos;
  if (ultimo && anterior) {
    if (ultimo.procedure !== anterior.procedure)
      mudancas.push(
        interpretacao(
          "change",
          "Mudança de procedimento",
          `De "${anterior.procedure}" para "${ultimo.procedure}".`,
          "alta",
          [evServico(anterior), evServico(ultimo)],
        ),
      );
    if (ultimo.cycle_days !== anterior.cycle_days)
      mudancas.push(
        interpretacao(
          "change",
          "Ajuste de ciclo",
          `De ${anterior.cycle_days} para ${ultimo.cycle_days} dias.`,
          "alta",
          [evServico(anterior), evServico(ultimo)],
        ),
      );
  }
  if (p.reativacoes.length > 0)
    mudancas.push(
      interpretacao(
        "change",
        "Contatos de reativação",
        `${p.reativacoes.length} registro(s) desde o início da jornada.`,
        "media",
        p.reativacoes.map((r) => ({
          tipo: "reativacao" as const,
          id: r.id,
          descricao: "Registro de reativação",
        })),
      ),
    );

  // 7. GUIDANCE — considerações, nunca ações automáticas
  if (p.status === "risco")
    consideracoes.push(
      interpretacao(
        "guidance",
        "Ciclo ultrapassado",
        `O ciclo registrado venceu. Considerar retomada com "${p.proximoCapitulo}" — decisão da profissional.`,
        "alta",
        [evCliente(p)],
      ),
    );
  if (p.status === "janela")
    consideracoes.push(
      interpretacao(
        "guidance",
        "Janela ideal aberta",
        `Momento registrado para propor "${p.proximoCapitulo}".`,
        "alta",
        [evCliente(p)],
      ),
    );
  if (!c.phone) lacunas.push("Telefone de contato não registrado.");
  if (consideracoes.length === 0)
    consideracoes.push(
      interpretacao(
        "guidance",
        "Sem consideração relevante",
        "A informação disponível não sustenta nenhuma consideração adicional.",
        "baixa",
        [evCliente(p)],
      ),
    );

  return {
    clienteId: c.id,
    clienteNome: c.name,
    geradoEm: new Date().toISOString(),
    fatos,
    preferencias,
    jornada,
    contexto,
    padroes,
    mudancas,
    consideracoes,
    lacunas,
  };
}

export function itensDaCamada(r: IntelligenceRecord, layer: IntelligenceLayer): IntelligenceItem[] {
  switch (layer) {
    case "fact-memory":
      return r.fatos;
    case "preference-memory":
      return r.preferencias;
    case "journey-memory":
      return r.jornada;
    case "context":
      return r.contexto;
    case "pattern":
      return r.padroes;
    case "change":
      return r.mudancas;
    case "guidance":
      return r.consideracoes;
  }
}
