import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Mail, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Emblema, Ornament, OutlineButton, Screen } from "@/components/passport/ui";
import { useAuth } from "@/components/providers/auth-provider";
import { useRoles } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

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
  const { isAdmin } = useRoles();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();
      if (!active || !data) return;
      setFullName(data.full_name);
      if (data.avatar_url) {
        const signed = await supabase.storage
          .from("avatars")
          .createSignedUrl(data.avatar_url, 3600);
        if (active) setAvatarUrl(signed.data?.signedUrl ?? null);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleSignOut() {
    void trackEvent("logout", { provider: user?.app_metadata?.provider ?? "unknown" });
    await signOut();
    toast.success("Você saiu da sua conta");
    navigate({ to: "/", replace: true });
  }

  return (
    <Screen>
      <div className="flex flex-col items-center">
        <Emblema className="h-16" />
        <h2 className="mt-4 font-display text-3xl text-primary">PERFIL</h2>
        <Ornament className="mt-2 w-full" />
      </div>

      <div className="mt-6 parchment-card p-5 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full wine-surface text-2xl text-primary-foreground">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" />
          ) : (
            ((fullName ?? user?.email)?.charAt(0).toUpperCase() ?? "?")
          )}
        </div>
        <p className="mt-3 font-display text-lg text-ink">
          {fullName ?? user?.email ?? "Profissional"}
        </p>
        <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 text-gold" />
          {user?.email ?? "—"}
        </p>
        {isAdmin && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/60 px-3 py-1 text-xs tracking-[0.14em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            ADMINISTRADOR
          </p>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <OutlineButton to="/editar-perfil">
          <Pencil className="h-4 w-4" />
          EDITAR PERFIL
        </OutlineButton>
        {isAdmin && <OutlineButton to="/admin">PAINEL ADMIN</OutlineButton>}
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
