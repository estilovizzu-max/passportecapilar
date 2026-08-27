import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight, Plus, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Ornament, Screen, WineButton } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/passport/status";
import { formatData, useCriarCliente, usePassaportes } from "@/lib/passport-api";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — Passaporte Capilar" },
      {
        name: "description",
        content: "Sua base de clientes com ciclo, último atendimento e próximo capítulo definido.",
      },
      { property: "og:title", content: "Clientes — Passaporte Capilar" },
      {
        property: "og:description",
        content: "Base de clientes com ciclo, histórico e próximo capítulo.",
      },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  useRequireAuth();
  const { data, isLoading } = usePassaportes();
  const criar = useCriarCliente();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    cycle_days: "42",
    current_procedure: "",
  });

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return (data ?? []).filter((p) => p.cliente.name.toLowerCase().includes(t));
  }, [data, busca]);

  return (
    <Screen>
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">≈</span>
        <h2 className="font-display text-2xl tracking-[0.12em] text-primary">CLIENTES</h2>
        <span className="text-gold">≈</span>
      </div>

      <label className="mt-5 flex items-center gap-3 rounded-full border border-gold/60 bg-card px-4 py-2.5">
        <Search className="h-5 w-5 text-gold" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="mt-4">
        <WineButton onClick={() => setAberto((v) => !v)}>
          <Plus className="h-5 w-5" /> NOVA CLIENTE
        </WineButton>
      </div>

      {aberto && (
        <form
          className="mt-4 space-y-3 parchment-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim()) return;
            criar.mutate(
              {
                name: form.name.trim(),
                phone: form.phone.trim(),
                cycle_days: Number(form.cycle_days) || 42,
                current_procedure: form.current_procedure.trim(),
              },
              {
                onSuccess: () => {
                  toast.success("Cliente adicionada ao passaporte");
                  setForm({ name: "", phone: "", cycle_days: "42", current_procedure: "" });
                  setAberto(false);
                },
                onError: (err) => toast.error(err.message),
              },
            );
          }}
        >
          <Campo
            label="NOME"
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <Campo
            label="WHATSAPP (COM DDD)"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            placeholder="11999998888"
          />
          <Campo
            label="CICLO ESPERADO (DIAS)"
            value={form.cycle_days}
            onChange={(v) => setForm((f) => ({ ...f, cycle_days: v }))}
            type="number"
          />
          <Campo
            label="PRÓXIMO CUIDADO"
            value={form.current_procedure}
            onChange={(v) => setForm((f) => ({ ...f, current_procedure: v }))}
            placeholder="Coloração, hidratação..."
          />
          <button
            type="submit"
            disabled={criar.isPending}
            className="w-full rounded-full wine-surface px-6 py-3 font-display tracking-[0.14em] text-primary-foreground disabled:opacity-60"
          >
            {criar.isPending ? "SALVANDO..." : "SALVAR CLIENTE"}
          </button>
        </form>
      )}

      {isLoading && <p className="mt-6 text-center text-muted-foreground">Carregando base...</p>}

      {!isLoading && lista.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">
          Nenhuma cliente ainda. Comece cadastrando 30 clientes reais.
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {lista.map((p) => (
          <li key={p.cliente.id}>
            <Link
              to="/radar/$clienteId"
              params={{ clienteId: p.cliente.id }}
              className="flex items-center gap-3 parchment-card px-3 py-3"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full wine-surface text-primary-foreground">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-display text-lg text-ink">{p.cliente.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.ultimo ? `${p.ultimo.procedure} · ${formatData(p.ultimo.service_date)}` : "Sem atendimento registrado"}
                </p>
                <div className="mt-1">
                  <StatusBadge status={p.status} dias={p.diasRestantes} />
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gold" />
            </Link>
          </li>
        ))}
      </ul>

      <Ornament className="mt-6" />
    </Screen>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gold/60 bg-card px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-gold"
      />
    </label>
  );
}
