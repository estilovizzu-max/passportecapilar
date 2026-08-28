import { useMemo } from "react";
import { usePassaportes } from "@/lib/passport-api";
import { construirIntelligence } from "./build";
import type { IntelligenceRecord } from "./types";

export * from "./types";
export { construirIntelligence, itensDaCamada } from "./build";

/** Lê o Passaporte autorizado e devolve o registro de inteligência derivado. */
export function useIntelligence(clienteId: string | undefined) {
  const { data, isLoading, error } = usePassaportes();
  const record = useMemo<IntelligenceRecord | null>(() => {
    if (!data?.length) return null;
    const p = clienteId ? data.find((x) => x.cliente.id === clienteId) : data[0];
    return p ? construirIntelligence(p) : null;
  }, [data, clienteId]);
  return { record, passaportes: data ?? [], isLoading, error };
}
