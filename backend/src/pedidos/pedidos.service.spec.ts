import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from './pedidos.service';

describe('PedidosService', () => {
  let service: PedidosService;

  // Prisma falso: cada função é um "espião" que devolve o que combinarmos
  const prismaMock = {
    usuario: { findUnique: jest.fn() },
    etapa: { findFirst: jest.fn(), findMany: jest.fn() },
    pedido: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),

    },
    $transaction: jest.fn(),
  };

  const dto = {
    nomeCliente: 'Ana',
    titulo: 'Convite de casamento',
    dataInicio: '2026-11-20',
  };

  const usuarioAtivo = () =>
    prismaMock.usuario.findUnique.mockResolvedValue({ id: 1, ativo: true });
  const usuarioInativo = () =>
    prismaMock.usuario.findUnique.mockResolvedValue({ id: 1, ativo: false });
  const erroDuplicado = () =>
    new Prisma.PrismaClientKnownRequestError('duplicado', {
      code: 'P2002',
      clientVersion: 'teste',
    });

  beforeEach(async () => {
    jest.resetAllMocks(); // cada teste começa do zero
    prismaMock.etapa.findMany.mockResolvedValue([]); // lista de etapas vazia por padrão
    const modulo = await Test.createTestingModule({
      providers: [
        PedidosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = modulo.get(PedidosService);
  });

  describe('criar', () => {
    // Requisito: impedir operações de usuários inativos
    it('recusa usuário inativo e não grava nada', async () => {
      usuarioInativo();

      await expect(service.criar(dto, 1)).rejects.toThrow(ForbiddenException);
      expect(prismaMock.pedido.create).not.toHaveBeenCalled();
    });

    // Garante que um id inválido não passa
    it('recusa usuário inexistente', async () => {
      prismaMock.usuario.findUnique.mockResolvedValue(null);

      await expect(service.criar(dto, 99)).rejects.toThrow(NotFoundException);
    });

    // Requisitos: cadastrar, gerar código e registrar criadoPorId
    it('cria o pedido com código, criadoPorId e etapa inicial', async () => {
      usuarioAtivo();
      prismaMock.etapa.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.pedido.create.mockImplementation(({ data }) => data);

      const pedido = await service.criar(dto, 1);

      expect(pedido.codigo).toMatch(/^QD-\d{4}-[A-Z0-9]{6}$/);
      expect(pedido.criadoPorId).toBe(1);
      expect(pedido.etapaAtualId).toBe(10);
      expect(prismaMock.pedido.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            historicos: {
              create: {
                etapaId: 10,
                usuarioId: 1,
              },
            },
          }),
        }),
      );
    });

    // Requisito: impedir códigos repetidos (a parte da nova tentativa)
    it('tenta de novo quando o código já existe', async () => {
      usuarioAtivo();
      prismaMock.etapa.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.pedido.create
        .mockRejectedValueOnce(erroDuplicado())
        .mockImplementation(({ data }) => data);

      const pedido = await service.criar(dto, 1);

      expect(prismaMock.pedido.create).toHaveBeenCalledTimes(2);
      expect(pedido.codigo).toBeDefined();
    });

    // Evita um loop infinito se o banco sempre recusar
    it('desiste depois de 5 tentativas com código repetido', async () => {
      usuarioAtivo();
      prismaMock.etapa.findFirst.mockResolvedValue({ id: 10 });
      prismaMock.pedido.create.mockRejectedValue(erroDuplicado());

      await expect(service.criar(dto, 1)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(prismaMock.pedido.create).toHaveBeenCalledTimes(5);
    });

    // Impede cadastrar pedidos sem uma etapa inicial
    it('não cria pedido quando não existem etapas cadastradas', async () => {
      usuarioAtivo();
      prismaMock.etapa.findFirst.mockResolvedValue(null);

      await expect(service.criar(dto, 1)).rejects.toThrow(
        'Não há etapas cadastradas para iniciar o pedido',
      );

      expect(prismaMock.pedido.create).not.toHaveBeenCalled();
    });
  });

  describe('listar', () => {
    it('recusa usuário inativo', async () => {
      usuarioInativo();

      await expect(service.listar({}, 1)).rejects.toThrow(ForbiddenException);
    });

    // Requisito: listar (a conta da paginação)
    it('aplica a paginação e calcula o total de páginas', async () => {
      usuarioAtivo();
      prismaMock.$transaction.mockResolvedValue([[{ id: 1 }], 25]);

      const resultado = await service.listar({ page: 2, limit: 10 }, 1);

      expect(prismaMock.pedido.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
      expect(resultado.total).toBe(25);
      expect(resultado.totalPaginas).toBe(3);
    });

    // Requisito: pesquisar
    it('monta a pesquisa por texto e o filtro de situação', async () => {
      usuarioAtivo();
      prismaMock.$transaction.mockResolvedValue([[], 0]);

      await service.listar({ search: 'ana', situacao: 'EM_ANDAMENTO' }, 1);

      expect(prismaMock.pedido.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            situacao: 'EM_ANDAMENTO',
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('buscarPorCodigo', () => {
    // IDs e posições das observações não representam a ordem das etapas.
    const etapas = [
      { id: 30, nome: 'Projeto', ordem: 10 },
      { id: 10, nome: 'Produção', ordem: 20 },
      { id: 20, nome: 'Entrega', ordem: 30 },
    ];
    const primeiraData = new Date('2026-11-01T12:00:00Z');
    const ultimaData = new Date('2026-11-03T12:00:00Z');
    const criarPedido = () => ({
      id: 100,
      codigo: 'QD-2026-ABC123',
      nomeCliente: 'Ana',
      titulo: 'Convite',
      situacao: 'EM_ANDAMENTO',
      criadoEm: primeiraData,
      dataUltimaAtualizacao: ultimaData,
      etapaAtualId: 10,
      etapaAtual: etapas[1],
      criadoPorId: 99,
      criadoPor: { email: 'interno@example.com', senhaHash: 'segredo' },
      historicos: [
        { id: 1, etapaId: 30, dataHora: primeiraData, usuarioId: 99 },
        { id: 2, etapaId: 10, dataHora: primeiraData, usuarioId: 99 },
        { id: 3, etapaId: 10, dataHora: ultimaData, usuarioId: 99 },
        { id: 4, etapaId: 20, dataHora: ultimaData, usuarioId: 99 },
      ],
      observacoesEtapas: [
        { id: 3, pedidoId: 100, etapaId: 20, observacao: 'Texto futuro', atualizadoEm: ultimaData },
        { id: 1, pedidoId: 100, etapaId: 30, observacao: 'Texto anterior', atualizadoEm: ultimaData },
        { id: 2, pedidoId: 100, etapaId: 10, observacao: 'Texto atual', atualizadoEm: ultimaData },
      ],
    });

    beforeEach(() => {
      prismaMock.pedido.findUnique.mockResolvedValue(criarPedido());
      prismaMock.etapa.findMany.mockResolvedValue(etapas);
    });

    it('associa por etapaId, exibe anteriores e atuais e oculta futuras, preservando datas e status', async () => {
      const resultado = await service.buscarPorCodigo('QD-2026-ABC123');
      expect(resultado.etapas).toEqual([
        { nome: 'Projeto', ordem: 10, dataHora: primeiraData, observacao: 'Texto anterior', status: 'CONCLUIDA' },
        { nome: 'Produção', ordem: 20, dataHora: ultimaData, observacao: 'Texto atual', status: 'ATUAL' },
        { nome: 'Entrega', ordem: 30, dataHora: ultimaData, observacao: null, status: 'PENDENTE' },
      ]);
      expect(prismaMock.pedido.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'QD-2026-ABC123' },
        include: {
          etapaAtual: true,
          historicos: { orderBy: { dataHora: 'asc' }, include: { etapa: true } },
          observacoesEtapas: { select: { etapaId: true, observacao: true } },
        },
      });
      expect(prismaMock.etapa.findMany).toHaveBeenCalledWith({ orderBy: { ordem: 'asc' } });
    });

    it('oculta após retrocesso e volta a exibir ao avançar, sem modificar os registros', async () => {
      const pedido = criarPedido();
      const observacoesAntes = pedido.observacoesEtapas.map((item) => ({ ...item }));
      prismaMock.pedido.findUnique.mockResolvedValue(pedido);
      expect((await service.buscarPorCodigo(pedido.codigo)).etapas[1].observacao).toBe('Texto atual');
      pedido.etapaAtual = etapas[0];
      pedido.etapaAtualId = etapas[0].id;
      const retrocedido = await service.buscarPorCodigo(pedido.codigo);
      expect(retrocedido.etapas.map((item) => item.observacao)).toEqual(['Texto anterior', null, null]);
      expect(retrocedido.etapas.map((item) => item.status)).toEqual(['ATUAL', 'PENDENTE', 'PENDENTE']);
      expect(retrocedido.etapas[1].dataHora).toEqual(ultimaData);
      pedido.etapaAtual = etapas[1];
      pedido.etapaAtualId = etapas[1].id;
      expect((await service.buscarPorCodigo(pedido.codigo)).etapas[1].observacao).toBe('Texto atual');
      expect(pedido.observacoesEtapas).toEqual(observacoesAntes);
      expect(prismaMock.pedido.create).not.toHaveBeenCalled();
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('retorna null quando não há observações, inclusive sem histórico na etapa', async () => {
      prismaMock.pedido.findUnique.mockResolvedValue({
        ...criarPedido(), observacoesEtapas: [], historicos: [],
      });
      const resultado = await service.buscarPorCodigo('QD-2026-ABC123');
      expect(resultado.etapas.map((item) => item.observacao)).toEqual([null, null, null]);
      expect(resultado.etapas.map((item) => item.dataHora)).toEqual([null, null, null]);
      expect(resultado.etapas.map((item) => item.status)).toEqual(['CONCLUIDA', 'ATUAL', 'PENDENTE']);
    });

    it.each(['EM_ANDAMENTO', 'FINALIZADO'])('oculta todas as observações sem etapa atual em %s', async (situacao) => {
      prismaMock.pedido.findUnique.mockResolvedValue({
        ...criarPedido(), situacao, etapaAtualId: null, etapaAtual: null,
      });
      const resultado = await service.buscarPorCodigo('QD-2026-ABC123');
      expect(resultado.etapaAtual).toBeNull();
      expect(resultado.etapas.map((item) => item.observacao)).toEqual([null, null, null]);
      expect(resultado.etapas.map((item) => item.status)).toEqual(
        Array(3).fill(situacao === 'FINALIZADO' ? 'CONCLUIDA' : 'PENDENTE'),
      );
      expect(resultado.etapas[1].dataHora).toEqual(ultimaData);
    });

    it('preserva o contrato público e não expõe campos internos nem usuários', async () => {
      const resultado = await service.buscarPorCodigo('QD-2026-ABC123');
      expect(resultado).toEqual({
        codigo: 'QD-2026-ABC123', nomeCliente: 'Ana', titulo: 'Convite',
        situacao: 'EM_ANDAMENTO', criadoEm: primeiraData, dataUltimaAtualizacao: ultimaData,
        etapaAtual: { nome: 'Produção', ordem: 20 },
        etapas: [
          { nome: 'Projeto', ordem: 10, dataHora: primeiraData, observacao: 'Texto anterior', status: 'CONCLUIDA' },
          { nome: 'Produção', ordem: 20, dataHora: ultimaData, observacao: 'Texto atual', status: 'ATUAL' },
          { nome: 'Entrega', ordem: 30, dataHora: ultimaData, observacao: null, status: 'PENDENTE' },
        ],
      });
      expect(prismaMock.usuario.findUnique).not.toHaveBeenCalled();
    });

    // Requisito: consultar pelo código
    it('normaliza o código (espaços e minúsculas)', async () => {

      await service.buscarPorCodigo('  qd-2026-abc123 ');

      expect(prismaMock.pedido.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { codigo: 'QD-2026-ABC123' } }),
      );
    });

    it('lança 404 quando o pedido não existe', async () => {
      prismaMock.pedido.findUnique.mockResolvedValue(null);

      await expect(service.buscarPorCodigo('QD-0000-AAAAAA')).rejects.toThrow(
        NotFoundException,
      );
    });

    // Protege a decisão da consulta pública (sem usuário logado)
    it('não consulta o usuário quando a busca é pública', async () => {

      await service.buscarPorCodigo('QD-2026-ABC123');

      expect(prismaMock.usuario.findUnique).not.toHaveBeenCalled();
    });

    it('recusa usuário inativo quando a busca é administrativa', async () => {
      usuarioInativo();

      await expect(
        service.buscarPorCodigo('QD-2026-ABC123', 1),
      ).rejects.toThrow(ForbiddenException);
      expect(prismaMock.pedido.findUnique).not.toHaveBeenCalled();
    });
  });
    describe('atualizar', () => {
    const dtoAtualizar = { titulo: 'Novo título' };

    it('recusa usuário inativo e não grava nada', async () => {
      usuarioInativo();

      await expect(service.atualizar(1, dtoAtualizar, 1)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prismaMock.pedido.update).not.toHaveBeenCalled();
    });

    it('lança NotFoundException se o pedido não existe', async () => {
      usuarioAtivo();
      prismaMock.pedido.findUnique.mockResolvedValue(null);

      await expect(service.atualizar(99, dtoAtualizar, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.pedido.update).not.toHaveBeenCalled();
    });

    it('recusa editar pedido finalizado', async () => {
      usuarioAtivo();
      prismaMock.pedido.findUnique.mockResolvedValue({
        id: 1,
        situacao: 'FINALIZADO',
      });

      await expect(service.atualizar(1, dtoAtualizar, 1)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaMock.pedido.update).not.toHaveBeenCalled();
    });

    it('atualiza só os campos enviados', async () => {
      usuarioAtivo();
      prismaMock.pedido.findUnique.mockResolvedValue({
        id: 1,
        situacao: 'EM_ANDAMENTO',
      });
      prismaMock.pedido.update.mockResolvedValue({ id: 1 });

      await service.atualizar(1, dtoAtualizar, 1);

      expect(prismaMock.pedido.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { titulo: 'Novo título' },
        }),
      );
    });

    it('converte dataInicio para Date', async () => {
      usuarioAtivo();
      prismaMock.pedido.findUnique.mockResolvedValue({
        id: 1,
        situacao: 'EM_ANDAMENTO',
      });
      prismaMock.pedido.update.mockResolvedValue({ id: 1 });

      await service.atualizar(1, { dataInicio: '2026-12-01' }, 1);

      expect(prismaMock.pedido.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { dataInicio: new Date('2026-12-01') },
        }),
      );
    });
  });
});
