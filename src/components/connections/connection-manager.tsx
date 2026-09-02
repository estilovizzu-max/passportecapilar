import { useState } from "react";
import { Check, Eye, Plus, Search, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

interface Connection {
  id: string;
  client_id: string;
  professional_id: string;
  status: "pending" | "connected" | "declined" | "removed";
  requested_at: string;
  responded_at: string | null;
  removed_at: string | null;
  note: string | null;
  client?: { name: string; phone: string | null };
}

interface ConnectionManagerProps {
  clientId?: string;
  compact?: boolean;
}

export function ConnectionManager({ clientId, compact = false }: ConnectionManagerProps) {
  const { user } = useAuth();
  const [aba, setAba] = useState<"pending" | "connected" | "available">("pending");
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [search, setSearch] = useState("");

  const statusBadge = (status: Connection["status"]) => {
    const map = {
      pending:   { label: "PENDENTE", icon: "⏳", color: "text-yellow-600" },
      connected: { label: "CONECTADA", icon: "✓", color: "text-green-600" },
      declined:  { label: "RECUSADA", icon: "✗", color: "text-red-500" },
      removed:   { label: "REMOVIDA", icon: "⊘", color: "text-muted-foreground" },
    };
    const s = map[status];
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] tracking-[0.14em] ${s.color}`}>
        <span>{s.icon}</span> {s.label}
      </span>
    );
  };

  const pending = connections.filter((c) => c.status === "pending");
  const connected = connections.filter((c) => c.status === "connected");
  const available = connections.filter((c) => c.status === "declined" || c.status === "removed");

  const filteredAvailable = available.filter(
    (c) => c.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function loadConnections() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("professional_connections")
      .select(`*, client:clients(name, phone)`)
      .eq("professional_id", user.id)
      .order("requested_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error("Erro ao carregar conexões"); return; }
    setConnections((data as unknown as Connection[]) ?? []);
  }

  async function respondConnection(id: string, action: "connected" | "declined") {
    setLoading(true);
    const { error } = await supabase
      .from("professional_connections")
      .update({ status: action, responded_at: new Date().toISOString() })
      .eq("id", id);
    setLoading(false);
    if (error) { toast.error("Erro ao responder"); return; }
    toast.success(action === "connected" ? "Conexão aceita" : "Conexão recusada");
    void loadConnections();
  }

  async function removeConnection(id: string) {
    setLoading(true);
    const { error } = await supabase
      .from("professional_connections")
      .update({ status: "removed", removed_at: new Date().toISOString() })
      .eq("id", id);
    setLoading(false);
    if (error) { toast.error("Erro ao remover"); return; }
    toast.success("Conexão removida");
    void loadConnections();
  }

  async function requestConnection(clientId: string) {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("professional_connections")
      .upsert({
        client_id: clientId,
        professional_id: user.id,
        status: "pending",
        requested_at: new Date().toISOString(),
      });
    setLoading(false);
    if (error) { toast.error("Erro ao solicitar"); return; }
    toast.success("Pedido de conexão enviado");
    void loadConnections();
  }

  // Load on mount and when user changes
  useState(() => { void loadConnections(); });

  if (compact) return null;

  return (
    <div className="space-y-4">
      <div className="flex rounded-full border border-gold/60 bg-card p-1">
        {([["pending","PENDENTES"],["connected","CONECTADAS"],["available","DISPONÍVEIS"]] as const).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setAba(k as typeof aba)}
            className={`flex-1 rounded-full py-2 font-display text-xs tracking-[0.12em] transition-colors ${
              aba === k ? "wine-surface text-primary-foreground" : "text-ink"
            }`}
          >
            {l}
            {k === "pending" && pending.length > 0 && ` (${pending.length})`}
            {k === "connected" && connected.length > 0 && ` (${connected.length})`}
          </button>
        ))}
      </div>

      {aba === "pending" && (
        <div className="space-y-2">
          {pending.length === 0 ? (
            <p className="py-6 text-center text-sm italic text-muted-foreground">
              Nenhum pedido pendente.
            </p>
          ) : (
            pending.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gold/40 bg-card p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/70 text-gold">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-base text-ink">{(c.client as unknown as {name:string})?.name ?? "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">Solicitado em {new Date(c.requested_at).toLocaleDateString("pt-BR")}</p>
                </div>
                {statusBadge(c.status)}
                <div className="flex gap-2">
                  <button
                    onClick={() => void respondConnection(c.id, "connected")}
                    disabled={loading}
                    className="rounded-full border border-green-600 p-2 text-green-600 transition-colors hover:bg-green-50"
                    title="Aceitar"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void respondConnection(c.id, "declined")}
                    disabled={loading}
                    className="rounded-full border border-red-500 p-2 text-red-500 transition-colors hover:bg-red-50"
                    title="Recusar"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {aba === "connected" && (
        <div className="space-y-2">
          {connected.length === 0 ? (
            <p className="py-6 text-center text-sm italic text-muted-foreground">
              Nenhuma conexão ativa.
            </p>
          ) : (
            connected.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gold/40 bg-card p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/70 text-gold">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-base text-ink">{(c.client as unknown as {name:string})?.name ?? "Cliente"}</p>
                  <p className="text-xs text-muted-foreground">Conectada desde {new Date(c.responded_at ?? c.requested_at).toLocaleDateString("pt-BR")}</p>
                </div>
                {statusBadge(c.status)}
                <div className="flex gap-2">
                  <button
                    onClick={() => void removeConnection(c.id)}
                    disabled={loading}
                    className="rounded-full border border-muted-foreground p-2 text-muted-foreground transition-colors hover:bg-secondary"
                    title="Remover conexão"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {aba === "available" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-gold/60 bg-card px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente pelo nome..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {filteredAvailable.length === 0 ? (
            <p className="py-6 text-center text-sm italic text-muted-foreground">
              {search ? "Nenhum resultado para esta busca." : "Nenhuma cliente disponível para conexão."}
            </p>
          ) : (
            filteredAvailable.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gold/40 bg-card p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/70 text-gold">
                  <UserRound className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-base text-ink">{(c.client as unknown as {name:string})?.name ?? "Cliente"}</p>
                  {statusBadge(c.status)}
                </div>
                <button
                  onClick={() => void requestConnection(c.client_id)}
                  disabled={loading}
                  className="flex items-center gap-1 rounded-full border border-primary px-3 py-1.5 font-display text-xs tracking-[0.14em] text-primary transition-colors hover:bg-secondary"
                >
                  <Plus className="h-3 w-3" /> SOLICITAR
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
