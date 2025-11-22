import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.permissions) {
      throw new ForbiddenException('Você não tem permissão para acessar este recurso');
    }

    // Verifica se o usuário tem a permissão admin.all (acesso total)
    if (user.permissions.includes('admin.all')) {
      return true;
    }

    // Verifica se o usuário tem pelo menos uma das permissões requeridas
    const hasPermission = requiredPermissions.some((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Você precisa de uma das seguintes permissões: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
