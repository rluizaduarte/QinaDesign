import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { usuarioPublicoSelect } from '../usuarios/usuario-publico';
import { AtualizarFuncionarioDto } from './dto/atualizar-funcionario.dto';
import { FuncionariosService } from './funcionarios.service';

jest.mock('bcrypt', () => ({ hash: jest.fn() }));

describe('FuncionariosService', () => {
  let service: FuncionariosService;
  const prismaMock = {
    usuario: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const usuariosMock = { garantirEmailDisponivel: jest.fn() };
  const hashMock = bcrypt.hash as jest.Mock;
  const dto = {
    nome: 'Ana',
    email: ' ANA@Example.COM ',
    senha: 'Inicial@123',
    cargo: 'Projetista',
    telefone: '11999999999',
  };
  const registro = {
    id: 1,
    nome: 'Ana',
    email: 'ana@example.com',
    senhaHash: 'hash-interno',
    perfil: 'FUNCIONARIO',
    cargo: 'Projetista',
    telefone: '11999999999',
    ativo: true,
    criadoEm: new Date('2026-11-01T12:00:00Z'),
    atualizadoEm: new Date('2026-11-01T12:00:00Z'),
  };
  let registros: (typeof registro)[];
  const erroPrisma = (code: string) =>
    new Prisma.PrismaClientKnownRequestError('Falha Prisma', {
      code,
      clientVersion: '7.10.1',
    });
  const projetar = (item: typeof registro, select: Record<string, boolean>) =>
    Object.fromEntries(Object.entries(item).filter(([campo]) => select[campo]));

  beforeEach(async () => {
    jest.resetAllMocks();
    registros = [{ ...registro }];
    prismaMock.usuario.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        registros.find(
          (item) => item.id === where.id && item.perfil === where.perfil,
        )
          ? { id: where.id }
          : null,
      ),
    );
    hashMock.mockResolvedValue('hash-interno');
    prismaMock.usuario.create.mockImplementation(({ data, select }) =>
      Promise.resolve(projetar({ ...registro, ...data }, select)),
    );
    // Simula o filtro da escrita e a projeção do Prisma sem conectar ao banco.
    prismaMock.usuario.update.mockImplementation(({ where, data, select }) => {
      const item = registros.find(
        (usuario) => usuario.id === where.id && usuario.perfil === where.perfil,
      );
      if (!item) return Promise.reject(erroPrisma('P2025'));
      Object.assign(item, data);
      return Promise.resolve(projetar(item, select));
    });
    prismaMock.usuario.findMany.mockImplementation(
      ({ where, orderBy, select }) =>
        Promise.resolve(
          registros
            .filter((item) => item.perfil === where.perfil)
            .sort((a, b) => {
              for (const ordem of orderBy) {
                if (ordem.nome) {
                  const comparacao = a.nome.localeCompare(b.nome);
                  if (comparacao) return comparacao;
                }
                if (ordem.id) return a.id - b.id;
              }
              return 0;
            })
            .map((item) => projetar(item, select)),
        ),
    );
    const modulo = await Test.createTestingModule({
      providers: [
        FuncionariosService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: UsuariosService, useValue: usuariosMock },
      ],
    }).compile();
    service = modulo.get(FuncionariosService);
  });

  it('cadastra com email normalizado, hash, perfil e atividade fixos e resposta pública', async () => {
    const resultado = await service.criar({
      ...dto,
      perfil: 'ADMINISTRADOR',
      ativo: false,
      senhaHash: 'injetado',
    } as typeof dto);
    expect(usuariosMock.garantirEmailDisponivel).toHaveBeenCalledWith(
      'ana@example.com',
    );
    expect(hashMock).toHaveBeenCalledWith(dto.senha, 10);
    expect(prismaMock.usuario.create).toHaveBeenCalledWith({
      data: {
        nome: dto.nome,
        email: 'ana@example.com',
        senhaHash: 'hash-interno',
        cargo: dto.cargo,
        telefone: dto.telefone,
        perfil: 'FUNCIONARIO',
        ativo: true,
      },
      select: usuarioPublicoSelect,
    });
    expect(resultado).not.toHaveProperty('senhaHash');
    expect(resultado).not.toHaveProperty('senha');
  });

  it('impede cadastro com email ocupado antes de gerar hash ou gravar', async () => {
    usuariosMock.garantirEmailDisponivel.mockRejectedValue(
      new ConflictException(),
    );
    await expect(service.criar(dto)).rejects.toThrow(ConflictException);
    expect(hashMock).not.toHaveBeenCalled();
    expect(prismaMock.usuario.create).not.toHaveBeenCalled();
  });

  it('não grava quando bcrypt falha', async () => {
    const erro = new Error('bcrypt');
    hashMock.mockRejectedValue(erro);
    await expect(service.criar(dto)).rejects.toBe(erro);
    expect(prismaMock.usuario.create).not.toHaveBeenCalled();
  });

  it.each(['criar', 'atualizar'] as const)(
    'converte P2002 em conflito ao %s',
    async (metodo) => {
      prismaMock.usuario.create.mockRejectedValue(erroPrisma('P2002'));
      prismaMock.usuario.update.mockRejectedValue(erroPrisma('P2002'));
      await expect(
        metodo === 'criar'
          ? service.criar(dto)
          : service.atualizar(1, { email: dto.email }),
      ).rejects.toThrow(ConflictException);
    },
  );

  it('lista ativos e inativos, exclui administradores e ordena por nome e ID', async () => {
    registros = [
      { ...registro, id: 3, nome: 'Zelia' },
      { ...registro, id: 2, ativo: false },
      { ...registro, id: 4, perfil: 'ADMINISTRADOR' },
      { ...registro },
    ];
    const resultado = await service.listar();
    expect(prismaMock.usuario.findMany).toHaveBeenCalledWith({
      where: { perfil: 'FUNCIONARIO' },
      orderBy: [{ nome: 'asc' }, { id: 'asc' }],
      select: usuarioPublicoSelect,
    });
    expect(resultado.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(resultado[1].ativo).toBe(false);
    resultado.forEach((item) => expect(item).not.toHaveProperty('senhaHash'));
  });

  it('retorna array vazio quando não há funcionários', async () => {
    registros = [];
    await expect(service.listar()).resolves.toEqual([]);
  });

  it('atualiza só campos permitidos e normaliza email ignorando o próprio ID', async () => {
    const resultado = await service.atualizar(1, {
      nome: 'Ana Maria',
      email: dto.email,
      cargo: 'Montagem',
      telefone: '11888888888',
      senha: 'Outra@123',
      senhaHash: 'outro',
      perfil: 'ADMINISTRADOR',
      ativo: false,
    } as AtualizarFuncionarioDto);
    expect(usuariosMock.garantirEmailDisponivel).toHaveBeenCalledWith(
      'ana@example.com',
      1,
    );
    expect(prismaMock.usuario.update).toHaveBeenCalledWith({
      where: { id: 1, perfil: 'FUNCIONARIO' },
      data: {
        nome: 'Ana Maria',
        email: 'ana@example.com',
        cargo: 'Montagem',
        telefone: '11888888888',
      },
      select: usuarioPublicoSelect,
    });
    expect(registros[0].senhaHash).toBe('hash-interno');
    expect(resultado.perfil).toBe('FUNCIONARIO');
    expect(resultado.ativo).toBe(true);
    expect(resultado).not.toHaveProperty('senhaHash');
    expect(hashMock).not.toHaveBeenCalled();
  });

  it('preserva campos omitidos e dados de outros usuários', async () => {
    registros.push({ ...registro, id: 2, perfil: 'ADMINISTRADOR' });
    const antes = registros.map((item) => ({ ...item }));
    await service.atualizar(1, { nome: 'Novo nome' });
    expect(registros[0]).toEqual({ ...antes[0], nome: 'Novo nome' });
    expect(registros[1]).toEqual(antes[1]);
    expect(usuariosMock.garantirEmailDisponivel).not.toHaveBeenCalled();
  });

  it('permite limpar cargo e telefone com null', async () => {
    const resultado = await service.atualizar(1, {
      cargo: null,
      telefone: null,
    } as unknown as AtualizarFuncionarioDto);
    expect(resultado.cargo).toBeNull();
    expect(resultado.telefone).toBeNull();
  });

  it.each(['nome', 'email'])(
    'rejeita null em %s antes de gravar',
    async (campo) => {
      await expect(
        service.atualizar(1, { [campo]: null } as AtualizarFuncionarioDto),
      ).rejects.toThrow(BadRequestException);
      expect(prismaMock.usuario.update).not.toHaveBeenCalled();
    },
  );

  it('impede atualização com email ocupado', async () => {
    usuariosMock.garantirEmailDisponivel.mockRejectedValue(
      new ConflictException(),
    );
    await expect(service.atualizar(1, { email: dto.email })).rejects.toThrow(
      ConflictException,
    );
    expect(prismaMock.usuario.update).not.toHaveBeenCalled();
  });

  it.each([
    ['desativar', false],
    ['reativar', true],
  ] as const)(
    '%s altera só atividade e aceita repetição',
    async (metodo, ativo) => {
      registros[0].ativo = !ativo;
      const antes = { ...registros[0] };
      const resultado = await service[metodo](1);
      await expect(service[metodo](1)).resolves.toEqual(resultado);
      expect(prismaMock.usuario.update).toHaveBeenCalledWith({
        where: { id: 1, perfil: 'FUNCIONARIO' },
        data: { ativo },
        select: usuarioPublicoSelect,
      });
      expect(registros[0]).toEqual({ ...antes, ativo });
      expect(resultado).not.toHaveProperty('senhaHash');
    },
  );

  it.each(['atualizar', 'desativar', 'reativar'] as const)(
    '%s protege administrador e trata inexistente/P2025',
    async (metodo) => {
      registros[0].perfil = 'ADMINISTRADOR';
      const antes = { ...registros[0] };
      const executar = (id: number) =>
        metodo === 'atualizar'
          ? service.atualizar(id, { nome: 'Outro' })
          : service[metodo](id);
      await expect(executar(1)).rejects.toThrow(NotFoundException);
      await expect(executar(99)).rejects.toThrow(NotFoundException);
      expect(registros[0]).toEqual(antes);
    },
  );

  it.each(['criar', 'listar', 'atualizar', 'desativar', 'reativar'] as const)(
    '%s propaga erros inesperados',
    async (metodo) => {
      const erro = new Error('Falha inesperada');
      prismaMock.usuario.create.mockRejectedValue(erro);
      prismaMock.usuario.findMany.mockRejectedValue(erro);
      prismaMock.usuario.update.mockRejectedValue(erro);
      const resultado =
        metodo === 'criar'
          ? service.criar(dto)
          : metodo === 'listar'
            ? service.listar()
            : metodo === 'atualizar'
              ? service.atualizar(1, {})
              : service[metodo](1);
      await expect(resultado).rejects.toBe(erro);
    },
  );

  it('não converte outros erros conhecidos do Prisma em conflito', async () => {
    const erro = erroPrisma('P2003');
    prismaMock.usuario.create.mockRejectedValue(erro);
    await expect(service.criar(dto)).rejects.toBe(erro);
  });

  it('trata P2025 quando o funcionário desaparece entre consulta e escrita', async () => {
    prismaMock.usuario.update.mockRejectedValue(erroPrisma('P2025'));
    await expect(service.atualizar(1, { nome: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('rejeita administrador antes de verificar disponibilidade de email', async () => {
    registros[0].perfil = 'ADMINISTRADOR';
    await expect(service.atualizar(1, { email: dto.email })).rejects.toThrow(
      NotFoundException,
    );
    expect(usuariosMock.garantirEmailDisponivel).not.toHaveBeenCalled();
    expect(prismaMock.usuario.update).not.toHaveBeenCalled();
  });
});
