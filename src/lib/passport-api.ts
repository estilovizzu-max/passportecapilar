import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

export type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  channel: string;
  cycle_days: number;
  current_procedure: string | null;
  hair_type: string | null;
  notes: string | null;
  last_service_date: string | null;
  professional_id: string | null;
  chapter: string | null;
  progress: number;
  created_at: string;
  updated_at?: string | null;
};


export type ServiceRow = {
  id: string;
  client_id: string;
  service_date: string;
  procedure: string;
  notes: string | null;
  before_url: string | null;
  after_url: string | null;
  next_procedure: string | null;
  cycle_days: number;
  created_at: string;
};

export type ReactivationRow = {
  id: string;
  client_id: string;
  channel: string;
  message: string | null;
  outcome: string;
  created_at: string;
};

export type Status = "risco" | "janela" | "acompanhamento" | "sem-historico";

export type Passaporte = {
  cliente: ClientRow;
  ultimo: ServiceRow | null;
  atendimentos: ServiceRow[];
  reativacoes: ReactivationRow[];
  proximoRetorno: string | null;
  diasRestantes: number | null;
  status: Status;
  proximoCapitulo: string;
};

const DIA = 86_400_000;

export const hoje = () => new Date(new Date().toDateString());

export function formatData(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(`${iso}T12:00:00`);
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "")
    .toUpperCase();
}

export function formatDataLonga(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const statusLabel: Record<Status, string> = {
  risco: "EM RISCO",
  janela: "JANELA IDEAL",
  acompanhamento: "EM ACOMPANHAMENTO",
  "sem-historico": "SEM HISTÓRICO",
};

export function montarPassaporte(
  cliente: ClientRow,
  atendimentos: ServiceRow[],
  reativacoes: ReactivationRow[],
): Passaporte {
  const ordenados = [...atendimentos].sort((a, b) => b.service_date.localeCompare(a.service_date));
  const ultimo = ordenados[0] ?? null;
  const base = ultimo?.service_date ?? cliente.last_service_date ?? null;
  const ciclo = ultimo?.cycle_days ?? cliente.cycle_days ?? 42;

  let proximoRetorno: string | null = null;
  let diasRestantes: number | null = null;
  let status: Status = "sem-historico";

  if (base) {
    const retorno = new Date(`${base}T12:00:00`);
    retorno.setDate(retorno.getDate() + ciclo);
    proximoRetorno = toISODate(retorno);
    diasRestantes = Math.round((retorno.getTime() - hoje().getTime()) / DIA);
    status = diasRestantes < 0 ? "risco" : diasRestantes <= 7 ? "janela" : "acompanhamento";
  }

  return {
    cliente,
    ultimo,
    atendimentos: ordenados,
    reativacoes,
    proximoRetorno,
    diasRestantes,
    status,
    proximoCapitulo:
      ultimo?.next_procedure ?? cliente.current_procedure ?? ultimo?.procedure ?? "Definir cuidado",
  };
}

async function fetchPassaportes(): Promise<Passaporte[]> {
  const [{ data: clients, error: e1 }, { data: services, error: e2 }, { data: reacts, error: e3 }] =
    await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("services").select("*").order("service_date", { ascending: false }),
      supabase.from("reactivations").select("*").order("created_at", { ascending: false }),
    ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;

  return (clients ?? []).map((c) =>
    montarPassaporte(
      c as ClientRow,
      ((services ?? []) as ServiceRow[]).filter((s) => s.client_id === c.id),
      ((reacts ?? []) as ReactivationRow[]).filter((r) => r.client_id === c.id),
    ),
  );
}

export function usePassaportes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["passaportes", user?.id],
    enabled: !!user,
    queryFn: fetchPassaportes,
  });
}

export function usePassaporte(clienteId: string | undefined) {
  const q = usePassaportes();
  return {
    ...q,
    data: clienteId ? q.data?.find((p) => p.cliente.id === clienteId) : q.data?.[0],
  };
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["passaportes"] });
}

export function useCriarCliente() {
  const { user } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      phone?: string;
      channel?: string;
      cycle_days?: number;
      current_procedure?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: input.name,
          phone: input.phone ?? null,
          channel: input.channel ?? "whatsapp",
          cycle_days: input.cycle_days ?? 42,
          current_procedure: input.current_procedure ?? null,
          notes: input.notes ?? null,
          professional_id: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as ClientRow;
    },
    onSuccess: invalidate,
  });
}

