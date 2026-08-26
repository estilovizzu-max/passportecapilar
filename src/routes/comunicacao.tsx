import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Mail, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Emblema, Ornament, Screen, SectionTitle, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { lembretes, mensagens } from "@/lib/passport-data";
import emblema from "@/assets/emblema.png";

export const Route = createFileRoute("/comunicacao")({
  head: () => ({
    meta: [
      { title: "Comunicação — Passaporte Capilar" },
      {
        name: "description",
        content: "Mensagens e lembretes das clientes e da equipe Passaporte.",
      },
      { property: "og:title", content: "Comunicação — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Conecte-se, informe-se e avance com mensagens e lembretes.",
      },
    ],
  }),
  component: Comunicacao,
});

function Comunicacao() {
  useRequireAuth();
  const [aba, setAba] = useState<"mensagens" | "lembretes">("mensagens");
  const itens = aba === "mensagens" ? mensagens : lembretes;

  return (
    <Screen>
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full wine-surface text-primary-foreground ring-2 ring-gold">
          <Mail className="h-7 w-7" />
        </span>
        <div>
          <h2 className="font-display text-3xl text-primary">COMUNICAÇÃO</h2>
          <p className="text-sm tracking-[0.1em] text-muted-foreground">
            CONECTE-SE. INFORME-SE. AVANCE.
          </p>
        </div>
      </div>

      <div className="mt-5 flex rounded-full border border-gold/60 bg-card p-1">
        {(["mensagens", "lembretes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setAba(t)}
            className={`flex-1 rounded-full py-2 font-display text-sm tracking-[0.12em] transition-colors ${
              aba === t ? "wine-surface text-primary-foreground" : "text-ink"
            }`}
          >
            {t === "mensagens" ? "MENSAGENS" : "LEMBRETES"}
          </button>
        ))}
      </div>

      <ul className="mt-5 space-y-3">
        {itens.map((m) => (
          <li key={m.id} className="parchment-card p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/70 text-gold">
                {m.nome === "Equipe Passaporte" ? (
                  <img src={emblema} alt="" className="h-7 w-7 object-contain" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </span>
              <div className="flex-1">
                <p className="font-display text-xl text-ink">{m.nome}</p>
                <p className="text-sm text-muted-foreground">{m.resumo}</p>
              </div>
              <span className="text-sm text-gold">{m.quando}</span>
              <ChevronRight className="h-5 w-5 text-gold" />
            </div>
            <Ornament className="mt-2" />
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <WineButton onClick={() => toast.info("Nova mensagem em breve")}>
          <Plus className="h-5 w-5" /> NOVA MENSAGEM
        </WineButton>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-primary/50 text-center font-display text-[9px] leading-tight tracking-[0.14em] text-primary/70">
          PROTOCOLO
          <Emblema className="my-0.5 h-7 w-7" />
          ATIVO
        </div>
      </div>
    </Screen>
  );
}
