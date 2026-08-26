import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, FileText, Globe, PenTool, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Emblema, Ornament, OutlineButton, Screen, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import retrato from "@/assets/cliente-marina.jpg";

export const Route = createFileRoute("/brand-studio")({
  head: () => ({
    meta: [
      { title: "Brand Studio — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Crie conteúdos com a identidade do seu Passaporte Capilar e fortaleça sua autoridade no universo da beleza.",
      },
      { property: "og:title", content: "Brand Studio — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Seu protocolo, sua assinatura. Personalize e compartilhe.",
      },
    ],
  }),
  component: BrandStudio,
});

const estilos = [
  { id: "editorial", label: "EDITORIAL", icon: FileText },
  { id: "diplomatico", label: "DIPLOMÁTICO", icon: Globe },
  { id: "minimal", label: "MINIMAL", icon: Share2 },
];

function BrandStudio() {
  useRequireAuth();
  const [estilo, setEstilo] = useState("editorial");

  return (
    <Screen back backTo="/inicio">
      <h2 className="text-center font-display text-3xl text-primary">BRAND STUDIO</h2>
      <p className="mt-1 text-center font-display italic text-gold">Seu protocolo, sua assinatura</p>
      <Ornament className="mt-2" />
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Crie conteúdos com a identidade do seu Passaporte Capilar<sup>TM</sup> e fortaleça sua
        autoridade no universo da beleza.
      </p>

      <div className="mt-6 rounded-2xl border-4 border-primary p-1">
        <div className="rounded-xl border border-gold/50 bg-card p-5 text-center">
          <Emblema className="mx-auto h-10" />
          <p className="mt-2 font-display tracking-[0.12em] text-gold">PASSAPORTE CAPILAR<sup>TM</sup></p>
          <Ornament className="my-3" />
          <h3 className="font-display text-2xl text-ink">CAPÍTULO CONCLUÍDO</h3>
          <img
            src={retrato}
            alt="Prévia do post"
            width={200}
            height={200}
            loading="lazy"
            className="mx-auto mt-4 h-32 w-32 rounded-full border-2 border-gold object-cover"
          />
          <p className="mt-3 text-sm text-muted-foreground">
            Cada etapa concluída é um passo a mais rumo à sua melhor versão.
          </p>
          <p className="mt-2 text-sm text-primary">
            SEU CABELO. SUA HISTÓRIA. SUA ASSINATURA.
          </p>
          <Ornament className="mt-3" />
          <p className="text-[10px] tracking-[0.12em] text-muted-foreground">
            PROTOCOLO. DISCIPLINA. TRANSFORMAÇÃO.
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">Prévia do post</p>
      <div className="mt-2 flex justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${i === 2 ? "bg-primary" : "bg-gold/40"}`} />
        ))}
      </div>

      <div className="mt-6">
        <Ornament className="mb-3" />
        <p className="text-center font-display text-sm tracking-[0.14em] text-ink">ESCOLHA O ESTILO</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {estilos.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setEstilo(id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition-colors ${
                estilo === id
                  ? "border-transparent wine-surface text-primary-foreground"
                  : "border-gold/60 text-ink"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] tracking-[0.1em]">{label}</span>
              {estilo === id && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <WineButton onClick={() => toast.success("Post personalizado")}>
          <PenTool className="h-5 w-5" />
          PERSONALIZAR
        </WineButton>
        <OutlineButton onClick={() => toast.info("Compartilhamento em breve")}>
          <Share2 className="h-5 w-5" />
          COMPARTILHAR
        </OutlineButton>
      </div>
    </Screen>
  );
}
