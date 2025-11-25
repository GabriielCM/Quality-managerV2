export interface NotificationModuleMetadata {
  codigo: string;
  nome: string;
  descricao: string;
  modulo: string;
  canal: string;
}

export interface NotificationPayload {
  userId: string;
  titulo: string;
  mensagem: string;
  urgente: boolean;
  entityType?: string;
  entityId?: string;
  uniqueKey: string;
}

export abstract class BaseNotificationModule {
  abstract getMetadata(): NotificationModuleMetadata;

  /**
   * Check if notification should be sent
   * Returns array of notification payloads to create
   */
  abstract check(): Promise<NotificationPayload[]>;
}