export function useAtualizarCliente() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<ClientRow> & { id: string }) => {
      const { error } = await supabase.from("clients").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useRemoverCliente() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useRegistrarAtendimento() {
  const { user } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      client_id: string;
      service_date: string;
      procedure: string;
      notes?: string;
      next_procedure?: string;
      cycle_days: number;
      before?: File | null;
      after?: File | null;
    }) => {
      const upload = async (file: File | null | undefined, tipo: string) => {
        if (!file) return null;
        const path = `${user!.id}/atendimentos/${crypto.randomUUID()}-${tipo}`;
        const { error } = await supabase.storage.from("avatars").upload(path, file, {
          upsert: true,
        });
        if (error) throw error;
        return path;
      };

      const before_url = await upload(input.before, "antes");
      const after_url = await upload(input.after, "depois");

      const { error } = await supabase.from("services").insert({
        client_id: input.client_id,
        professional_id: user!.id,
        service_date: input.service_date,
        procedure: input.procedure,
        notes: input.notes ?? null,
        next_procedure: input.next_procedure ?? null,
        cycle_days: input.cycle_days,
        before_url,
        after_url,
      });
      if (error) throw error;

      const { error: e2 } = await supabase
        .from("clients")
        .update({
          last_service_date: input.service_date,
          cycle_days: input.cycle_days,
          current_procedure: input.next_procedure ?? input.procedure,
        })
        .eq("id", input.client_id);
      if (e2) throw e2;
    },
    onSuccess: invalidate,
  });
}

export function useRegistrarReativacao() {
  const { user } = useAuth();
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async (input: {
      client_id: string;
      channel: string;
      message?: string;
      outcome?: string;
    }) => {
      const { error } = await supabase.from("reactivations").insert({
        client_id: input.client_id,
        professional_id: user!.id,
        channel: input.channel,
        message: input.message ?? null,
        outcome: input.outcome ?? "contacted",
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useAtualizarReativacao() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: async ({ id, outcome }: { id: string; outcome: string }) => {
      const { error } = await supabase.from("reactivations").update({ outcome }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function mensagemSugerida(p: Passaporte, profissional: string) {
  const nome = p.cliente.name.split(" ")[0];
  const quando = p.proximoRetorno ? formatDataLonga(p.proximoRetorno) : "esta semana";
  if (p.status === "risco") {
    return `Oi, ${nome}! Aqui é ${profissional}. Notei que já passou o tempo ideal do seu ciclo de ${p.ultimo?.procedure ?? "cuidado"}. Que tal retomarmos com ${p.proximoCapitulo}? Tenho horários essa semana.`;
  }
  return `Oi, ${nome}! Aqui é ${profissional}. Seu próximo capítulo (${p.proximoCapitulo}) está liberado por volta de ${quando}. Quer que eu reserve um horário?`;
}

export function linkWhatsapp(telefone: string | null, mensagem: string) {
  const num = (telefone ?? "").replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(mensagem)}`;
}

export type Metricas = {
  emRisco: number;
  janela: number;
  acompanhamento: number;
  totalClientes: number;
  contatos: number;
  agendadas: number;
  retornaram: number;
  returnRate: number;
};

export function calcularMetricas(lista: Passaporte[]): Metricas {
  const contatos = lista.reduce((n, p) => n + p.reativacoes.length, 0);
  const agendadas = lista.filter((p) =>
    p.reativacoes.some((r) => r.outcome === "scheduled" || r.outcome === "returned"),
  ).length;
  const retornaram = lista.filter((p) => p.reativacoes.some((r) => r.outcome === "returned")).length;
  const contatadas = lista.filter((p) => p.reativacoes.length > 0).length;
  return {
    emRisco: lista.filter((p) => p.status === "risco").length,
    janela: lista.filter((p) => p.status === "janela").length,
    acompanhamento: lista.filter((p) => p.status === "acompanhamento").length,
    totalClientes: lista.length,
    contatos,
    agendadas,
    retornaram,
    returnRate: contatadas ? Math.round((retornaram / contatadas) * 100) : 0,
  };
}
