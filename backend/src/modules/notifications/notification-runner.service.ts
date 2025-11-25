import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { NotificationsService } from './notifications.service';
import { BaseNotificationModule } from './interfaces/notification-module.interface';
import * as NotificationModules from './modules';

@Injectable()
export class NotificationRunnerService implements OnModuleInit {
  private readonly logger = new Logger(NotificationRunnerService.name);
  private notificationModules: BaseNotificationModule[] = [];

  constructor(
    private moduleRef: ModuleRef,
    private notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    this.initializeModules();
    // Auto-sincronizar tipos de notificação na inicialização
    await this.syncNotificationTypes();
  }

  private initializeModules() {
    const moduleClasses = Object.values(NotificationModules);

    for (const ModuleClass of moduleClasses) {
      try {
        const instance = this.moduleRef.get(ModuleClass as any, {
          strict: false,
        });
        this.notificationModules.push(instance);
        const metadata = instance.getMetadata();
        this.logger.log(
          `Registered notification module: ${metadata.codigo} (${metadata.nome})`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to register module: ${(ModuleClass as any).name}`,
          error.stack,
        );
      }
    }

    this.logger.log(
      `Total notification modules registered: ${this.notificationModules.length}`,
    );
  }

  private async syncNotificationTypes() {
    try {
      this.logger.log('Syncing notification types to database...');
      const modules = this.getRegisteredModules();
      await this.notificationsService.syncTypesFromModules(modules);
      this.logger.log('Notification types synced successfully');
    } catch (error) {
      this.logger.error('Failed to sync notification types', error.stack);
    }
  }

  async runAllChecks() {
    this.logger.debug(
      `Running ${this.notificationModules.length} notification checks...`,
    );

    let totalCreated = 0;

    for (const module of this.notificationModules) {
      try {
        const metadata = module.getMetadata();
        const payloads = await module.check();

        if (payloads.length > 0) {
          this.logger.log(
            `${metadata.codigo}: Creating ${payloads.length} notifications`,
          );

          for (const payload of payloads) {
            await this.notificationsService.createNotification(payload);
            totalCreated++;
          }
        }
      } catch (error) {
        this.logger.error(
          `Error in module ${module.getMetadata().codigo}`,
          error.stack,
        );
      }
    }

    if (totalCreated > 0) {
      this.logger.log(`Total notifications created: ${totalCreated}`);
    }
  }

  getRegisteredModules() {
    return this.notificationModules.map((m) => m.getMetadata());
  }
}
