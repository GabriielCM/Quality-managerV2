import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  BaseNotificationModule,
  NotificationModuleMetadata,
  NotificationPayload,
} from '../interfaces/notification-module.interface';

@Injectable()
export class RncPrazo2DiasNotification extends BaseNotificationModule {
  private readonly logger = new Logger(RncPrazo2DiasNotification.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  getMetadata(): NotificationModuleMetadata {
    return {
      codigo: 'rnc_prazo_2dias',
      nome: 'RNC - Prazo 2 Dias',
      descricao:
        'Notificação enviada 2 dias antes do prazo de 7 dias da RNC expirar',
      modulo: 'rnc',
      canal: 'sistema',
    };
  }

  async check(): Promise<NotificationPayload[]> {
    this.logger.debug('Checking RNC 2 days before deadline...');

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // RNCs que estão ativas e com prazo
    const rncs = await this.prisma.rnc.findMany({
      where: {
        status: {
          in: ['RNC enviada', 'RNC aceita'],
        },
        prazoInicio: {
          not: null,
        },
      },
      include: {
        fornecedor: true,
      },
    });

    this.logger.debug(`Found ${rncs.length} active RNCs with prazoInicio`);

    const notifications: NotificationPayload[] = [];

    for (const rnc of rncs) {
      if (!rnc.prazoInicio) continue;

      const prazoInicio = new Date(rnc.prazoInicio);
      prazoInicio.setHours(0, 0, 0, 0);

      const diffTime = hoje.getTime() - prazoInicio.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      this.logger.debug(
        `RNC ${rnc.numero}: diffDays=${diffDays}, prazoInicio=${prazoInicio.toISOString()}, hoje=${hoje.toISOString()}`,
      );

      // Dia 5 = faltam 2 dias para prazo de 7 dias
      if (diffDays === 5) {
        const targetUsers = await this.getTargetUsers();
        this.logger.debug(
          `RNC ${rnc.numero} is at 2 days before deadline. Target users: ${targetUsers.length}`,
        );

        for (const userId of targetUsers) {
          const prazoFim = this.addDays(prazoInicio, 7);
          const today = new Date().toISOString().split('T')[0];

          notifications.push({
            userId,
            titulo: `RNC ${rnc.numero} - Prazo em 2 dias`,
            mensagem: `A RNC ${rnc.numero} do fornecedor ${rnc.fornecedor.razaoSocial} vence em 2 dias (${this.formatDate(prazoFim)}).`,
            urgente: false,
            entityType: 'rnc',
            entityId: rnc.id,
            uniqueKey: `rnc_prazo_2dias_${rnc.id}_${today}`,
          });
        }
      }
    }

    this.logger.debug(`Generated ${notifications.length} notifications`);
    return notifications;
  }

  private async getTargetUsers(): Promise<string[]> {
    // Buscar permissões rnc.read e admin.all
    const permissions = await this.prisma.permission.findMany({
      where: {
        code: {
          in: ['rnc.read', 'admin.all'],
        },
      },
    });

    const permissionIds = permissions.map((p) => p.id);

    // Buscar usuários com essas permissões
    const userPermissions = await this.prisma.userPermission.findMany({
      where: {
        permissionId: {
          in: permissionIds,
        },
      },
      select: {
        userId: true,
      },
    });

    const userIds = [...new Set(userPermissions.map((up) => up.userId))];

    // Filtrar por configurações de notificação do usuário
    const notificationType = await this.prisma.notificationType.findUnique({
      where: { codigo: this.getMetadata().codigo },
    });

    if (!notificationType || !notificationType.ativo) return [];

    // Buscar configurações dos usuários (default: habilitado)
    const settings = await this.prisma.userNotificationSetting.findMany({
      where: {
        notificationTypeId: notificationType.id,
        userId: {
          in: userIds,
        },
      },
    });

    const disabledUserIds = new Set(
      settings.filter((s) => !s.habilitado).map((s) => s.userId),
    );

    // Retornar apenas usuários que não desabilitaram esta notificação
    return userIds.filter((id) => !disabledUserIds.has(id));
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR');
  }
}
