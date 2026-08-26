import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, FileText, Plus, ShieldAlert, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Emblema, Ornament, Screen, WineButton } from "@/components/passport/ui";
import { useRequireAuth, useRoles } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — Passaporte Capilar" },
      {
        name: "description",
        content: "Gerencie clientes, conteúdos e métricas do Passaporte Capilar em um só painel.",
      },
      { property: "og:title", content: "Painel administrativo — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Clientes, conteúdos e métricas de uso, restrito a administradores.",
      },
    ],
  }),
  component: Admin,
});

type Aba = "clientes" | "conteudos" | "metricas";

function Admin() {
  useRequireAuth();
  const { isAdmin, isLoading } = useRoles();
  const [aba, setAba] = useState<Aba>("clientes");

  if (isLoading) {
    return (
      <Screen>
        <p className="mt-16 text-center text-sm text-muted-foreground">Verificando permissões...</p>
      </Screen>
    );
  }

  if (!isAdmin) {
    return (
      <Screen>
        <div className="mt-16 flex flex-col items-center text-center">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl text-primary">ACESSO RESTRITO</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área é exclusiva para administradores do Passaporte Capilar.
          </p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className="flex flex-col items-center">
        <Emblema className="h-14" />
        <h1 className="mt-3 font-display text-3xl text-primary">PAINEL ADMIN</h1>
        <Ornament className="mt-2 w-full" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {(
          [
            ["clientes", "CLIENTES", Users],
            ["conteudos", "CONTEÚDOS", FileText],
            ["metricas", "MÉTRICAS", BarChart3],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setAba(key)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 font-display text-[11px] tracking-[0.12em] transition-colors ${
              aba === key
                ? "wine-surface border-gold text-primary-foreground"
                : "border-gold/50 bg-card text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {aba === "clientes" && <ClientesTab />}
        {aba === "conteudos" && <ConteudosTab />}
        {aba === "metricas" && <MetricasTab />}
      </div>

      <Ornament className="mt-8" />
    </Screen>
  );
}

function ClientesTab() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [hairType, setHairType] = useState("");
  const [chapter, setChapter] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("clients").insert({
        name: name.trim(),
        hair_type: hairType.trim() || null,
        chapter: chapter.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      setHairType("");
      setChapter("");
      toast.success("Cliente adicionada");
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cliente removida");
      qc.invalidateQueries({ queryKey: ["admin", "clients"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <form
        className="parchment-card space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) add.mutate();
        }}
      >
        <p className="font-display text-sm tracking-[0.14em] text-ink">NOVA CLIENTE</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          required
          className="w-full rounded-lg border border-gold/60 bg-card px-3 py-2 text-sm outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            value={hairType}
            onChange={(e) => setHairType(e.target.value)}
            placeholder="Tipo de cabelo"
            className="w-full rounded-lg border border-gold/60 bg-card px-3 py-2 text-sm outline-none"
          />
          <input
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="Capítulo"
            className="w-full rounded-lg border border-gold/60 bg-card px-3 py-2 text-sm outline-none"
          />
        </div>
        <WineButton type="submit">
          <Plus className="h-4 w-4" />
          {add.isPending ? "SALVANDO..." : "ADICIONAR"}
        </WineButton>
      </form>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {data.map((c) => (
            <li key={c.id} className="parchment-card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-display text-base text-ink">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.hair_type ?? "—"} · {c.chapter ?? "sem capítulo"} · {c.progress}%
                </p>
              </div>
              <button
                type="button"
                aria-label={`Remover ${c.name}`}
                onClick={() => remove.mutate(c.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
          {data.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Nenhuma cliente cadastrada.</p>
          )}
        </ul>
      )}
    </div>
  );
}

function ConteudosTab() {
  const qc = useQueryClient();
  const [area, setArea] = useState("comunicacao");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("content_items")
        .insert({ area, title: title.trim(), body: body.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setBody("");
      toast.success("Conteúdo criado");
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase.from("content_items").update({ published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("content_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <form
        className="parchment-card space-y-3 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (title.trim()) add.mutate();
        }}
      >
        <p className="font-display text-sm tracking-[0.14em] text-ink">NOVO CONTEÚDO</p>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full rounded-lg border border-gold/60 bg-card px-3 py-2 text-sm"
        >
          <option value="comunicacao">Comunicação</option>
          <option value="brand-studio">Brand Studio</option>
        </select>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
          required
          className="w-full rounded-lg border border-gold/60 bg-card px-3 py-2 text-sm outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Texto"
          rows={3}
          className="w-full rounded-lg border border-gold/60 bg-card px-3 py-2 text-sm outline-none"
        />
        <WineButton type="submit">
          <Plus className="h-4 w-4" />
          {add.isPending ? "SALVANDO..." : "CRIAR"}
        </WineButton>
      </form>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <ul className="space-y-2">
          {data.map((item) => (
            <li key={item.id} className="parchment-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-ink">{item.title}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {item.area}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${item.title}`}
                  onClick={() => remove.mutate(item.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {item.body && <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>}
              <label className="mt-3 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={item.published}
                  onChange={(e) =>
                    togglePublish.mutate({ id: item.id, published: e.target.checked })
                  }
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                Publicado
              </label>
            </li>
          ))}
          {data.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">Nenhum conteúdo ainda.</p>
          )}
        </ul>
      )}
    </div>
  );
}

function MetricasTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("event, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      const counts = new Map<string, number>();
      data.forEach((e) => counts.set(e.event, (counts.get(e.event) ?? 0) + 1));
      const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return {
        total: data.length,
        semana: data.filter((e) => new Date(e.created_at).getTime() >= since).length,
        porEvento: [...counts.entries()].sort((a, b) => b[1] - a[1]),
      };
    },
  });

  if (isLoading) return <p className="text-center text-sm text-muted-foreground">Carregando...</p>;
  if (error)
    return <p className="text-center text-sm text-destructive">{(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="parchment-card p-4 text-center">
          <p className="font-display text-3xl text-primary">{data!.total}</p>
          <p className="text-xs tracking-[0.14em] text-muted-foreground">EVENTOS</p>
        </div>
        <div className="parchment-card p-4 text-center">
          <p className="font-display text-3xl text-primary">{data!.semana}</p>
          <p className="text-xs tracking-[0.14em] text-muted-foreground">ÚLTIMOS 7 DIAS</p>
        </div>
      </div>
      <ul className="space-y-2">
        {data!.porEvento.map(([event, count]) => (
          <li
            key={event}
            className="parchment-card flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="text-ink">{event}</span>
            <span className="font-display text-primary">{count}</span>
          </li>
        ))}
        {data!.porEvento.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">Sem eventos registrados ainda.</p>
        )}
      </ul>
    </div>
  );
}
