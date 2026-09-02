import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { Ornament, Screen } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/passport/status";
import { calcularMetricas, formatData, usePassaportes, type Status } from "@/lib/passport-api";
import { Radar } from "./inicio";

export const Route = createFileRoute("/radar/")({
  head: () => ({
    meta: [
      { title: "Radar de Recorrência — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Quem você está prestes a perder: clientes em risco, na janela ideal de retorno e em acompanhamento.",
      },
      { property: "og:title", content: "Radar de Recorrência" },
      {
        property: "og:description",
        content: "Clientes em risco, na janela ideal e em acompanhamento — com ação recomendada.",
      },
    ],
  }),
  component: RadarPage,
});

type Filtro = Status | "todos";

function RadarPage() {
  useRequireAuth();
  const { data, isLoading } = usePassaportes();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const lista = data ?? [];
  const m = calcularMetricas(lista);

  const cards: { key: Filtro; cor: string; corBg: string; n: number; titulo: string; sub: string }[] = [
    {
      key: "janela",
      cor: "text-gold",
      corBg: "border-gold/60",
      n: m.janela,
      titulo: "UPCOMING",
      sub: "Janela ideal de retorno",
    },
    {
      key: "acompanhamento",
      cor: "text-primary",
      corBg: "border-primary/60",
      n: m.acompanhamento,
      titulo: "DUE",
      sub: "Próximo capítulo definido",
    },
    {
      key: "risco",
      cor: "text-destructive",
      corBg: "border-destructive/60",
      n: m.emRisco,
      titulo: "OVERDUE",
      sub: "Ultrapassaram o ciclo esperado",
    },
    {
      key: "sem-historico",
      cor: "text-muted-foreground",
      corBg: "border-muted",
      n: lista.filter((p) => p.status === "sem-historico").length,
      titulo: "NO NEXT CHAPTER",
      sub: "Histórico insuficiente",
    },
  ];

  const filtrada = filtro === "todos" ? lista : lista.filter((p) => p.status === filtro);

  return (
    <Screen back backTo="/inicio">
      <h2 className="text-center font-display text-3xl text-primary">RADAR DE RECORRÊNCIA</h2>
      <p className="mt-1 text-center font-display italic text-gold">
        Quem eu estou prestes a perder?
      </p>
      <Ornament className="mt-3" />

      <div className="mt-4 flex items-center gap-4">
        <Radar size={120} />
        <div className="flex-1 space-y-2">
          {cards.map((c) => (
            <button
              key={c.key}
              onClick={() => setFiltro(c.key)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                filtro === c.key ? "border-gold bg-secondary" : c.corBg
              }`}
            >
              <span className={`font-display text-3xl ${c.cor}`}>{c.n}</span>
              <span>
                <span className={`block font-display text-[11px] tracking-[0.12em] ${filtro === c.key ? "text-ink" : "text-muted-foreground"}`}>
                  {c.titulo}
                </span>
                <span className="block text-[11px] text-muted-foreground">{c.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setFiltro("todos")}
        className={`mt-4 w-full rounded-full px-3 py-2 text-[11px] tracking-[0.14em] ${
          filtro === "todos" ? "wine-surface text-primary-foreground" : "border border-gold/60 text-ink"
        }`}
      >
        VER TODAS AS {m.totalClientes} CLIENTES
      </button>

      {isLoading && <p className="mt-6 text-center text-muted-foreground">Calculando radar...</p>}

      {!isLoading && filtrada.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          Nenhuma cliente nesse grupo agora.
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {filtrada.map((p) => {
          const statusLabel: Record<string, string> = {
            janela: "UPCOMING",
            acompanhamento: "DUE",
            risco: "OVERDUE",
            "sem-historico": "NO CHAPTER",
          };
          return (
            <li key={p.cliente.id}>
              <Link
                to="/radar/$clienteId"
                params={{ clienteId: p.cliente.id }}
                className="flex items-center gap-3 parchment-card px-3 py-3"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full wine-surface font-display text-primary-foreground">
                  {p.cliente.name.charAt(0)}
                </span>
                <span className="flex-1">
                  <span className="block font-display text-lg text-ink">{p.cliente.name}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} dias={p.diasRestantes} />
                    <span className="font-display text-[10px] tracking-[0.1em] text-muted-foreground">
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </div>
                </span>
                <span className="flex flex-col items-end gap-1 border-l border-dotted border-gold/60 pl-3">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span className="font-display text-primary text-sm">
                    {p.proximoRetorno ? formatData(p.proximoRetorno) : "—"}
                  </span>
                  {p.ultimo && (
                    <span className="text-[10px] text-muted-foreground">
                      {p.ultimo.procedure}
                    </span>
                  )}
                </span>
                <ChevronRight className="h-4 w-4 text-gold" />
              </Link>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
