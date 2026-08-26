import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronRight, UserRound } from "lucide-react";
import { Ornament, Screen, SectionTitle } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { clientes } from "@/lib/passport-data";
import retrato from "@/assets/cliente-marina.jpg";

export const Route = createFileRoute("/inicio")({
  head: () => ({
    meta: [
      { title: "Início — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Painel do profissional: clientes ativas, capítulos concluídos, agenda do dia e radar de recorrência.",
      },
      { property: "og:title", content: "Início — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Acompanhe agenda, clientes ativas e retornos próximos em um só lugar.",
      },
    ],
  }),
  component: Inicio,
});

function Inicio() {
  useRequireAuth();
  return (
    <Screen>
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={retrato}
            alt="Foto de perfil de Thaynara"
            width={816}
            height={816}
            className="h-28 w-28 rounded-full border-2 border-gold object-cover ring-4 ring-card"
          />
          <span className="absolute -bottom-1 right-2 grid h-9 w-9 place-items-center rounded-full wine-surface text-[10px] text-primary-foreground">
            ✦
          </span>
        </div>
        <div className="flex-1">
          <h2 className="font-display text-3xl leading-tight">
            <span className="block text-primary">BOM DIA,</span>
            <span className="block text-ink">THAYNARA</span>
          </h2>
          <Ornament className="my-2" />
          <p className="text-sm tracking-[0.18em] text-gold">25 AGO 2026</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl wine-surface p-4 text-center ring-1 ring-gold/40">
          <p className="font-display text-sm tracking-[0.16em] text-primary-foreground">
            CLIENTES ATIVAS
          </p>
          <p className="mt-2 font-display text-6xl gold-text">24</p>
          <span className="mx-auto mt-3 grid h-10 w-10 place-items-center rounded-full bg-black/20 text-gold">
            <UserRound className="h-5 w-5" />
          </span>
        </div>
        <div className="parchment-card p-4 text-center">
          <p className="font-display text-sm leading-tight tracking-[0.1em] text-ink">
            CAPÍTULOS
            <br />
            CONCLUÍDOS
          </p>
          <p className="mt-2 font-display text-6xl text-ink">68</p>
          <span className="mx-auto mt-3 grid h-10 w-10 place-items-center rounded-full border border-gold/60 text-gold">
            <BookOpen className="h-5 w-5" />
          </span>
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle>AGENDA DE HOJE</SectionTitle>
        <ul className="mt-3 parchment-card divide-y divide-gold/25 p-2">
          {clientes
            .filter((c) => c.horario)
            .map((c) => (
              <li key={c.id}>
                <Link
                  to="/radar/$clienteId"
                  params={{ clienteId: c.id }}
                  className="flex items-center gap-3 px-2 py-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/70 text-gold">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <span className="font-display text-lg text-ink">{c.nome}</span>
                  <span className="mx-2 flex-1 border-b border-dotted border-gold/60" />
                  <span className="rounded-md wine-surface px-3 py-1 font-display text-sm text-primary-foreground">
                    {c.horario}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gold" />
                </Link>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-8">
        <SectionTitle>RADAR DE RECORRÊNCIA</SectionTitle>
        <Link to="/radar" className="mt-3 flex items-center gap-4 parchment-card p-4">
          <Radar />
          <span className="flex-1 rounded-full wine-surface px-4 py-3 text-center font-display text-primary-foreground">
            <strong className="text-2xl">3</strong>{" "}
            <span className="tracking-[0.12em]">RETORNOS PRÓXIMOS</span>
          </span>
        </Link>
      </div>
    </Screen>
  );
}

export function Radar({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.84 0.11 88)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.84 0.11 88)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {[16, 28, 40].map((r) => (
        <circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="oklch(0.72 0.11 82)"
          strokeWidth="0.8"
          opacity="0.7"
        />
      ))}
      <line x1="10" y1="50" x2="90" y2="50" stroke="oklch(0.72 0.11 82)" strokeWidth="0.5" />
      <line x1="50" y1="10" x2="50" y2="90" stroke="oklch(0.72 0.11 82)" strokeWidth="0.5" />
      <path d="M50 50 L50 12 A38 38 0 0 1 80 32 Z" fill="url(#sweep)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="6s"
          repeatCount="indefinite"
        />
      </path>
      {[
        [32, 62],
        [66, 58],
        [62, 74],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="oklch(0.72 0.11 82)" />
      ))}
      <circle cx="50" cy="50" r="4" fill="oklch(0.72 0.11 82)" />
    </svg>
  );
}
