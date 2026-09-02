import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import type { IntelligenceItem } from "@/lib/intelligence/types";
import type { DataVersion } from "@/lib/intelligence/data-version";

export type ItemEstado = "pendente" | "confirmado" | "descartado";

export function NaturezaTag({ item }: { item: IntelligenceItem }) {
  const fato = item.natureza === "fact";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[9px] tracking-[0.16em] transition-all duration-200 ${
        fato
          ? "border-primary/50 text-primary hover:border-primary hover:hover:bg-primary/10"
          : "border-gold/60 text-gold hover:border-gold hover:bg-gold/10"
      }`}
    >
      {fato ? "REGISTRADO" : `INTERPRETAÇÃO${item.confianca ? ` · ${item.confianca}` : ""}`}
    </span>
  );
}

export type ItemAcao = "confirmar" | "editar" | "descartar";

export type ItemAcaoHandler = (
  item: IntelligenceItem,
  acao: ItemAcao,
  contexto: { sectionKey: string; nota?: string },
) => void;

export function ItemLinha({
  item,
  acoes = false,
  sectionKey = "",
  onAcao,
}: {
  item: IntelligenceItem;
  acoes?: boolean;
  sectionKey?: string;
  onAcao?: ItemAcaoHandler;
}) {
  const [estado, setEstado] = useState<ItemEstado>("pendente");
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState("");

  if (estado === "descartado") return null;

  return (
    <li className="group rounded-lg border-t border-gold/20 px-2 py-2.5 first:border-t-0 transition-all duration-200 hover:bg-gold/5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
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
        <div className="shrink-0">
          <NaturezaTag item={item} />
        </div>
      </div>

      {acoes && (
        <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            type="button"
            onClick={() => {
              setEstado("confirmado");
              onAcao?.(item, "confirmar", { sectionKey });
            }}
            aria-label="Confirmar"
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] tracking-[0.14em] transition-all duration-200 ${
              estado === "confirmado"
                ? "border-primary bg-primary text-primary-foreground scale-95 shadow-sm"
                : "border-primary/40 text-primary hover:border-primary hover:bg-primary/15 hover:scale-[1.03] hover:shadow-sm"
            }`}
          >
            <Check className="h-3 w-3" /> CONFIRMAR
          </button>
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            aria-label="Editar"
            className="flex items-center gap-1 rounded-full border border-gold/60 px-2.5 py-1 text-[10px] tracking-[0.14em] text-gold transition-all duration-200 hover:border-gold hover:bg-gold/15 hover:scale-[1.03] hover:shadow-sm"
          >
            <Pencil className="h-3 w-3" /> EDITAR
          </button>
          <button
            type="button"
            onClick={() => {
              setEstado("descartado");
              onAcao?.(item, "descartar", { sectionKey });
            }}
            aria-label="Descartar"
            className="flex items-center gap-1 rounded-full border border-muted-foreground/40 px-2.5 py-1 text-[10px] tracking-[0.14em] text-muted-foreground transition-all duration-200 hover:border-destructive/70 hover:text-destructive hover:bg-destructive/10 hover:scale-[1.03] hover:shadow-sm"
          >
            <X className="h-3 w-3" /> DESCARTAR
          </button>
        </div>
      )}

      {acoes && editando && (
        <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            rows={2}
            placeholder="Anotação desta leitura (não altera o histórico da cliente)"
            className="w-full rounded-lg border border-gold/40 bg-card p-2 text-sm text-ink transition-all duration-200 focus:border-gold/70 focus:ring-1 focus:ring-gold/30 focus:outline-none"
          />
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-[10px] text-muted-foreground">
              A anotação vale apenas para esta leitura. O histórico registrado não é alterado.
            </p>
            <button
              type="button"
              disabled={!nota.trim()}
              onClick={() => {
                onAcao?.(item, "editar", { sectionKey, nota: nota.trim() });
                setEditando(false);
              }}
              className="shrink-0 rounded-full border border-gold/70 px-2.5 py-1 text-[10px] tracking-[0.14em] text-gold transition-all duration-200 hover:border-gold hover:bg-gold/15 hover:scale-[1.03] hover:shadow-sm disabled:opacity-40"
            >
              SALVAR NA TRILHA
            </button>
          </div>
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
  sectionKey = "",
  onAcao,
}: {
  titulo: string;
  descricao: string;
  itens: IntelligenceItem[];
  vazio: string;
  acoes?: boolean;
  sectionKey?: string;
  onAcao?: ItemAcaoHandler;
}) {
  return (
    <section className="parchment-card p-4 transition-all duration-300 hover:shadow-[0_12px_40px_-12px_oklch(0.25_0.05_40_/_0.6)] hover:border-gold/60 animate-in fade-in slide-in-from-bottom-3">
      <h3 className="font-display text-sm tracking-[0.22em] text-primary">{titulo}</h3>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{descricao}</p>
      {itens.length === 0 ? (
        <p className="mt-3 text-sm italic text-muted-foreground">{vazio}</p>
      ) : (
        <ul className="mt-2">
          {itens.map((i) => (
            i.highlight ? (
              <InsightCard
                key={i.id}
                item={i}
                acoes={acoes}
                sectionKey={sectionKey}
                onAcao={onAcao}
              />
            ) : (
              <ItemLinha
                key={i.id}
                item={i}
                acoes={acoes}
                sectionKey={sectionKey}
                {...(onAcao ? { onAcao } : {})}
              />
            )
          ))}
        </ul>
      )}
    </section>
  );
}

