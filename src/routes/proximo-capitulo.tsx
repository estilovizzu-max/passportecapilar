import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Screen, Ornament } from "@/components/passport/ui";
import { ClienteSelect, SectionCard } from "@/components/intelligence/brief-ui";
import { useRequireAuth } from "@/hooks/useAuth";
import { usePassaportes } from "@/lib/passport-api";
import { construirProximoDestino } from "@/lib/intelligence/brief";

export const Route = createFileRoute("/proximo-capitulo")({
  head: () => ({
    meta: [
      { title: "Próximo Destino — Passaporte Capilar" },
      {
        name: "description",
        content:
          "Leitura da possível direção da jornada baseada no histórico registrado. A decisão final é sempre da profissional.",
      },
      { property: "og:title", content: "Próximo Destino — Passaporte Capilar" },
      {
        property: "og:description",
        content:
          "Os registros disponíveis indicam uma direção possível para a jornada — a profissional decide o próximo capítulo.",
      },
    ],
  }),
  component: ProximoCapitulo,
});

function ProximoCapitulo() {
  useRequireAuth();
  const { data, isLoading } = usePassaportes();
  const [clienteId, setClienteId] = useState("");

  const passaporte = useMemo(() => {
    if (!data?.length) return null;
    return data.find((p) => p.cliente.id === clienteId) ?? data[0]!;
  }, [data, clienteId]);

  const destino = useMemo(
    () => (passaporte ? construirProximoDestino(passaporte) : null),
    [passaporte],
  );

  return (
    <Screen back backTo="/intelligence">
      <div className="flex items-center justify-center gap-3">
        <span className="text-gold">◈</span>
        <h2 className="font-display text-xl tracking-[0.08em] text-primary">
          NEXT DESTINATION
        </h2>
        <span className="text-gold">◈</span>
      </div>
      <p className="mt-2 text-center text-xs leading-snug text-muted-foreground">
        O sistema lê o histórico e apresenta uma direção possível. O procedimento final é
        decidido pela profissional.
      </p>
      <Ornament className="mt-3" />

      {isLoading && <p className="mt-6 text-center text-sm text-muted-foreground">Carregando…</p>}

      {!isLoading && (!data || data.length === 0) && (
        <p className="mt-6 text-center text-sm italic text-muted-foreground">
          Informação insuficiente para uma leitura segura.
        </p>
      )}

      {passaporte && destino && (
        <div className="mt-4 space-y-4">
          <ClienteSelect
            valor={passaporte.cliente.id}
            onChange={setClienteId}
            opcoes={(data ?? []).map((p) => ({ id: p.cliente.id, nome: p.cliente.name }))}
          />

          {!destino.temLeitura && (
            <p className="mt-4 text-center text-sm italic text-muted-foreground">
              Informação insuficiente para identificar um próximo destino. Registre ao menos um
              capítulo anterior para que o sistema possa fazer uma leitura.
            </p>
          )}

          {destino.secoes.map((s) => (
            <SectionCard
              key={s.key}
              titulo={s.titulo}
              descricao={s.descricao}
              itens={s.itens}
              vazio={s.vazio}
            />
          ))}

          <Link
            to="/intelligence"
            className="flex w-full items-center justify-center rounded-full border border-gold/70 bg-card px-6 py-3.5 font-display text-sm tracking-[0.14em] text-primary"
          >
            VER INTELLIGENCE BRIEF
          </Link>
        </div>
      )}
    </Screen>
  );
}
