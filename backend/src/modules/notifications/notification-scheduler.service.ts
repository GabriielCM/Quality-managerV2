import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationRunnerService } from './notification-runner.service';

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);

  constructor(private readonly runner: NotificationRunnerService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleNotificationCheck() {
    this.logger.debug('Scheduler triggered - running notification checks');

    try {
      await this.runner.runAllChecks();
      this.logger.debug('Notification checks completed');
    } catch (error) {
      this.logger.error('Error running notification checks', error.stack);
    }
  }
}
