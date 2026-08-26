export type Cliente = {
  id: string;
  nome: string;
  proximoRetorno: string;
  procedimento: string;
  ultimoCuidado: string;
  ultimaData: string;
  capitulo: number;
  totalCapitulos: number;
  horario?: string;
};

export const clientes: Cliente[] = [
  {
    id: "marina-costa",
    nome: "Marina Costa",
    proximoRetorno: "02 SET",
    procedimento: "Reconstrução capilar",
    ultimoCuidado: "Hidratação profunda",
    ultimaData: "18 AGO",
    capitulo: 2,
    totalCapitulos: 6,
    horario: "14:00",
  },
  {
    id: "juliana-alves",
    nome: "Juliana Alves",
    proximoRetorno: "06 SET",
    procedimento: "Brilho",
    ultimoCuidado: "Nutrição intensiva",
    ultimaData: "20 AGO",
    capitulo: 3,
    totalCapitulos: 6,
    horario: "16:30",
  },
  {
    id: "camila-nogueira",
    nome: "Camila Nogueira",
    proximoRetorno: "11 SET",
    procedimento: "Selagem",
    ultimoCuidado: "Reconstrução",
    ultimaData: "12 AGO",
    capitulo: 1,
    totalCapitulos: 6,
  },
];

export const getCliente = (id: string) => clientes.find((c) => c.id === id);

export const mensagens = [
  {
    id: "1",
    nome: "Marina Costa",
    resumo: "Seu próximo capítulo está liberado",
    quando: "Hoje, 09:40",
  },
  {
    id: "2",
    nome: "Juliana Alves",
    resumo: "Hora de renovar seu brilho",
    quando: "Ontem",
  },
  {
    id: "3",
    nome: "Equipe Passaporte",
    resumo: "Novo selo disponível",
    quando: "18 AGO",
  },
];

export const lembretes = [
  { id: "1", nome: "Marina Costa", resumo: "Retorno em 02 SET", quando: "Agendado" },
  { id: "2", nome: "Camila Nogueira", resumo: "Selagem em 11 SET", quando: "Agendado" },
];

export const etapas = [
  { numero: "01", nome: "DIAGNÓSTICO" },
  { numero: "02", nome: "TRATAMENTO" },
  { numero: "03", nome: "SELAGEM" },
  { numero: "04", nome: "BRILHO" },
];
