import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationPayload } from './interfaces/notification-module.interface';
import { FilterNotificationDto } from './dto/filter-notification.dto';
import { UpdateUserNotificationSettingDto } from './dto/update-user-notification-setting.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async createNotification(payload: NotificationPayload) {
    // Verificar se já existe (prevenção de duplicatas)
    const existing = await this.prisma.notification.findUnique({
      where: { uniqueKey: payload.uniqueKey },
    });

    if (existing) {
      this.logger.debug(`Duplicate prevented: ${payload.uniqueKey}`);
      return existing;
    }

    // Extrair o código do tipo de notificação do uniqueKey
    // Formato: rnc_prazo_2dias_{id}_{date}
    const parts = payload.uniqueKey.split('_');
    const codigo = parts.slice(0, -2).join('_'); // Remove id e date

    // Buscar o tipo de notificação
    const notificationType = await this.prisma.notificationType.findUnique({
      where: { codigo },
    });

    if (!notificationType) {
      this.logger.error(`Notification type not found: ${codigo}`);
      throw new NotFoundException(`Notification type not found: ${codigo}`);
    }

    // Criar notificação
    return this.prisma.notification.create({
      data: {
        notificationTypeId: notificationType.id,
        userId: payload.userId,
        titulo: payload.titulo,
        mensagem: payload.mensagem,
        urgente: payload.urgente,
        entityType: payload.entityType,
        entityId: payload.entityId,
        uniqueKey: payload.uniqueKey,
      },
      include: {
        notificationType: true,
        user: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findUserNotifications(userId: string, filter: FilterNotificationDto) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(filter.lida !== undefined && { lida: filter.lida }),
        ...(filter.entityType && { entityType: filter.entityType }),
        ...(filter.urgente !== undefined && { urgente: filter.urgente }),
      },
      include: {
        notificationType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        lida: false,
      },
    });

    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        lida: true,
        dataLeitura: new Date(),
      },
    });
  }

  async syncTypesFromModules(modules: any[]) {
    const synced = [];

    for (const metadata of modules) {
      const existing = await this.prisma.notificationType.findUnique({
        where: { codigo: metadata.codigo },
      });

      if (!existing) {
        const created = await this.prisma.notificationType.create({
          data: {
            codigo: metadata.codigo,
            nome: metadata.nome,
            descricao: metadata.descricao,
            modulo: metadata.modulo,
            canal: metadata.canal,
          },
        });
        synced.push(created);
        this.logger.log(`Notification type created: ${metadata.codigo}`);
      } else {
        synced.push(existing);
      }
    }

    return synced;
  }

  async getUserSettings(userId: string) {
    const types = await this.prisma.notificationType.findMany({
      orderBy: { modulo: 'asc' },
    });

    const settings = await this.prisma.userNotificationSetting.findMany({
      where: { userId },
    });

    const settingsMap = new Map(
      settings.map((s) => [s.notificationTypeId, s.habilitado])
    );

    return types.map((type) => ({
      id: type.id,
      codigo: type.codigo,
      nome: type.nome,
      descricao: type.descricao,
      modulo: type.modulo,
      ativo: type.ativo,
      habilitado: settingsMap.get(type.id) ?? true,
    }));
  }

  async updateUserSetting(
    userId: string,
    typeId: string,
    dto: UpdateUserNotificationSettingDto,
  ) {
    // Verificar se o tipo existe
    const type = await this.prisma.notificationType.findUnique({
      where: { id: typeId },
    });

    if (!type) {
      throw new NotFoundException('Notification type not found');
    }

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Criar ou atualizar configuração
    return this.prisma.userNotificationSetting.upsert({
      where: {
        userId_notificationTypeId: {
          userId,
          notificationTypeId: typeId,
        },
      },
      create: {
        userId,
        notificationTypeId: typeId,
        habilitado: dto.habilitado,
      },
      update: {
        habilitado: dto.habilitado,
      },
    });
  }
}
