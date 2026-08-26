import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { Emblema, Ornament, OutlineButton, Screen, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/editar-perfil")({
  head: () => ({
    meta: [
      { title: "Editar perfil — Passaporte Capilar" },
      {
        name: "description",
        content: "Atualize seu nome, foto e preferências de atendimento no Passaporte Capilar.",
      },
      { property: "og:title", content: "Editar perfil — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Nome, avatar e preferências da sua conta profissional.",
      },
    ],
  }),
  component: EditarPerfil,
});

type Prefs = { lembretes: boolean; resumoSemanal: boolean; tema: "claro" | "escuro" };

const defaultPrefs: Prefs = { lembretes: true, resumoSemanal: false, tema: "claro" };

function EditarPerfil() {
  const { user } = useRequireAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, preferences")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      if (error) toast.error(error.message);
      if (data) {
        setFullName(data.full_name ?? "");
        setAvatarPath(data.avatar_url);
        setPrefs({ ...defaultPrefs, ...((data.preferences as Partial<Prefs>) ?? {}) });
        if (data.avatar_url) {
          const signed = await supabase.storage
            .from("avatars")
            .createSignedUrl(data.avatar_url, 3600);
          if (active) setAvatarUrl(signed.data?.signedUrl ?? null);
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  async function handleUpload(file: File) {
    if (!user) return;
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    setAvatarPath(path);
    const signed = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    setAvatarUrl(signed.data?.signedUrl ?? null);
    toast.success("Foto carregada");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName.trim() || null,
      avatar_url: avatarPath,
      preferences: prefs,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Perfil atualizado");
    navigate({ to: "/perfil" });
  }

  return (
    <Screen>
      <div className="flex flex-col items-center">
        <Emblema className="h-14" />
        <h2 className="mt-3 font-display text-3xl text-primary">EDITAR PERFIL</h2>
        <Ornament className="mt-2 w-full" />
      </div>

      {loading ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <form className="mt-6 space-y-5" onSubmit={handleSave}>
          <div className="parchment-card flex flex-col items-center p-5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full wine-surface text-2xl text-primary-foreground ring-2 ring-gold"
              aria-label="Trocar foto de perfil"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Sua foto de perfil" className="h-full w-full object-cover" />
              ) : (
                (fullName || user?.email || "?").charAt(0).toUpperCase()
              )}
              <span className="absolute bottom-0 w-full bg-primary/70 py-1">
                <Camera className="mx-auto h-4 w-4" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
              }}
            />
            <p className="mt-3 text-xs text-muted-foreground">Toque na foto para trocar</p>
          </div>

          <label className="block">
            <span className="font-display text-sm tracking-[0.14em] text-ink">NOME</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              className="mt-2 w-full rounded-xl border border-gold/60 bg-card px-4 py-3 text-base outline-none"
            />
          </label>

          <div className="parchment-card space-y-4 p-5">
            <p className="font-display text-sm tracking-[0.14em] text-ink">PREFERÊNCIAS</p>
            {(
              [
                ["lembretes", "Receber lembretes de retorno"],
                ["resumoSemanal", "Resumo semanal por e-mail"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-4 text-sm">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                  className="h-5 w-5 accent-[hsl(var(--primary))]"
                />
              </label>
            ))}
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Tema preferido</span>
              <select
                value={prefs.tema}
                onChange={(e) => setPrefs((p) => ({ ...p, tema: e.target.value as Prefs["tema"] }))}
                className="rounded-lg border border-gold/60 bg-card px-3 py-2"
              >
                <option value="claro">Claro</option>
                <option value="escuro">Escuro</option>
              </select>
            </label>
          </div>

          <WineButton type="submit">
            <Save className="h-5 w-5" />
            {saving ? "SALVANDO..." : "SALVAR"}
          </WineButton>
          <OutlineButton to="/perfil">CANCELAR</OutlineButton>
        </form>
      )}

      <Ornament className="mt-6" />
    </Screen>
  );
}
