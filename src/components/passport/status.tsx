import type { Status } from "@/lib/passport-api";

const cores: Record<Status, string> = {
  risco: "border-destructive/60 text-destructive",
  janela: "border-gold text-gold",
  acompanhamento: "border-primary/50 text-primary",
  "sem-historico": "border-muted-foreground/40 text-muted-foreground",
};

const rotulos: Record<Status, string> = {
  risco: "EM RISCO",
  janela: "JANELA IDEAL",
  acompanhamento: "EM ACOMPANHAMENTO",
  "sem-historico": "SEM HISTÓRICO",
};

export function StatusBadge({ status, dias }: { status: Status; dias?: number | null }) {
  const detalhe =
    dias == null
      ? ""
      : dias < 0
        ? ` · ${Math.abs(dias)}d atrasada`
        : dias === 0
          ? " · hoje"
          : ` · em ${dias}d`;
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] tracking-[0.14em] ${cores[status]}`}
    >
      {rotulos[status]}
      {detalhe}
    </span>
  );
}
