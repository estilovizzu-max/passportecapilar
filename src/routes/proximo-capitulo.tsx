import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Droplet, Feather, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Ornament, Screen, Stamp, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/proximo-capitulo")({
  head: () => ({
    meta: [
      { title: "Próximo capítulo — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Nutrição intensiva: destino aprovado com data confirmada e benefícios do próximo cuidado capilar.",
      },
      { property: "og:title", content: "Próximo capítulo: Nutrição Intensiva" },
      {
        property: "og:description",
        content: "Seu próximo cuidado já está liberado. Confirme o destino.",
      },
    ],
  }),
  component: ProximoCapitulo,
});

const beneficios = [
  { icon: Feather, texto: "Mais maciez" },
  { icon: Sparkles, texto: "Brilho renovado" },
  { icon: Flame, texto: "Fios nutridos" },
];

function ProximoCapitulo() {
  useRequireAuth();
  return (
    <Screen back backTo="/passaporte">
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">≈</span>
        <h2 className="font-display text-lg tracking-[0.18em] text-ink">PRÓXIMO CAPÍTULO</h2>
        <span className="text-gold">≈</span>
      </div>

      <div className="mt-4 parchment-card px-5 py-7">
        <div className="flex justify-center">
          <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-primary/50 text-center font-display text-[8px] leading-tight tracking-[0.12em] text-primary/70">
            NUTRIÇÃO
            <Droplet className="my-0.5 h-5 w-5 text-primary" />
            INTENSIVA
          </div>
        </div>
        <Ornament className="my-4" />

        <h3 className="text-center font-display text-4xl leading-tight text-ink">
          NUTRIÇÃO
          <br />
          INTENSIVA
        </h3>

        <div className="mt-5 rotate-[-2deg] rounded-lg border-2 border-primary/60 px-4 py-3 text-center">
          <p className="font-display text-2xl leading-tight tracking-[0.06em] text-primary">
            DESTINO
            <br />
            APROVADO
          </p>
        </div>

        <p className="mt-5 text-center font-display text-lg leading-snug text-gold">
          Seu próximo cuidado
          <br />já está liberado
        </p>

        <Ornament className="my-4" />

        <p className="flex items-center justify-center gap-2 font-display text-2xl text-ink">
          <Calendar className="h-6 w-6 text-gold" /> 21 SET
        </p>

        <ul className="mt-5 space-y-3">
          {beneficios.map(({ icon: Icon, texto }) => (
            <li
              key={texto}
              className="flex items-center gap-3 border-b border-dotted border-gold/50 pb-2"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/70 text-gold">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-display text-lg text-ink">{texto}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <Stamp>ROTA ✈ LIBERADA</Stamp>
        </div>

        <div className="mt-4">
          <WineButton onClick={() => toast.success("Destino confirmado para 21 SET")}>
            CONFIRMAR DESTINO
          </WineButton>
        </div>
      </div>
    </Screen>
  );
}
