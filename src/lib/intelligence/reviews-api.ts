/**
 * Trilha de auditoria do Intelligence Brief.
 * Append-only: registra CONFIRMAR / EDITAR / DESCARTAR com a data_version usada.
 * Nunca altera capítulos históricos da cliente.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import type { DataVersion } from "./data-version";

export type ReviewAction = "confirmar" | "editar" | "descartar";

export const reviewActionLabel: Record<ReviewAction, string> = {
  confirmar: "CONFIRMADO",
  editar: "EDITADO",
  descartar: "DESCARTADO",
};

export type ReviewRow = {
  id: string;
  client_id: string;
  professional_id: string;
  surface: string;
  section_key: string;
  item_id: string;
  item_label: string;
  item_value: string;
  item_natureza: string;
  action: string;
  note: string | null;
  data_version: DataVersion;
  created_at: string;
};

export type ReviewInput = {
  clientId: string;
  surface?: string;
  sectionKey: string;
  itemId: string;
  itemLabel: string;
  itemValue: string;
  itemNatureza: string;
  action: ReviewAction;
  note?: string | null;
  dataVersion: DataVersion;
};

export function useRegistrarReview() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReviewInput) => {
      if (!user) throw new Error("Sessão necessária para registrar a revisão.");
      const { error } = await supabase.from("intelligence_reviews").insert({
        client_id: input.clientId,
        professional_id: user.id,
        surface: input.surface ?? "intelligence-brief",
        section_key: input.sectionKey,
        item_id: input.itemId,
        item_label: input.itemLabel,
        item_value: input.itemValue,
        item_natureza: input.itemNatureza,
        action: input.action,
        note: input.note ?? null,
        data_version: input.dataVersion as unknown as never,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intelligence-reviews"] }),
  });
}

export type ReviewFiltro = {
  clientId?: string;
  de?: string;
  ate?: string;
  action?: ReviewAction | "";
};

export function useReviews(filtro: ReviewFiltro = {}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["intelligence-reviews", user?.id, filtro],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase
        .from("intelligence_reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (filtro.clientId) q = q.eq("client_id", filtro.clientId);
      if (filtro.action) q = q.eq("action", filtro.action);
      if (filtro.de) q = q.gte("created_at", `${filtro.de}T00:00:00`);
      if (filtro.ate) q = q.lte("created_at", `${filtro.ate}T23:59:59`);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ReviewRow[];
    },
  });
}

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function reviewsParaCsv(rows: ReviewRow[], nomePorCliente: Record<string, string>) {
  const head = [
    "data",
    "cliente",
    "superficie",
    "secao",
    "item",
    "valor",
    "natureza",
    "acao",
    "nota",
    "data_version_hash",
    "atendimentos",
    "ultimo_servico",
    "cliente_atualizado_em",
    "gerado_em",
  ];
  const linhas = rows.map((r) =>
    [
      r.created_at,
      nomePorCliente[r.client_id] ?? r.data_version?.clienteNome ?? r.client_id,
      r.surface,
      r.section_key,
      r.item_label,
      r.item_value,
      r.item_natureza,
      r.action,
      r.note ?? "",
      r.data_version?.hash ?? "",
      r.data_version?.atendimentos ?? "",
      r.data_version?.ultimoServico ?? "",
      r.data_version?.clienteAtualizadoEm ?? "",
      r.data_version?.geradoEm ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  return [head.join(","), ...linhas].join("\n");
}

export function baixarCsv(nome: string, conteudo: string) {
  const blob = new Blob([`\uFEFF${conteudo}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}
