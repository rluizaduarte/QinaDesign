
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { AndamentoService } from './andamento.service';

describe('AndamentoService', () => {
  let service: AndamentoService;

  // Simula as operações do Prisma dentro da transação
  const txMock = {
    usuario: {
      findUnique: jest.fn(),
    },
    pedido: {
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      updateMany: jest.fn(),
    },
    etapa: {
      findMany: jest.fn(),
    },
    historicoEtapa: {
      create: jest.fn(),
    },
  };

  const prismaMock = {
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    // Executa a função da transação usando o Prisma falso
    prismaMock.$transaction.mockImplementation(
      async (callback) => callback(txMock),
    );

    const modulo = await Test.createTestingModule({
      providers: [
        AndamentoService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = modulo.get(AndamentoService);
  });

  describe('atualizarEtapa', () => {
    it('avança uma etapa e registra a mudança no histórico', async () => {
      const dataAtualizacao = new Date(
        '2026-11-08T12:00:00.000Z',
      );

      // Usuário existe e está ativo
      txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      // Pedido está na primeira etapa
      txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 1,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: dataAtualizacao,
      });

      // Existem três etapas na sequência
      txMock.etapa.findMany.mockResolvedValue([
        { id: 1, ordem: 1 },
        { id: 2, ordem: 2 },
        { id: 3, ordem: 3 },
      ]);

      // Simula uma atualização bem-sucedida
      txMock.pedido.updateMany.mockResolvedValue({
        count: 1,
      });

      // Simula a gravação do histórico
      txMock.historicoEtapa.create.mockResolvedValue({
        id: 100,
        pedidoId: 10,
        etapaId: 2,
        usuarioId: 1,
      });

      // Pedido depois da atualização
      txMock.pedido.findUniqueOrThrow.mockResolvedValue({
        id: 10,
        etapaAtualId: 2,
        situacao: 'EM_ANDAMENTO',
      });

      const resultado = await service.atualizarEtapa(
        10,
        2,
        1,
        'Etapa concluída',
      );

      // Verifica se a etapa foi atualizada
      expect(txMock.pedido.updateMany).toHaveBeenCalledWith({
        where: {
          id: 10,
          etapaAtualId: 1,
          situacao: 'EM_ANDAMENTO',
          dataUltimaAtualizacao: dataAtualizacao,
        },
        data: {
          etapaAtualId: 2,
          situacao: 'EM_ANDAMENTO',
        },
      });

      // Verifica o registro do histórico
      expect(txMock.historicoEtapa.create).toHaveBeenCalledWith({
        data: {
          pedidoId: 10,
          etapaId: 2,
          usuarioId: 1,
          observacao: 'Etapa concluída',
        },
      });

      // Verifica o retorno
      expect(resultado.etapaAtualId).toBe(2);
      expect(resultado.situacao).toBe('EM_ANDAMENTO');

      // Confirma que o método utilizou uma transação
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
    
    it('impede avançar mais de uma etapa por vez', async () => {
    // Usuário ativo
    txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
    });

    // Pedido está na etapa 1
    txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 1,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: new Date(),
    });

    // Etapas cadastradas
    txMock.etapa.findMany.mockResolvedValue([
        { id: 1, ordem: 1 },
        { id: 2, ordem: 2 },
        { id: 3, ordem: 3 },
    ]);

    // Tenta pular diretamente da etapa 1 para a 3
    await expect(
        service.atualizarEtapa(10, 3, 1),
    ).rejects.toThrow(
        'Só é permitido avançar ou retroceder uma etapa por vez',
    );

    // Nenhuma atualização pode ser realizada
    expect(txMock.pedido.updateMany).not.toHaveBeenCalled();

    // Nenhum histórico pode ser criado
    expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
    });
    
    it('impede alterar um pedido finalizado', async () => {
    // O funcionário existe e está ativo
    txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
    });

    // O pedido já está finalizado
    txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 18,
        situacao: 'FINALIZADO',
        dataUltimaAtualizacao: new Date(),
    });

    // Tentativa de retroceder para a etapa anterior
    await expect(
        service.atualizarEtapa(10, 17, 1),
    ).rejects.toThrow(
        'Não é permitido alterar um pedido finalizado',
    );

    // Não deve consultar as etapas para validar a transição
    expect(txMock.etapa.findMany).not.toHaveBeenCalled();

    // Não deve alterar o pedido
    expect(txMock.pedido.updateMany).not.toHaveBeenCalled();

    // Não deve registrar um novo histórico
    expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
    });
 
    it('finaliza automaticamente o pedido ao chegar à última etapa', async () => {
    const dataAtualizacao = new Date(
        '2026-11-08T12:00:00.000Z',
    );

    // Funcionário ativo
    txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
    });

    // Pedido está na penúltima etapa
    txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 17,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: dataAtualizacao,
    });

    // Simula as últimas etapas cadastradas
    txMock.etapa.findMany.mockResolvedValue([
        { id: 16, ordem: 16 },
        { id: 17, ordem: 17 },
        { id: 18, ordem: 18 },
    ]);

    txMock.pedido.updateMany.mockResolvedValue({
        count: 1,
    });

    txMock.historicoEtapa.create.mockResolvedValue({
        id: 101,
        pedidoId: 10,
        etapaId: 18,
        usuarioId: 1,
    });

    txMock.pedido.findUniqueOrThrow.mockResolvedValue({
        id: 10,
        etapaAtualId: 18,
        situacao: 'FINALIZADO',
    });

    // Funcionário confirma a mudança para a última etapa
    const resultado = await service.atualizarEtapa(
        10,
        18,
        1,
        'Pedido concluído',
    );

    // A etapa e a situação devem mudar juntas
    expect(txMock.pedido.updateMany).toHaveBeenCalledWith({
        where: {
        id: 10,
        etapaAtualId: 17,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: dataAtualizacao,
        },
        data: {
        etapaAtualId: 18,
        situacao: 'FINALIZADO',
        },
    });

    // A finalização deve aparecer no histórico
    expect(txMock.historicoEtapa.create).toHaveBeenCalledWith({
        data: {
        pedidoId: 10,
        etapaId: 18,
        usuarioId: 1,
        observacao: 'Pedido concluído',
        },
    });

    // O pedido retornado deve estar finalizado
    expect(resultado.etapaAtualId).toBe(18);
    expect(resultado.situacao).toBe('FINALIZADO');

    // Tudo deve utilizar a mesma transação
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('propaga o erro quando o registro do histórico falha', async () => {
    const dataAtualizacao = new Date(
        '2026-11-08T12:00:00.000Z',
    );

    // Funcionário existe e está ativo
    txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
    });

    // Pedido está na etapa 1
    txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 1,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: dataAtualizacao,
    });

    // Etapas disponíveis
    txMock.etapa.findMany.mockResolvedValue([
        { id: 1, ordem: 1 },
        { id: 2, ordem: 2 },
        { id: 3, ordem: 3 },
    ]);

    // A atualização é executada com sucesso
    txMock.pedido.updateMany.mockResolvedValue({
        count: 1,
    });

    // Simula uma falha ao criar o histórico
    txMock.historicoEtapa.create.mockRejectedValue(
        new Error('Falha ao registrar histórico'),
    );

    // O serviço deve rejeitar a operação
    await expect(
        service.atualizarEtapa(10, 2, 1),
    ).rejects.toThrow('Falha ao registrar histórico');

    // A atualização foi tentada
    expect(txMock.pedido.updateMany).toHaveBeenCalledTimes(1);

    // O registro do histórico também foi tentado
    expect(txMock.historicoEtapa.create).toHaveBeenCalledTimes(1);

    // O serviço não deve retornar um pedido atualizado
    expect(txMock.pedido.findUniqueOrThrow).not.toHaveBeenCalled();

    // A operação utilizou a transação
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
    
    // TESTE 6 - Atualização simultânea
    it('detecta conflito quando outro funcionário alterou o pedido', async () => {
      txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 1,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: new Date(),
      });

      txMock.etapa.findMany.mockResolvedValue([
        { id: 1, ordem: 1 },
        { id: 2, ordem: 2 },
        { id: 3, ordem: 3 },
      ]);

      // Nenhum registro atende mais às condições
      txMock.pedido.updateMany.mockResolvedValue({
        count: 0,
      });

      await expect(
        service.atualizarEtapa(10, 2, 1),
      ).rejects.toThrow(
        'O pedido foi alterado por outro usuário',
      );

      expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
      expect(txMock.pedido.findUniqueOrThrow).not.toHaveBeenCalled();
    });

    // TESTE 7 - Usuário inativo
    it('impede atualização por usuário inativo', async () => {
      txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: false,
      });

      await expect(
        service.atualizarEtapa(10, 2, 1),
      ).rejects.toThrow(
        'Usuário inativo não pode atualizar pedidos',
      );

      expect(txMock.pedido.findUnique).not.toHaveBeenCalled();
      expect(txMock.pedido.updateMany).not.toHaveBeenCalled();
      expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
    });

    // TESTE 8 - Usuário inexistente
    it('impede atualização por usuário inexistente', async () => {
      txMock.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.atualizarEtapa(10, 2, 99),
      ).rejects.toThrow('Usuário não encontrado');

      expect(txMock.pedido.updateMany).not.toHaveBeenCalled();
      expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
    });

    // TESTE 9 - Pedido inexistente
    it('impede atualização de pedido inexistente', async () => {
      txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      txMock.pedido.findUnique.mockResolvedValue(null);

      await expect(
        service.atualizarEtapa(999, 2, 1),
      ).rejects.toThrow('Pedido não encontrado');

      expect(txMock.pedido.updateMany).not.toHaveBeenCalled();
      expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
    });

    // TESTE 10 - Retroceder uma etapa
    it('permite retroceder exatamente uma etapa', async () => {
      const dataAtualizacao = new Date(
        '2026-11-08T12:00:00.000Z',
      );

      txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 3,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: dataAtualizacao,
      });

      txMock.etapa.findMany.mockResolvedValue([
        { id: 1, ordem: 1 },
        { id: 2, ordem: 2 },
        { id: 3, ordem: 3 },
        { id: 4, ordem: 4 },
      ]);

      txMock.pedido.updateMany.mockResolvedValue({
        count: 1,
      });

      txMock.historicoEtapa.create.mockResolvedValue({
        id: 101,
        pedidoId: 10,
        etapaId: 2,
        usuarioId: 1,
      });

      txMock.pedido.findUniqueOrThrow.mockResolvedValue({
        id: 10,
        etapaAtualId: 2,
        situacao: 'EM_ANDAMENTO',
      });

      const resultado = await service.atualizarEtapa(
        10,
        2,
        1,
        'Retorno para ajustes',
      );

      expect(txMock.pedido.updateMany).toHaveBeenCalledWith({
        where: {
          id: 10,
          etapaAtualId: 3,
          situacao: 'EM_ANDAMENTO',
          dataUltimaAtualizacao: dataAtualizacao,
        },
        data: {
          etapaAtualId: 2,
          situacao: 'EM_ANDAMENTO',
        },
      });

      expect(txMock.historicoEtapa.create).toHaveBeenCalledWith({
        data: {
          pedidoId: 10,
          etapaId: 2,
          usuarioId: 1,
          observacao: 'Retorno para ajustes',
        },
      });

      expect(resultado.etapaAtualId).toBe(2);
    });

    // TESTE 11 - Mesma etapa
    it('impede atualizar para a mesma etapa', async () => {
      txMock.usuario.findUnique.mockResolvedValue({
        id: 1,
        ativo: true,
      });

      txMock.pedido.findUnique.mockResolvedValue({
        id: 10,
        etapaAtualId: 2,
        situacao: 'EM_ANDAMENTO',
        dataUltimaAtualizacao: new Date(),
      });

      txMock.etapa.findMany.mockResolvedValue([
        { id: 1, ordem: 1 },
        { id: 2, ordem: 2 },
        { id: 3, ordem: 3 },
      ]);

      await expect(
        service.atualizarEtapa(10, 2, 1),
      ).rejects.toThrow(
        'Só é permitido avançar ou retroceder uma etapa por vez',
      );

      expect(txMock.pedido.updateMany).not.toHaveBeenCalled();
      expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
    });

    // TESTE 12 - Conflito transacional do Prisma
   
    it('retorna conflito HTTP 409 quando o Prisma lança P2034', async () => {
    const erro = new Prisma.PrismaClientKnownRequestError(
        'Conflito transacional',
        {
        code: 'P2034',
        clientVersion: 'teste',
        },
    );

    // Simula o Prisma rejeitando a transação
    prismaMock.$transaction.mockRejectedValue(erro);

    await expect(
        service.atualizarEtapa(10, 2, 1),
    ).rejects.toThrow(
        'Conflito ao atualizar o pedido. Atualize os dados e tente novamente.',
    );

        expect(txMock.pedido.updateMany).not.toHaveBeenCalled();
        expect(txMock.historicoEtapa.create).not.toHaveBeenCalled();
    });



  });
});
