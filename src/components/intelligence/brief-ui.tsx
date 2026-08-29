import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import type { IntelligenceItem } from "@/lib/intelligence/types";

export type ItemEstado = "pendente" | "confirmado" | "descartado";

export function NaturezaTag({ item }: { item: IntelligenceItem }) {
  const fato = item.natureza === "fact";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[9px] tracking-[0.16em] ${
        fato ? "border-primary/50 text-primary" : "border-gold text-gold"
      }`}
    >
      {fato ? "REGISTRADO" : `INTERPRETAÇÃO${item.confianca ? ` · ${item.confianca}` : ""}`}
    </span>
  );
}

export function ItemLinha({
  item,
  acoes = false,
}: {
  item: IntelligenceItem;
  acoes?: boolean;
}) {
  const [estado, setEstado] = useState<ItemEstado>("pendente");
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState("");

  if (estado === "descartado") return null;

  return (
    <li className="border-t border-gold/20 py-2.5 first:border-t-0">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-[11px] tracking-[0.14em] text-muted-foreground">
            {item.rotulo}
          </p>
          <p className="text-sm leading-snug text-ink">{item.valor}</p>
          {nota && (
            <p className="mt-1 text-xs italic text-muted-foreground">
              Nota da profissional: {nota}
            </p>
          )}
        </div>
        <NaturezaTag item={item} />
      </div>

      {acoes && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEstado("confirmado")}
            aria-label="Confirmar"
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] tracking-[0.14em] ${
              estado === "confirmado"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/40 text-primary"
            }`}
          >
            <Check className="h-3 w-3" /> CONFIRMAR
          </button>
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            aria-label="Editar"
            className="flex items-center gap-1 rounded-full border border-gold/60 px-2.5 py-1 text-[10px] tracking-[0.14em] text-gold"
          >
            <Pencil className="h-3 w-3" /> EDITAR
          </button>
          <button
            type="button"
            onClick={() => setEstado("descartado")}
            aria-label="Descartar"
            className="flex items-center gap-1 rounded-full border border-muted-foreground/40 px-2.5 py-1 text-[10px] tracking-[0.14em] text-muted-foreground"
          >
            <X className="h-3 w-3" /> DESCARTAR
          </button>
        </div>
      )}

      {acoes && editando && (
        <div className="mt-2">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            placeholder="Anotação desta leitura (não altera o histórico da cliente)"
            className="w-full rounded-lg border border-gold/40 bg-card p-2 text-sm text-ink"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            A anotação vale apenas para esta leitura. O histórico registrado não é alterado.
          </p>
        </div>
      )}
    </li>
  );
}

export function SectionCard({
  titulo,
  descricao,
  itens,
  vazio,
  acoes = false,
}: {
  titulo: string;
  descricao: string;
  itens: IntelligenceItem[];
  vazio: string;
  acoes?: boolean;
}) {
  return (
    <section className="parchment-card p-4">
      <h3 className="font-display text-sm tracking-[0.22em] text-primary">{titulo}</h3>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{descricao}</p>
      {itens.length === 0 ? (
        <p className="mt-3 text-sm italic text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="mt-2">
          {itens.map((i) => (
            <ItemLinha key={i.id} item={i} acoes={acoes} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function ClienteSelect({
  valor,
  opcoes,
  onChange,
}: {
  valor: string;
  opcoes: { id: string; nome: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-display text-[11px] tracking-[0.18em] text-muted-foreground">
        CLIENTE
      </span>
      <select
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-full border border-gold/50 bg-card px-4 py-3 text-sm text-ink"
      >
        {opcoes.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
    </label>
  );
}
