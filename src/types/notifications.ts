export type NotificationType =
  | "connection_request"
  | "connection_accepted"
  | "connection_declined"
  | "new_chapter_recorded"
  | "next_chapter_created"
  | "return_approaching";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date: string;
  read: boolean;
  clientId?: string;
  clientName?: string;
}

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  connection_request: "Solicitação de conexão",
  connection_accepted: "Conexão aceita",
  connection_declined: "Conexão recusada",
  new_chapter_recorded: "Novo capítulo registrado",
  next_chapter_created: "Próximo capítulo criado",
  return_approaching: "Retorno próximo",
};
