
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AndamentoService {
  constructor(private readonly prisma: PrismaService) {}

  // Atualiza a etapa do pedido e registra a mudança no histórico
  async atualizarEtapa(
    pedidoId: number,
    novaEtapaId: number,
    usuarioId: number,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verifica se o funcionário existe e está ativo
        await this.garantirUsuarioAtivo(usuarioId, tx);

        // 2. Busca o pedido e impede alterações se estiver finalizado
        const pedido = await this.buscarPedidoEmAndamento(
          pedidoId,
          tx,
        );

        if (pedido.etapaAtualId === null) {
          throw new BadRequestException(
            'O pedido não possui uma etapa atual',
          );
        }

        // 3. Valida se a mudança é de apenas uma etapa
        const novaEtapa = await this.validarTransicao(
          pedido.etapaAtualId,
          novaEtapaId,
          tx,
        );

        // 4. Finaliza automaticamente se for a última etapa
        const novaSituacao = novaEtapa.ultimaEtapa
          ? 'FINALIZADO'
          : 'EM_ANDAMENTO';

        // 5. Atualiza somente se o pedido não tiver sido alterado
        const resultado = await tx.pedido.updateMany({
          where: {
            id: pedidoId,
            etapaAtualId: pedido.etapaAtualId,
            situacao: 'EM_ANDAMENTO',
            dataUltimaAtualizacao:
              pedido.dataUltimaAtualizacao,
          },
          data: {
            etapaAtualId: novaEtapaId,
            situacao: novaSituacao,
          },
        });

        // 6. Impede sobrescrever uma atualização simultânea
        if (resultado.count !== 1) {
          throw new ConflictException(
            'O pedido foi alterado por outro usuário. Atualize os dados e tente novamente.',
          );
        }

        // 7. Registra a mudança no histórico
        await tx.historicoEtapa.create({
          data: {
            pedidoId,
            etapaId: novaEtapaId,
            usuarioId,
          },
        });

        // 8. Retorna o pedido atualizado
        return tx.pedido.findUniqueOrThrow({
          where: { id: pedidoId },
          include: { etapaAtual: true },
        });
      });
    } catch (erro: unknown) {
      // Trata conflitos de escrita ou deadlocks detectados pelo Prisma
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2034'
      ) {
        throw new ConflictException(
          'Conflito ao atualizar o pedido. Atualize os dados e tente novamente.',
        );
      }

      // Mantém os demais erros com seu comportamento original
      throw erro;
    }
  }

  async atualizarObservacao(
    pedidoId: number,
    usuarioId: number,
    observacao: string,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await this.garantirUsuarioAtivo(usuarioId, tx);

        const pedido = await tx.pedido.findUnique({
          where: { id: pedidoId },
        });
        if (!pedido) {
          throw new NotFoundException('Pedido não encontrado');
        }
        if (pedido.etapaAtualId === null) {
          throw new BadRequestException('O pedido não possui uma etapa atual');
        }

        const texto = observacao.trim();
        if (!texto) {
          throw new BadRequestException('A observação não pode ser vazia');
        }

        if (pedido.situacao === 'FINALIZADO') {
          const ultimaEtapa = await tx.etapa.findFirst({
            orderBy: { ordem: 'desc' },
            select: { id: true },
          });
          if (ultimaEtapa?.id !== pedido.etapaAtualId) {
            throw new ForbiddenException(
              'Só é permitido editar a observação de um pedido finalizado na última etapa',
            );
          }
        }

        // A edição participa da versão do pedido usada nas transições.
        // Avança ao menos 1 ms para não reutilizar o timestamp lido.
        const dataUltimaAtualizacao = new Date(Math.max(
          Date.now(),
          pedido.dataUltimaAtualizacao.getTime() + 1,
        ));
        const resultado = await tx.pedido.updateMany({
          where: {
            id: pedidoId,
            etapaAtualId: pedido.etapaAtualId,
            situacao: pedido.situacao,
            dataUltimaAtualizacao: pedido.dataUltimaAtualizacao,
          },
          data: { dataUltimaAtualizacao },
        });
        if (resultado.count !== 1) {
          throw new ConflictException(
            'O pedido foi alterado por outro usuário. Atualize os dados e tente novamente.',
          );
        }

        // A falha do upsert também desfaz o marcador de concorrência.
        return tx.observacaoEtapa.upsert({
          where: {
            pedidoId_etapaId: { pedidoId, etapaId: pedido.etapaAtualId },
          },
          create: { pedidoId, etapaId: pedido.etapaAtualId, observacao: texto },
          update: { observacao: texto },
        });
      });
    } catch (erro: unknown) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2034'
      ) {
        throw new ConflictException(
          'Conflito ao atualizar o pedido. Atualize os dados e tente novamente.',
        );
      }
      throw erro;
    }
  }

  // Verifica se o usuário existe e está ativo
  private async garantirUsuarioAtivo(
    usuarioId: number,
    tx: Prisma.TransactionClient,
  ) {
    const usuario = await tx.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, ativo: true },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!usuario.ativo) {
      throw new ForbiddenException(
        'Usuário inativo não pode atualizar pedidos',
      );
    }
  }

  // Verifica se o pedido existe e não está finalizado
  private async buscarPedidoEmAndamento(
    pedidoId: number,
    tx: Prisma.TransactionClient,
  ) {
    const pedido = await tx.pedido.findUnique({
      where: { id: pedidoId },
      include: { etapaAtual: true },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (pedido.situacao === 'FINALIZADO') {
      throw new ForbiddenException(
        'Não é permitido alterar um pedido finalizado',
      );
    }

    return pedido;
  }

  // Permite avançar ou retroceder somente uma etapa por vez
  private async validarTransicao(
    etapaAtualId: number,
    novaEtapaId: number,
    tx: Prisma.TransactionClient,
  ) {
    const etapas = await tx.etapa.findMany({
      orderBy: { ordem: 'asc' },
      select: { id: true, ordem: true },
    });

    const indiceAtual = etapas.findIndex(
      (etapa) => etapa.id === etapaAtualId,
    );

    const indiceNova = etapas.findIndex(
      (etapa) => etapa.id === novaEtapaId,
    );

    if (indiceAtual === -1 || indiceNova === -1) {
      throw new NotFoundException(
        'Etapa atual ou etapa de destino não encontrada',
      );
    }

    if (Math.abs(indiceNova - indiceAtual) !== 1) {
      throw new BadRequestException(
        'Só é permitido avançar ou retroceder uma etapa por vez',
      );
    }

    return {
      ...etapas[indiceNova],
      ultimaEtapa: indiceNova === etapas.length - 1,
    };
  }
}