/** Cartão de destaque visual para itens INSIGHT da seção PATTERN. */
export function InsightCard({
  item,
  acoes = false,
  sectionKey = "",
  onAcao,
}: {
  item: IntelligenceItem;
  acoes?: boolean;
  sectionKey?: string;
  onAcao?: ItemAcaoHandler;
}) {
  const [estado, setEstado] = useState<ItemEstado>("pendente");
  if (estado === "descartado") return null;

  const confiancaLabel: Record<string, string> = { alta: "HIGH", media: "MEDIUM", baixa: "LOW" };
  const confiancaColor: Record<string, string> = {
    alta: "border-primary/60 text-primary",
    media: "border-gold/60 text-gold",
    baixa: "border-muted-foreground/40 text-muted-foreground",
  };
  const badgeClass = confiancaColor[item.confianca ?? "media"];
  const badgeLabel = item.confianca ? confiancaLabel[item.confianca] : "MEDIUM";

  return (
    <li className="rounded-xl border-2 border-gold/60 bg-gold/5 px-4 py-3.5 transition-all duration-300 hover:border-gold hover:shadow-[0_8px_30px_-8px_oklch(0.84_0.11_88_/_0.5)] animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-gold">◈</span>
            <span className="rounded-full border border-gold/60 bg-gold/10 px-2.5 py-1 font-display text-[11px] tracking-[0.2em] text-gold">
              INSIGHT
            </span>
            <span className={`rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] ${badgeClass}`}>
              {badgeLabel}
            </span>
          </div>
          <p className="text-sm font-medium leading-snug text-ink">{item.valor}</p>
          {item.evidencias.length > 0 && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {item.evidencias.length} registro{item.evidencias.length !== 1 ? "s" : ""} encontrado{item.evidencias.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {acoes && (
        <div className="mt-3 flex items-center gap-2 border-t border-gold/30 pt-3">
          <button
            type="button"
            onClick={() => {
              setEstado("confirmado");
              onAcao?.(item, "confirmar", { sectionKey });
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] tracking-[0.14em] transition-all duration-200 ${
              estado === "confirmado"
                ? "border-primary bg-primary text-primary-foreground scale-95 shadow-sm"
                : "border-primary/40 text-primary hover:border-primary hover:bg-primary/15 hover:scale-[1.03] hover:shadow-sm"
            }`}
          >
            <Check className="h-3 w-3" /> CONFIRM
          </button>
          <button
            type="button"
            onClick={() => {
              setEstado("descartado");
              onAcao?.(item, "descartar", { sectionKey });
            }}
            className="flex items-center gap-1.5 rounded-full border border-muted-foreground/40 px-3.5 py-1.5 text-[10px] tracking-[0.14em] text-muted-foreground transition-all duration-200 hover:border-destructive/70 hover:text-destructive hover:bg-destructive/10 hover:scale-[1.03] hover:shadow-sm"
          >
            <X className="h-3 w-3" /> DISMISS
          </button>
        </div>
      )}
    </li>
  );
}

/** Cartão que mostra a data_version usada na leitura e o que a compõe. */
export function DataVersionCard({ versao }: { versao: DataVersion }) {
  return (
    <section className="parchment-card p-4 transition-all duration-300 hover:shadow-[0_12px_40px_-12px_oklch(0.25_0.05_40_/_0.6)] hover:border-gold/60 animate-in fade-in slide-in-from-bottom-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-sm tracking-[0.22em] text-primary">VERSÃO DOS DADOS</h3>
        <span className="rounded-full border border-gold/60 px-2 py-0.5 font-mono text-[10px] text-gold">
          #{versao.hash}
        </span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        {[
          ["Atendimentos", String(versao.atendimentos)],
          ["Último serviço", versao.ultimoServico ?? "—"],
          [
            "Cadastro atualizado",
            versao.clienteAtualizadoEm
              ? new Date(versao.clienteAtualizadoEm).toLocaleString("pt-BR")
              : "—",
          ],
          ["Gerado em", new Date(versao.geradoEm).toLocaleString("pt-BR")],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="tracking-[0.14em] text-muted-foreground">{k?.toUpperCase()}</dt>
            <dd className="text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
        O código da versão depende apenas dos dados registrados — a mesma janela de dados sempre
        gera o mesmo código.
      </p>
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
        className="mt-1 w-full rounded-full border border-gold/50 bg-card px-4 py-3 text-sm text-ink transition-all duration-200 hover:border-gold/70 focus:border-gold/70 focus:outline-none focus:ring-1 focus:ring-gold/30 cursor-pointer"
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

/** Declarações explícitas da profissional — preenchem lacunas sem tocar no histórico. */
export function DeclaracoesCard({
  itens,
  onAdicionar,
  onArquivar,
  salvando = false,
}: {
  itens: { id: string; kind: string; label: string; content: string }[];
  onAdicionar: (d: { kind: "preference" | "goal"; label: string; content: string }) => void;
  onArquivar: (id: string) => void;
  salvando?: boolean;
}) {
  const [kind, setKind] = useState<"preference" | "goal">("preference");
  const [label, setLabel] = useState("");
  const [content, setContent] = useState("");

  return (
    <section className="parchment-card p-4 transition-all duration-300 hover:shadow-[0_12px_40px_-12px_oklch(0.25_0.05_40_/_0.6)] hover:border-gold/60 animate-in fade-in slide-in-from-bottom-3">
      <h3 className="font-display text-sm tracking-[0.22em] text-primary">
        DECLARADO PELA PROFISSIONAL
      </h3>
      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        Preferências e objetivos que você declara explicitamente. Não alteram os capítulos
        históricos registrados.
      </p>

      {itens.length > 0 && (
        <ul className="mt-2">
          {itens.map((d) => (
            <li
              key={d.id}
              className="flex items-start justify-between gap-2 border-t border-gold/20 py-2.5 first:border-t-0"
            >
              <div className="min-w-0 flex-1">
                <p className="font-display text-[11px] tracking-[0.14em] text-muted-foreground">
                  {d.kind === "goal" ? "OBJETIVO" : "PREFERÊNCIA"} · {d.label}
                </p>
                <p className="text-sm leading-snug text-ink">{d.content}</p>
              </div>
              <button
                type="button"
                onClick={() => onArquivar(d.id)}
                aria-label="Arquivar declaração"
                className="shrink-0 rounded-full border border-muted-foreground/40 px-2.5 py-1 text-[10px] tracking-[0.14em] text-muted-foreground transition-all duration-200 hover:border-destructive/70 hover:text-destructive hover:bg-destructive/10 hover:scale-[1.03] hover:shadow-sm"
              >
                ARQUIVAR
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 space-y-2">
        <div className="flex gap-2">
          {(["preference", "goal"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full border px-3 py-1 text-[10px] tracking-[0.14em] transition-all duration-200 ${
                kind === k
                  ? "border-gold bg-gold/15 text-gold shadow-sm"
                  : "border-gold/40 text-muted-foreground hover:border-gold/60 hover:text-gold hover:bg-gold/10 hover:scale-[1.03]"
              }`}
            >
              {k === "preference" ? "PREFERÊNCIA" : "OBJETIVO"}
            </button>
          ))}
        </div>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Título curto (ex.: Evitar química)"
          className="w-full rounded-lg border border-gold/40 bg-card p-2.5 text-sm text-ink transition-all duration-200 focus:border-gold/70 focus:outline-none focus:ring-1 focus:ring-gold/30 placeholder:text-muted-foreground"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder="Informação declarada explicitamente"
          className="w-full rounded-lg border border-gold/40 bg-card p-2.5 text-sm text-ink transition-all duration-200 focus:border-gold/70 focus:outline-none focus:ring-1 focus:ring-gold/30 placeholder:text-muted-foreground resize-none"
        />
        <button
          type="button"
          disabled={!label.trim() || !content.trim() || salvando}
          onClick={() => {
            onAdicionar({ kind, label: label.trim(), content: content.trim() });
            setLabel("");
            setContent("");
          }}
          className="w-full rounded-full wine-surface px-6 py-3.5 font-display text-xs tracking-[0.14em] text-primary-foreground ring-1 ring-gold/50 transition-all duration-200 hover:brightness-110 hover:scale-[1.01] hover:shadow-lg active:scale-[0.98] disabled:opacity-40"
        >
          {salvando ? "SALVANDO..." : "DECLARAR INFORMAÇÃO"}
        </button>
      </div>
    </section>
  );
}
