import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { usuarioPublicoSelect } from './usuario-publico';
import type { UsuarioPublico } from './usuario-publico';

const credenciaisSelect = {
  id: true,
  email: true,
  senhaHash: true,
  perfil: true,
  ativo: true,
} as const satisfies Prisma.UsuarioSelect;

export type CredenciaisUsuario = Prisma.UsuarioGetPayload<{
  select: typeof credenciaisSelect;
}>;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorEmail(email: string): Promise<UsuarioPublico | null> {
    return this.prisma.usuario.findUnique({
      where: { email: this.normalizarEmail(email) },
      select: usuarioPublicoSelect,
    });
  }

  async buscarPorId(id: number): Promise<UsuarioPublico | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: usuarioPublicoSelect,
    });
  }

  /** Uso interno: contém senhaHash e não deve compor respostas ou payloads JWT. */
  async buscarCredenciaisPorEmail(
    email: string,
  ): Promise<CredenciaisUsuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email: this.normalizarEmail(email) },
      select: credenciaisSelect,
    });
  }

  async garantirUsuarioAtivo(id: number): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, ativo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (!usuario.ativo) {
      throw new ForbiddenException(
        'Usuário inativo não pode realizar esta operação',
      );
    }
  }

  async garantirEmailDisponivel(
    email: string,
    ignorarUsuarioId?: number,
  ): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: this.normalizarEmail(email) },
      select: { id: true },
    });

    if (usuario && usuario.id !== ignorarUsuarioId) {
      throw new ConflictException('Email já cadastrado');
    }
  }

  private normalizarEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
