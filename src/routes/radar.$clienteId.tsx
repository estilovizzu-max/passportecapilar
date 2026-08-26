import { createFileRoute, notFound } from "@tanstack/react-router";
import { Bell, Check, ChevronRight, Compass, Plane } from "lucide-react";
import { Ornament, OutlineButton, Screen, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { getCliente } from "@/lib/passport-data";
import retrato from "@/assets/cliente-marina.jpg";
import { toast } from "sonner";

export const Route = createFileRoute("/radar/$clienteId")({
  head: () => ({
    meta: [
      { title: "Detalhe do radar — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Histórico do último cuidado, próxima ação sugerida e envio de lembrete para a cliente.",
      },
      { property: "og:title", content: "Detalhe do radar" },
      {
        property: "og:description",
        content: "Próxima ação sugerida e lembrete de retorno da cliente.",
      },
    ],
  }),
  loader: ({ params }) => {
    const cliente = getCliente(params.clienteId);
    if (!cliente) throw notFound();
    return cliente;
  },
  component: DetalheRadar,
});

function DetalheRadar() {
  const c = Route.useLoaderData();

  return (
    <Screen back backTo="/radar">
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">◈</span>
        <h2 className="font-display text-2xl tracking-[0.08em] text-primary">DETALHE DO RADAR</h2>
        <span className="text-gold">◈</span>
      </div>

      <div className="mt-4 parchment-card p-4">
        <div className="flex gap-4">
          <div className="relative shrink-0">
            <img
              src={retrato}
              alt={`Retrato de ${c.nome}`}
              width={816}
              height={816}
              loading="lazy"
              className="h-32 w-28 rounded-[45%] border-2 border-gold object-cover"
            />
            <span className="absolute -bottom-2 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full wine-surface text-xs text-primary-foreground">
              ✦
            </span>
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="font-display text-2xl text-ink">{c.nome.toUpperCase()}</h3>
            <div className="flex items-center gap-2 rounded-md border-2 border-primary/60 px-3 py-1.5">
              <Plane className="h-4 w-4 text-primary" />
              <span className="font-display text-sm tracking-[0.1em] text-primary">
                ROTA LIBERADA
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-gold/60 px-3 py-1.5">
              <span className="font-display text-2xl text-primary">
                {c.proximoRetorno.split(" ")[0]}
              </span>
              <span className="h-5 w-px bg-gold/50" />
              <span className="font-display tracking-[0.14em] text-ink">
                {c.proximoRetorno.split(" ")[1]}
              </span>
              <Compass className="ml-auto h-4 w-4 text-gold" />
            </div>
          </div>
        </div>

        <Ornament className="my-4" />

        <div className="flex items-center gap-4">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-2 border-primary/40 text-center font-display text-[9px] leading-tight tracking-[0.14em] text-primary/70">
            PROTOCOLO
            <br />
            CAPILAR
          </div>
          <div>
            <h4 className="font-display text-2xl leading-tight text-ink">{c.procedimento}</h4>
            <Ornament className="my-2" />
            <p className="text-sm text-muted-foreground">Momento ideal para retomar o protocolo.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4 border-t border-dotted border-gold/50 pt-4">
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-gold text-gold">
              <Check className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-[11px] tracking-[0.18em] text-gold">CUIDADO ANTERIOR</p>
              <p className="flex items-baseline gap-2 font-display text-lg text-ink">
                {c.ultimoCuidado}
                <span className="flex-1 border-b border-dotted border-gold/60" />
                <span className="text-sm text-gold">{c.ultimaData}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-gold text-primary">
              <Plane className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-[11px] tracking-[0.18em] text-gold">PRÓXIMA AÇÃO SUGERIDA</p>
              <p className="flex items-baseline gap-2 font-display text-lg text-ink">
                {c.procedimento}
                <span className="flex-1 border-b border-dotted border-gold/60" />
                <span className="text-sm text-gold">{c.proximoRetorno}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Reforce a estrutura e devolva força aos fios.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <WineButton onClick={() => toast.success(`Lembrete enviado para ${c.nome}`)}>
            <Bell className="h-5 w-5" />
            ENVIAR LEMBRETE
            <ChevronRight className="h-5 w-5" />
          </WineButton>
          <OutlineButton to="/passaporte">
            ABRIR PASSAPORTE
            <ChevronRight className="h-5 w-5" />
          </OutlineButton>
        </div>
      </div>
    </Screen>
  );
}
