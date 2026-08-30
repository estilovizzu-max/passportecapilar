import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Screen, Ornament } from "@/components/passport/ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { usePassaportes } from "@/lib/passport-api";
import {
  baixarCsv,
  reviewsParaCsv,
  useReviews,
  reviewActionLabel,
  type ReviewAction,
  type ReviewRow,
} from "@/lib/intelligence/reviews-api";
import { compararDataVersion, resumoDataVersion } from "@/lib/intelligence/data-version";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Trilha de Auditoria — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Consulte, filtre e exporte as revisões do Intelligence Brief por cliente e período, com a versão dos dados usada em cada leitura.",
      },
      { property: "og:title", content: "Trilha de Auditoria" },
      {
        property: "og:description",
        content: "Histórico completo de confirmações, edições e descartes do Intelligence Brief.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auditoria,
});

const inputCls =
  "mt-1 w-full rounded-full border border-gold/50 bg-card px-4 py-2.5 text-sm text-ink";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-display text-[11px] tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Auditoria() {
  useRequireAuth();
  const { data: passaportes } = usePassaportes();
  const [clientId, setClientId] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [action, setAction] = useState<ReviewAction | "">("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const { data: reviews, isLoading } = useReviews({
    ...(clientId ? { clientId } : {}),
    ...(de ? { de } : {}),
    ...(ate ? { ate } : {}),
    ...(action ? { action } : {}),
  });

  const nomePorCliente = useMemo(
    () =>
      Object.fromEntries((passaportes ?? []).map((p) => [p.cliente.id, p.cliente.name])) as Record<
        string,
        string
      >,
    [passaportes],
  );

  const rows = reviews ?? [];

  /** Versões distintas (por hash) presentes na trilha filtrada. */
  const versoes = useMemo(() => {
    const map = new Map<string, ReviewRow>();
    for (const r of rows) {
      if (r.data_version?.hash && !map.has(r.data_version.hash)) map.set(r.data_version.hash, r);
    }
    return [...map.values()];
  }, [rows]);

  const diff = useMemo(() => {
    if (!a || !b || a === b) return null;
    const va = versoes.find((r) => r.data_version.hash === a)?.data_version;
    const vb = versoes.find((r) => r.data_version.hash === b)?.data_version;
    if (!va || !vb) return null;
    return compararDataVersion(va, vb).filter((l) => l.tipo !== "igual");
  }, [a, b, versoes]);

  return (
    <Screen back backTo="/intelligence">
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">◈</span>
        <h2 className="font-display text-xl tracking-[0.08em] text-primary">TRILHA DE AUDITORIA</h2>
        <span className="text-gold">◈</span>
      </div>
      <p className="mt-2 text-center text-xs leading-snug text-muted-foreground">
        Registro imutável de cada revisão do Intelligence Brief, com a versão dos dados usada.
      </p>
      <Ornament className="mt-3" />

      <div className="mt-4 space-y-3">
        <section className="parchment-card space-y-3 p-4">
          <Campo label="CLIENTE">
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputCls}>
              <option value="">Todas</option>
              {(passaportes ?? []).map((p) => (
                <option key={p.cliente.id} value={p.cliente.id}>
                  {p.cliente.name}
                </option>
              ))}
            </select>
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="DE">
              <input type="date" value={de} onChange={(e) => setDe(e.target.value)} className={inputCls} />
            </Campo>
            <Campo label="ATÉ">
              <input type="date" value={ate} onChange={(e) => setAte(e.target.value)} className={inputCls} />
            </Campo>
          </div>
          <Campo label="AÇÃO">
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as ReviewAction | "")}
              className={inputCls}
            >
              <option value="">Todas</option>
              <option value="confirmar">Confirmadas</option>
              <option value="editar">Editadas</option>
              <option value="descartar">Descartadas</option>
            </select>
          </Campo>
          <button
            type="button"
            disabled={rows.length === 0}
            onClick={() =>
              baixarCsv(
                `trilha-auditoria-${new Date().toISOString().slice(0, 10)}.csv`,
                reviewsParaCsv(rows, nomePorCliente),
              )
            }
            className="w-full rounded-full border border-gold/70 bg-card px-6 py-3 font-display text-sm tracking-[0.14em] text-primary disabled:opacity-40"
          >
            EXPORTAR CSV ({rows.length})
          </button>
        </section>

        <section className="parchment-card space-y-3 p-4">
          <h3 className="font-display text-sm tracking-[0.22em] text-primary">
            COMPARAR VERSÕES DOS DADOS
          </h3>
          {versoes.length < 2 ? (
            <p className="text-sm italic text-muted-foreground">
              É preciso ao menos duas versões registradas para comparar.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Campo label="VERSÃO ANTERIOR">
                  <select value={a} onChange={(e) => setA(e.target.value)} className={inputCls}>
                    <option value="">—</option>
                    {versoes.map((r) => (
                      <option key={r.data_version.hash} value={r.data_version.hash}>
                        #{r.data_version.hash} · {r.data_version.geradoEm.slice(0, 10)}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo label="VERSÃO ATUAL">
                  <select value={b} onChange={(e) => setB(e.target.value)} className={inputCls}>
                    <option value="">—</option>
                    {versoes.map((r) => (
                      <option key={r.data_version.hash} value={r.data_version.hash}>
                        #{r.data_version.hash} · {r.data_version.geradoEm.slice(0, 10)}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>
              {diff && (
                <ul className="mt-1">
                  {diff.length === 0 ? (
                    <li className="text-sm italic text-muted-foreground">
                      Nenhuma diferença entre as duas versões.
                    </li>
                  ) : (
                    diff.map((l) => (
                      <li
                        key={`${l.secao}-${l.rotulo}-${l.tipo}`}
                        className="border-t border-gold/20 py-2 first:border-t-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-display text-[11px] tracking-[0.14em] text-muted-foreground">
                            {l.secao} · {l.rotulo}
                          </p>
                          <span className="rounded-full border border-gold/60 px-2 py-0.5 text-[9px] tracking-[0.16em] text-gold">
                            {l.tipo.toUpperCase()}
                          </span>
                        </div>
                        {l.anterior && (
                          <p className="text-sm leading-snug text-muted-foreground line-through">
                            {l.anterior}
                          </p>
                        )}
                        {l.atual && <p className="text-sm leading-snug text-ink">{l.atual}</p>}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </>
          )}
        </section>

        <section className="parchment-card p-4">
          <h3 className="font-display text-sm tracking-[0.22em] text-primary">REVISÕES</h3>
          {isLoading && <p className="mt-3 text-sm text-muted-foreground">Carregando…</p>}
          {!isLoading && rows.length === 0 && (
            <p className="mt-3 text-sm italic text-muted-foreground">
              Nenhuma revisão registrada para este filtro.
            </p>
          )}
          <ul className="mt-2">
            {rows.map((r) => (
              <li key={r.id} className="border-t border-gold/20 py-2.5 first:border-t-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-display text-[11px] tracking-[0.14em] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("pt-BR")} ·{" "}
                      {nomePorCliente[r.client_id] ?? r.data_version?.clienteNome ?? "—"}
                    </p>
                    <p className="text-sm leading-snug text-ink">
                      {r.section_key.toUpperCase()} · {r.item_label} — {r.item_value}
                    </p>
                    {r.note && (
                      <p className="mt-1 text-xs italic text-muted-foreground">Nota: {r.note}</p>
                    )}
                    {r.data_version && (
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        #{r.data_version.hash} · {resumoDataVersion(r.data_version)}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full border border-primary/50 px-2 py-0.5 text-[9px] tracking-[0.16em] text-primary">
                    {reviewActionLabel[r.action as ReviewAction] ?? r.action.toUpperCase()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <p className="pb-2 text-center text-[11px] leading-snug text-muted-foreground">
          A trilha é somente leitura: nenhum registro pode ser alterado ou apagado.
        </p>
      </div>
    </Screen>
  );
}
