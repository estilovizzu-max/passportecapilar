import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Sparkles, Waves, Share2 } from "lucide-react";
import { Ornament, Screen, Stamp } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { clientes } from "@/lib/passport-data";
import { Radar } from "./inicio";

export const Route = createFileRoute("/radar/")({
  head: () => ({
    meta: [
      { title: "Radar de Recorrência — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Veja os momentos certos para cuidar de cada cliente: retornos próximos, protocolos e datas sugeridas.",
      },
      { property: "og:title", content: "Radar de Recorrência" },
      {
        property: "og:description",
        content: "Momentos certos para cuidar de cada cliente.",
      },
    ],
  }),
  component: RadarPage,
});

const filtros = ["TODOS", "ESTA SEMANA", "PRÓXIMO MÊS"] as const;
const icones = [Share2, Sparkles, Waves];

function RadarPage() {
  const [filtro, setFiltro] = useState<string>("TODOS");
  const lista =
    filtro === "ESTA SEMANA"
      ? clientes.slice(0, 1)
      : filtro === "PRÓXIMO MÊS"
        ? clientes.slice(1)
        : clientes;

  return (
    <Screen back backTo="/inicio">
      <h2 className="text-center font-display text-3xl text-primary">RADAR DE RECORRÊNCIA</h2>
      <p className="mt-1 text-center font-display italic text-gold">
        Momentos certos para cuidar de cada cliente
      </p>
      <Ornament className="mt-3" />

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <Radar size={200} />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl border border-gold/60 px-6 py-3 text-center">
            <p className="font-display text-5xl text-primary">3</p>
            <p className="font-display text-xs leading-tight tracking-[0.1em] text-ink">
              RETORNOS
              <br />
              PRÓXIMOS
            </p>
          </div>
          <Stamp>ROTA ✈ LIBERADA</Stamp>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {filtros.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`flex-1 rounded-full px-2 py-2.5 text-[11px] tracking-[0.12em] transition-colors ${
              filtro === f
                ? "wine-surface text-primary-foreground"
                : "border border-gold/60 text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {lista.map((c, i) => {
          const Icon = icones[i % icones.length]!;
          return (
            <li key={c.id}>
              <Link
                to="/radar/$clienteId"
                params={{ clienteId: c.id }}
                className="flex items-center gap-3 parchment-card px-3 py-3"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full wine-surface font-display text-primary-foreground">
                  {c.nome.charAt(0)}
                </span>
                <span className="flex-1 font-display text-lg text-ink">{c.nome}</span>
                <span className="flex items-center gap-1.5 border-l border-dotted border-gold/60 pl-3">
                  <Calendar className="h-4 w-4 text-gold" />
                  <span className="font-display text-primary">{c.proximoRetorno}</span>
                </span>
                <span className="flex items-center gap-1.5 border-l border-gold/40 pl-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full wine-surface text-primary-foreground">
                    <Icon className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Screen>
  );
}
