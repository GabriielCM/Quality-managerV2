import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationRunnerService } from './notification-runner.service';
import { FilterNotificationDto } from './dto/filter-notification.dto';
import { UpdateUserNotificationSettingDto } from './dto/update-user-notification-setting.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly runnerService: NotificationRunnerService,
  ) {}

  // Listar notificações do usuário logado (com filtros)
  @Get()
  @Permissions('notifications.read', 'admin.all')
  findUserNotifications(@Req() req, @Query() filter: FilterNotificationDto) {
    return this.notificationsService.findUserNotifications(
      req.user.id,
      filter,
    );
  }

  // Marcar como lida
  @Patch(':id/read')
  @Permissions('notifications.read', 'admin.all')
  markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  // Contar não lidas (para badge)
  @Get('unread/count')
  @Permissions('notifications.read', 'admin.all')
  countUnread(@Req() req) {
    return this.notificationsService.countUnread(req.user.id);
  }

  // Sincronizar tipos (admin) - cria NotificationTypes no DB
  @Post('sync-types')
  @Permissions('notifications.manage_types', 'admin.all')
  syncTypes() {
    const modules = this.runnerService.getRegisteredModules();
    return this.notificationsService.syncTypesFromModules(modules);
  }

  // Obter configurações de usuário (admin)
  @Get('users/:userId/settings')
  @Permissions('notifications.manage_settings', 'admin.all')
  getUserSettings(@Param('userId') userId: string) {
    return this.notificationsService.getUserSettings(userId);
  }

  // Atualizar configuração de usuário (admin)
  @Patch('users/:userId/settings/:typeId')
  @Permissions('notifications.manage_settings', 'admin.all')
  updateUserSetting(
    @Param('userId') userId: string,
    @Param('typeId') typeId: string,
    @Body() dto: UpdateUserNotificationSettingDto,
  ) {
    return this.notificationsService.updateUserSetting(userId, typeId, dto);
  }
}
