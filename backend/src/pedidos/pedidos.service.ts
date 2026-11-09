import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarPedidoDto } from './dto/criar-pedido.dto';
import { ListarPedidosQueryDto } from './dto/listar-pedidos-query.dto';

export type StatusEtapa = 'CONCLUIDA' | 'ATUAL' | 'PENDENTE';


const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_TENTATIVAS = 5;

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  //  CADASTRAR 
  async criar(dto: CriarPedidoDto, usuarioId: number) {
    await this.garantirUsuarioAtivo(usuarioId);

    const etapaInicial = await this.prisma.etapa.findFirst({
      orderBy: { ordem: 'asc' },
    });

  if (!etapaInicial) {
    throw new InternalServerErrorException(
      'Não há etapas cadastradas para iniciar o pedido',
     );
}

    for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
      const codigo = this.gerarCodigo();
      try {
        return await this.prisma.pedido.create({
          data: {
            codigo,
            nomeCliente: dto.nomeCliente,
            titulo: dto.titulo,
            dataInicio: new Date(dto.dataInicio),
            criadoPorId: usuarioId,
            ...(etapaInicial &&{
              etapaAtualId: etapaInicial.id,
              historicos:{
                create:{
                  etapaId: etapaInicial.id,
                  usuarioId,
                }
              }
            }),
          },
          include: { etapaAtual: true },
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

  // LISTAR E PESQUISAR 
  async listar(query: ListarPedidosQueryDto, usuarioId: number) {
    await this.garantirUsuarioAtivo(usuarioId);

    const { search, situacao, etapaId, page = 1, limit = 10 } = query;

    const where: Prisma.PedidoWhereInput = {
      ...(situacao && { situacao }),
      ...(etapaId && { etapaAtualId: etapaId }),
      ...(search && {
        OR: [
          { codigo: { contains: search, mode: 'insensitive' } },
          { nomeCliente: { contains: search, mode: 'insensitive' } },
          { titulo: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [itens, total] = await this.prisma.$transaction([
      this.prisma.pedido.findMany({
        where,
        include: { etapaAtual: true },
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.pedido.count({ where }),
    ]);

    return { itens, total, page, limit, totalPaginas: Math.ceil(total / limit) };
  }

  // CONSULTAR POR CÓDIGO
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
      codigo: pedido.codigo,
      nomeCliente: pedido.nomeCliente,
      titulo: pedido.titulo,
      situacao: pedido.situacao,
      criadoEm: pedido.criadoEm,
      dataUltimaAtualizacao: pedido.dataUltimaAtualizacao,
      etapaAtual: pedido.etapaAtual
        ? { nome: pedido.etapaAtual.nome, ordem: pedido.etapaAtual.ordem }
        : null,
      etapas: etapas.map((etapa) => {
        // A data continua sendo a do último registro de transição da etapa.
        const registro =
          pedido.historicos.filter((item) => item.etapaId === etapa.id).at(-1) ??
          null;

        let status: StatusEtapa = 'PENDENTE';
        if (ordemAtual !== null) {
          if (etapa.ordem < ordemAtual) status = 'CONCLUIDA';
          else if (etapa.ordem === ordemAtual) status = 'ATUAL';
        } else if (finalizado) {
          status = 'CONCLUIDA';
        }

        return {
          nome: etapa.nome,
          ordem: etapa.ordem,
          dataHora: registro?.dataHora ?? null,
          // Sem etapa atual não há limite seguro para publicar observações.
          observacao: ordemAtual !== null && etapa.ordem <= ordemAtual
            ? observacoesPorEtapa.get(etapa.id) ?? null
            : null,
          status,
        };
      }),
    };
  }

  //AUXILIARES
  private gerarCodigo(): string {
    const bytes = randomBytes(6);
    let sufixo = '';
    for (const byte of bytes) {
      sufixo += ALFABETO[byte % ALFABETO.length];
    }
    return `QD-${new Date().getFullYear()}-${sufixo}`; 
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
