import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { usuarioPublicoSelect } from '../usuarios/usuario-publico';
import type { UsuarioPublico } from '../usuarios/usuario-publico';
import { CriarFuncionarioDto } from './dto/criar-funcionario.dto';
import { AtualizarFuncionarioDto } from './dto/atualizar-funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usuariosService: UsuariosService,
  ) {}

  async criar(dto: CriarFuncionarioDto): Promise<UsuarioPublico> {
    const email = dto.email.trim().toLowerCase();
    await this.usuariosService.garantirEmailDisponivel(email);
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    try {
      return await this.prisma.usuario.create({
        data: {
          nome: dto.nome,
          email,
          senhaHash,
          cargo: dto.cargo,
          telefone: dto.telefone,
          perfil: 'FUNCIONARIO',
          ativo: true,
        },
        select: usuarioPublicoSelect,
      });
    } catch (erro) {
      this.tratarErroDeEscrita(erro);
    }
  }

  async listar(): Promise<UsuarioPublico[]> {
    return this.prisma.usuario.findMany({
      where: { perfil: 'FUNCIONARIO' },
      orderBy: [{ nome: 'asc' }, { id: 'asc' }],
      select: usuarioPublicoSelect,
    });
  }

  async atualizar(
    id: number,
    dto: AtualizarFuncionarioDto,
  ): Promise<UsuarioPublico> {
    const funcionario = await this.prisma.usuario.findUnique({
      where: { id, perfil: 'FUNCIONARIO' },
      select: { id: true },
    });
    if (!funcionario) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    // IsOptional aceita null, mas esses dois campos não são anuláveis no banco.
    if (dto.nome === null || dto.email === null) {
      throw new BadRequestException('Nome e email não podem ser nulos');
    }
    const email = dto.email?.trim().toLowerCase();
    if (email !== undefined) {
      await this.usuariosService.garantirEmailDisponivel(email, id);
    }

    try {
      return await this.prisma.usuario.update({
        where: { id, perfil: 'FUNCIONARIO' },
        data: {
          ...(dto.nome !== undefined && { nome: dto.nome }),
          ...(email !== undefined && { email }),
          ...(dto.cargo !== undefined && { cargo: dto.cargo }),
          ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        },
        select: usuarioPublicoSelect,
      });
    } catch (erro) {
      this.tratarErroDeEscrita(erro);
    }
  }

  async desativar(id: number): Promise<UsuarioPublico> {
    return this.definirAtivo(id, false);
  }

  async reativar(id: number): Promise<UsuarioPublico> {
    return this.definirAtivo(id, true);
  }

  private async definirAtivo(
    id: number,
    ativo: boolean,
  ): Promise<UsuarioPublico> {
    try {
      return await this.prisma.usuario.update({
        where: { id, perfil: 'FUNCIONARIO' },
        data: { ativo },
        select: usuarioPublicoSelect,
      });
    } catch (erro) {
      this.tratarErroDeEscrita(erro, false);
    }
  }

  private tratarErroDeEscrita(erro: unknown, tratarEmail = true): never {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
      if (tratarEmail && erro.code === 'P2002') {
        throw new ConflictException('Email já cadastrado');
      }
      if (erro.code === 'P2025') {
        throw new NotFoundException('Funcionário não encontrado');
      }
    }
    throw erro;
  }
}
