import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

const SELECAO_PUBLICA = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  ativo: true,
  criadoEm: true,
} as const;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.usuario.findMany({
      select: SELECAO_PUBLICA,
      orderBy: { nome: 'asc' },
    });
  }

  async garantirEmailDisponivel(email: string, idIgnorado?: number) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existente && existente.id !== idIgnorado) {
      throw new ConflictException('Já existe um usuário com este e-mail');
    }
  }

  async criar(dto: CriarUsuarioDto) {
    await this.garantirEmailDisponivel(dto.email);

    return this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash: await bcrypt.hash(dto.senha, 10),
        perfil: 'FUNCIONARIO',
        ativo: true,
      },
      select: SELECAO_PUBLICA,
    });
  }

  async redefinirSenha(id: number, dto: RedefinirSenhaDto) {
    await this.buscarFuncionario(id);

    return this.prisma.usuario.update({
      where: { id },
      data: { senhaHash: await bcrypt.hash(dto.senha, 10) },
      select: SELECAO_PUBLICA,
    });
  }

  async remover(id: number, solicitanteId: number) {
    if (id === solicitanteId) {
      throw new BadRequestException('Você não pode excluir o próprio usuário');
    }

    await this.buscarFuncionario(id);
    await this.prisma.usuario.delete({ where: { id } });

    return { id };
  }

  private async buscarFuncionario(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, perfil: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    if (usuario.perfil === 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Administradores não podem ser alterados por esta rota',
      );
    }

    return usuario;
  }
}
