import {
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

    // Documenta o comportamento atual quando não há etapas no banco
    it('cria o pedido sem etapa quando não existe nenhuma etapa', async () => {
      usuarioAtivo();
      prismaMock.etapa.findFirst.mockResolvedValue(null);
      prismaMock.pedido.create.mockImplementation(({ data }) => data);

      const pedido = await service.criar(dto, 1);

      expect(pedido).not.toHaveProperty('etapaAtualId');
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
    // Requisito: consultar pelo código
    it('normaliza o código (espaços e minúsculas)', async () => {
      prismaMock.pedido.findUnique.mockResolvedValue({ id: 1 });

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
      prismaMock.pedido.findUnique.mockResolvedValue({ id: 1 });

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
});