import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Calendar, Camera, FileText, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Ornament, Screen, SectionTitle, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/registrar")({
  head: () => ({
    meta: [
      { title: "Registrar atendimento — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Registre o atendimento com observações e evidências antes e depois direto no passaporte da cliente.",
      },
      { property: "og:title", content: "Registrar atendimento" },
      {
        property: "og:description",
        content: "Observações e evidências antes/depois salvas no passaporte da cliente.",
      },
    ],
  }),
  component: Registrar,
});

function Registrar() {
  useRequireAuth();
  const [obs, setObs] = useState("");

  return (
    <Screen back backTo="/passaporte">
      <h2 className="text-center font-display text-3xl text-ink">REGISTRAR ATENDIMENTO</h2>
      <Ornament className="mt-2" />

      <form
        className="mt-5 space-y-1"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Atendimento salvo no passaporte");
        }}
      >
        <Campo icon={<UserRound className="h-5 w-5" />} label="CLIENTE" valor="Marina Costa" />
        <Campo icon={<Calendar className="h-5 w-5" />} label="DATA" valor="25 AGO 2026" />
        <Campo
          icon={<BookOpen className="h-5 w-5" />}
          label="PROCEDIMENTO"
          valor="Reconstrução capilar"
        />

        <div className="flex gap-4 py-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full wine-surface text-primary-foreground">
            <FileText className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <p className="text-[11px] tracking-[0.18em] text-muted-foreground">OBSERVAÇÕES</p>
            <textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={4}
              placeholder="Registrar detalhes do atendimento..."
              className="mt-1 w-full rounded-lg border border-gold/60 bg-card p-3 text-base outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>

        <SectionTitle>EVIDÊNCIAS DO CAPÍTULO</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {["ANTES", "DEPOIS"].map((t) => (
            <FotoSlot key={t} titulo={t} />
          ))}
        </div>

        <div className="pt-6">
          <WineButton type="submit">SALVAR NO PASSAPORTE</WineButton>
        </div>
      </form>
    </Screen>
  );
}

function Campo({
  icon,
  label,
  valor,
}: {
  icon: React.ReactNode;
  label: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-dotted border-gold/50 py-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full wine-surface text-primary-foreground">
        {icon}
      </span>
      <div>
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="font-display text-xl text-ink">{valor}</p>
      </div>
    </div>
  );
}

function FotoSlot({ titulo }: { titulo: string }) {
  const [foto, setFoto] = useState<string | null>(null);
  return (
    <label className="flex cursor-pointer flex-col items-center gap-3 parchment-card p-4">
      <span className="font-display text-sm tracking-[0.12em] text-primary">{titulo}</span>
      {foto ? (
        <img src={foto} alt={`Evidência ${titulo}`} className="h-24 w-24 rounded-lg object-cover" />
      ) : (
        <span className="grid h-24 w-24 place-items-center rounded-full border-2 border-dotted border-gold/70 text-gold">
          <Camera className="h-8 w-8" />
        </span>
      )}
      <span className="text-xs text-muted-foreground">
        {foto ? "Trocar foto" : "Adicionar foto"}
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setFoto(URL.createObjectURL(f));
        }}
      />
    </label>
  );
}
