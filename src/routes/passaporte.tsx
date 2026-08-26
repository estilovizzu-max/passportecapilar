import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, ChevronRight, Droplet, Plane, Search, Shield, Sparkles, Target, Waves } from "lucide-react";
import { Ornament, OutlineButton, Screen, SectionTitle, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { etapas } from "@/lib/passport-data";
import retrato from "@/assets/cliente-marina.jpg";

export const Route = createFileRoute("/passaporte")({
  head: () => ({
    meta: [
      { title: "Capítulo do protocolo — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Reconstrução capilar: objetivo, etapa atual e progresso do capítulo dentro do protocolo da cliente.",
      },
      { property: "og:title", content: "Capítulo do protocolo" },
      {
        property: "og:description",
        content: "Objetivo, etapa atual e progresso do protocolo capilar.",
      },
    ],
  }),
  component: Passaporte,
});

const etapaIcons = [Search, Droplet, Waves, Sparkles];

function Passaporte() {
  useRequireAuth();
  const atual = 2;
  return (
    <Screen>
      <div className="flex justify-center">
        <span className="rounded-full wine-surface px-5 py-1.5 font-display text-xs tracking-[0.2em] text-primary-foreground">
          • CAPÍTULO 02 DE 06 •
        </span>
      </div>

      <h2 className="mt-4 text-center font-display text-4xl leading-tight text-primary">
        RECONSTRUÇÃO
        <br />
        CAPILAR
      </h2>

      <div className="mt-5 flex gap-4">
        <div className="relative shrink-0">
          <img
            src={retrato}
            alt="Cliente em protocolo de reconstrução capilar"
            width={816}
            height={816}
            loading="lazy"
            className="h-48 w-36 rounded-[45%] border-2 border-gold object-cover"
          />
          <span className="absolute -bottom-3 left-1/2 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full wine-surface text-primary-foreground">
            ✦
          </span>
        </div>

        <div className="flex-1 space-y-4">
          <div className="inline-flex rotate-[-3deg] items-center gap-2 rounded-md border-2 border-primary/60 px-3 py-1.5">
            <Plane className="h-4 w-4 text-primary" />
            <span className="font-display text-xs leading-tight tracking-[0.1em] text-primary">
              PROTOCOLO
              <br />
              ATIVO
            </span>
          </div>
          <Info icon={<Target className="h-4 w-4" />} label="OBJETIVO">
            Fortalecer e devolver resistência aos fios
          </Info>
          <Info icon={<Shield className="h-4 w-4" />} label="ETAPA ATUAL">
            Reconstrução profunda
          </Info>
          <Info icon={<BarChart3 className="h-4 w-4" />} label="PROGRESSO">
            <strong className="text-primary">3</strong> de 4 etapas
          </Info>
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle>ETAPAS DO CAPÍTULO</SectionTitle>
        <ol className="mt-4 flex items-start justify-between">
          {etapas.map((e, i) => {
            const Icon = etapaIcons[i]!;
            const done = i <= atual;
            return (
              <li key={e.numero} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-full ${
                    done
                      ? "wine-surface text-primary-foreground ring-2 ring-gold"
                      : "border border-gold/60 text-gold"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-base text-ink">{e.numero}</span>
                <span className="text-[9px] tracking-[0.1em] text-muted-foreground">{e.nome}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <Ornament className="mt-6" />

      <div className="mt-6 space-y-3">
        <WineButton to="/registrar">
          VER PROCEDIMENTO
          <ChevronRight className="h-5 w-5" />
        </WineButton>
        <OutlineButton to="/proximo-capitulo">PRÓXIMO CAPÍTULO</OutlineButton>
      </div>
    </Screen>
  );
}

function Info({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 font-display text-sm tracking-[0.12em] text-ink">
        <span className="text-gold">{icon}</span>
        {label}
        <span className="flex-1 border-b border-dotted border-gold/60" />
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
