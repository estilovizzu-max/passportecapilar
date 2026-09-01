/**
 * Declarações explícitas da profissional (preferências/objetivos).
 * Preenchem lacunas SEM alterar capítulos históricos registrados.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import type { IntelligenceItem } from "./types";

export type DeclaracaoKind = "preference" | "goal";

export const declaracaoKindLabel: Record<DeclaracaoKind, string> = {
  preference: "Preferência declarada",
  goal: "Objetivo declarado",
};

export type DeclaracaoRow = {
  id: string;
  client_id: string;
  professional_id: string;
  kind: string;
  label: string;
  content: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export function useDeclaracoes(clientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["intelligence-declarations", user?.id, clientId ?? null],
    enabled: !!user && !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("intelligence_declarations")
        .select("*")
        .eq("client_id", clientId!)
        .eq("archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DeclaracaoRow[];
    },
  });
}

export function useAdicionarDeclaracao() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      clientId: string;
      kind: DeclaracaoKind;
      label: string;
      content: string;
    }) => {
      if (!user) throw new Error("Sessão necessária para declarar informação.");
      const { error } = await supabase.from("intelligence_declarations").insert({
        client_id: input.clientId,
        professional_id: user.id,
        kind: input.kind,
        label: input.label,
        content: input.content,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intelligence-declarations"] }),
  });
}

export function useArquivarDeclaracao() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("intelligence_declarations")
        .update({ archived: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["intelligence-declarations"] }),
  });
}

/** Converte declarações em itens de inteligência com natureza de FATO DECLARADO. */
export function declaracoesComoItens(rows: DeclaracaoRow[]): IntelligenceItem[] {
  return rows.map((d) => ({
    id: `declaracao-${d.id}`,
    layer: "preference-memory",
    natureza: "fact",
    origem: "declared",
    rotulo: declaracaoKindLabel[(d.kind as DeclaracaoKind) ?? "preference"] ?? d.label,
    valor: d.label ? `${d.label}: ${d.content}` : d.content,
    ocorridoEm: d.created_at,
    evidencias: [
      { tipo: "derivado", id: d.id, descricao: "Declarado pela profissional nesta ferramenta." },
    ],
  }));
}
