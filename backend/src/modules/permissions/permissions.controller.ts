import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Permissões')
@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permissions('users.manage_permissions', 'admin.all')
  @ApiOperation({ summary: 'Listar todas as permissões' })
  @ApiResponse({ status: 200, description: 'Lista de permissões retornada com sucesso' })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('modules')
  @Permissions('users.manage_permissions', 'admin.all')
  @ApiOperation({ summary: 'Listar todos os módulos disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de módulos retornada com sucesso' })
  getModules() {
    return this.permissionsService.getModules();
  }

  @Get('module/:module')
  @Permissions('users.manage_permissions', 'admin.all')
  @ApiOperation({ summary: 'Listar permissões de um módulo específico' })
  @ApiResponse({ status: 200, description: 'Permissões do módulo retornadas com sucesso' })
  findByModule(@Param('module') module: string) {
    return this.permissionsService.findByModule(module);
  }
}
