import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { Emblema, Ornament, OutlineButton, Screen } from "@/components/passport/ui";
import { useAuth } from "@/components/providers/auth-provider";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil — Passaporte Capilar" },
      { name: "description", content: "Gerencie sua conta e preferências no Passaporte Capilar." },
      { property: "og:title", content: "Perfil — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Sua conta, seus dados e preferências.",
      },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success("Você saiu da sua conta");
  }

  return (
    <Screen>
      <div className="flex flex-col items-center">
        <Emblema className="h-16" />
        <h2 className="mt-4 font-display text-3xl text-primary">PERFIL</h2>
        <Ornament className="mt-2 w-full" />
      </div>

      <div className="mt-6 parchment-card p-5 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full wine-surface text-2xl text-primary-foreground">
          {user?.email?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <p className="mt-3 font-display text-lg text-ink">{user?.email ?? "Profissional"}</p>
        <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 text-gold" />
          {user?.email ?? "—"}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <OutlineButton to="/brand-studio">BRAND STUDIO</OutlineButton>
        <OutlineButton to="/comunicacao">COMUNICAÇÃO</OutlineButton>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-gold/60 bg-card px-6 py-3.5 font-display text-base tracking-[0.1em] text-destructive transition-colors active:bg-secondary"
        >
          <LogOut className="h-5 w-5" />
          SAIR
        </button>
      </div>

      <Ornament className="mt-6" />
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Passaporte Capilar<sup>TM</sup> — seu protocolo, sua assinatura.
      </p>
    </Screen>
  );
}
