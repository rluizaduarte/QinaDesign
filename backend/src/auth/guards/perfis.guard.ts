import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERFIS_KEY } from '../decorators/perfis.decorator';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfis = this.reflector.getAllAndOverride<string[]>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!perfis || perfis.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !perfis.includes(user.perfil)) {
      throw new ForbiddenException('Acesso negado para este perfil');
    }
    return true;
  }
}