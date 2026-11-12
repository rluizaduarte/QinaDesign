import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { AtualizarPedidoDto } from './dto/atualizar-pedido.dto';
import { ListarPedidosQueryDto } from './dto/listar-pedidos-query.dto';

export type StatusEtapa = 'CONCLUIDA' | 'ATUAL' | 'PENDENTE';

const CODIGO_MIN = 10000;
const CODIGO_MAX = 99999;
const MAX_TENTATIVAS = 10;

const INCLUDE_LISTAGEM = {
  etapaAtual: { select: { id: true, nome: true, ordem: true } },
} satisfies Prisma.PedidoInclude;

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(dto: CriarPedidoDto, usuarioId: number) {
    await this.garantirUsuarioAtivo(usuarioId);

    const etapas = await this.prisma.etapa.findMany({
      orderBy: { ordem: 'asc' },
      select: { id: true, ordem: true },
    });

    if (etapas.length === 0) {
      throw new InternalServerErrorException(
        'Não há etapas cadastradas para iniciar o pedido',
      );
    }

    const indiceInicial =
      dto.etapaInicialId === undefined
        ? 0
        : etapas.findIndex((etapa) => etapa.id === dto.etapaInicialId);

    if (indiceInicial === -1) {
      throw new BadRequestException('Etapa inicial não encontrada');
    }

    const etapaInicial = etapas[indiceInicial];
    const dataInicio = new Date(dto.dataInicio);
    const agora = new Date();

    const historicos = etapas
      .slice(0, indiceInicial + 1)
      .map((etapa, indice) => ({
        etapaId: etapa.id,
        usuarioId,
        dataHora: indice === indiceInicial ? agora : dataInicio,
      }));

    const situacao =
      indiceInicial === etapas.length - 1 ? 'FINALIZADO' : 'EM_ANDAMENTO';

    for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
      const codigo = this.gerarCodigo();
      try {
        return await this.prisma.pedido.create({
          data: {
            codigo,
            nomeCliente: dto.nomeCliente,
            observacao: dto.observacao ?? null,
            dataInicio,
            situacao,
            criadoPorId: usuarioId,
            etapaAtualId: etapaInicial.id,
            historicos: { create: historicos },
          },
          include: INCLUDE_LISTAGEM,
        });
      } catch (erro) {
        if (this.isCodigoDuplicado(erro)) continue;
        throw erro;
      }
    }

    throw new InternalServerErrorException(
      'Não foi possível gerar um código único para o pedido',
    );
  }

  async listar(query: ListarPedidosQueryDto, usuarioId: number) {
    await this.garantirUsuarioAtivo(usuarioId);

    const { search, situacao, etapaId, limit } = query;
    const page = query.page ?? 1;

    const where: Prisma.PedidoWhereInput = {
      ...(situacao && { situacao }),
      ...(etapaId && { etapaAtualId: etapaId }),
      ...(search && {
        OR: [
          { codigo: { contains: search, mode: 'insensitive' } },
          { nomeCliente: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [itens, total, todos, emAndamento, finalizados] =
      await this.prisma.$transaction([
        this.prisma.pedido.findMany({
          where,
          include: INCLUDE_LISTAGEM,
          orderBy: { criadoEm: 'desc' },
          ...(limit && { skip: (page - 1) * limit, take: limit }),
        }),
        this.prisma.pedido.count({ where }),
        this.prisma.pedido.count(),
        this.prisma.pedido.count({ where: { situacao: 'EM_ANDAMENTO' } }),
        this.prisma.pedido.count({ where: { situacao: 'FINALIZADO' } }),
      ]);

    return {
      itens,
      total,
      totais: { todos, emAndamento, finalizados },
      ...(limit && { page, limit, totalPaginas: Math.ceil(total / limit) }),
    };
  }

  async buscarPorCodigo(codigo: string, usuarioId?: number) {
    if (usuarioId !== undefined) {
      await this.garantirUsuarioAtivo(usuarioId);
    }

    const pedido = await this.prisma.pedido.findUnique({
      where: { codigo: codigo.trim().toUpperCase() },
      include: {
        etapaAtual: true,
        historicos: { orderBy: { dataHora: 'asc' }, include: { etapa: true } },
        observacoesEtapas: { select: { etapaId: true, observacao: true } },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${codigo} não encontrado`);
    }

    const etapas = await this.prisma.etapa.findMany({
      orderBy: { ordem: 'asc' },
    });

    const ordemAtual = pedido.etapaAtual?.ordem ?? null;
    const finalizado = pedido.situacao === 'FINALIZADO';
    const observacoesPorEtapa = new Map(
      pedido.observacoesEtapas.map((item) => [item.etapaId, item.observacao]),
    );

    return {
      id: pedido.id,
      codigo: pedido.codigo,
      nomeCliente: pedido.nomeCliente,
      observacao: pedido.observacao,
      situacao: pedido.situacao,
      dataInicio: pedido.dataInicio,
      criadoEm: pedido.criadoEm,
      dataUltimaAtualizacao: pedido.dataUltimaAtualizacao,
      etapaAtual: pedido.etapaAtual
        ? {
            id: pedido.etapaAtual.id,
            nome: pedido.etapaAtual.nome,
            ordem: pedido.etapaAtual.ordem,
          }
        : null,
      etapas: etapas.map((etapa) => {
        const registro =
          pedido.historicos
            .filter((item) => item.etapaId === etapa.id)
            .at(-1) ?? null;

        let status: StatusEtapa = 'PENDENTE';
        if (ordemAtual !== null) {
          if (etapa.ordem < ordemAtual) status = 'CONCLUIDA';
          else if (etapa.ordem === ordemAtual) status = 'ATUAL';
        } else if (finalizado) {
          status = 'CONCLUIDA';
        }

        return {
          id: etapa.id,
          nome: etapa.nome,
          ordem: etapa.ordem,
          dataHora: registro?.dataHora ?? null,
          observacao:
            ordemAtual !== null && etapa.ordem <= ordemAtual
              ? (observacoesPorEtapa.get(etapa.id) ?? null)
              : null,
          status,
        };
      }),
    };
  }

  async atualizar(id: number, dto: AtualizarPedidoDto, usuarioId: number) {
    await this.garantirUsuarioAtivo(usuarioId);

    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return this.prisma.pedido.update({
      where: { id },
      data: {
        ...(dto.nomeCliente !== undefined && { nomeCliente: dto.nomeCliente }),
        ...(dto.observacao !== undefined && { observacao: dto.observacao }),
        ...(dto.dataInicio !== undefined && {
          dataInicio: new Date(dto.dataInicio),
        }),
      },
      include: INCLUDE_LISTAGEM,
    });
  }

  private gerarCodigo(): string {
    return String(randomInt(CODIGO_MIN, CODIGO_MAX + 1));
  }

  private isCodigoDuplicado(erro: unknown): boolean {
    return (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === 'P2002'
    );
  }

  private async garantirUsuarioAtivo(usuarioId: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
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
}
