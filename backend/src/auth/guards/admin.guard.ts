import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { perfil?: string } }>();

    if (request.user?.perfil !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Apenas administradores podem acessar este recurso',
      );
    }

    return true;
  }
}
