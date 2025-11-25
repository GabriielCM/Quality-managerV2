import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationRunnerService } from './notification-runner.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import * as NotificationModules from './modules';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationRunnerService,
    NotificationSchedulerService,
    // Registrar todos os módulos de notificação
    ...Object.values(NotificationModules),
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
