import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StatusEtapa = 'CONCLUIDA' | 'ATUAL' | 'PENDENTE';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorCodigo(codigo: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { codigo },
      include: {
        etapaAtual: true,
        historicos: {
          include: { etapa: true },
          orderBy: { dataHora: 'asc' },
        },
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
        // Último registro da etapa (data + observação exibidas na linha do tempo)
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
          observacao: registro?.observacao ?? null,
          status,
        };
      }),
    };
  }
}
