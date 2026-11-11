import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  const prismaMock = { usuario: { findUnique: jest.fn() } };
  const usuario = {
    id: 1,
    nome: 'Ana',
    email: 'ana@example.com',
    senhaHash: 'hash-interno',
    perfil: 'FUNCIONARIO',
    cargo: null,
    telefone: null,
    ativo: true,
    criadoEm: new Date('2026-11-01T12:00:00Z'),
    atualizadoEm: new Date('2026-11-01T12:00:00Z'),
  };
  const publico = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    cargo: usuario.cargo,
    telefone: usuario.telefone,
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
  };
  const publicSelect = {
    id: true,
    nome: true,
    email: true,
    perfil: true,
    cargo: true,
    telefone: true,
    ativo: true,
    criadoEm: true,
    atualizadoEm: true,
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    // Simula a projeção do Prisma sobre um registro que contém senhaHash.
    prismaMock.usuario.findUnique.mockImplementation(
      ({ select }: { select: Record<string, boolean> }) =>
        Promise.resolve(
          Object.fromEntries(
            Object.entries(usuario).filter(([campo]) => select[campo]),
          ),
        ),
    );
    const modulo = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = modulo.get(UsuariosService);
  });

  it('busca por email normalizado e retorna somente campos públicos sem senhaHash', async () => {
    const resultado = await service.buscarPorEmail('  ANA@Example.COM  ');
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: usuario.email },
      select: publicSelect,
    });
    expect(resultado).toEqual(publico);
    expect(resultado).not.toHaveProperty('senhaHash');
  });

  it('retorna null quando o email não existe', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);
    await expect(
      service.buscarPorEmail('ausente@example.com'),
    ).resolves.toBeNull();
  });

  it('busca por id e retorna somente campos públicos sem senhaHash', async () => {
    const resultado = await service.buscarPorId(1);
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: publicSelect,
    });
    expect(resultado).toEqual(publico);
    expect(resultado).not.toHaveProperty('senhaHash');
  });

  it('retorna null quando o id não existe', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);
    await expect(service.buscarPorId(99)).resolves.toBeNull();
  });

  it('consulta credenciais com email normalizado e apenas os cinco campos internos', async () => {
    const resultado =
      await service.buscarCredenciaisPorEmail(' ANA@EXAMPLE.COM ');
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: usuario.email },
      select: {
        id: true,
        email: true,
        senhaHash: true,
        perfil: true,
        ativo: true,
      },
    });
    expect(resultado).toEqual({
      id: 1,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      perfil: usuario.perfil,
      ativo: true,
    });
  });

  it('retorna null para credenciais inexistentes', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);
    await expect(
      service.buscarCredenciaisPorEmail('ausente@example.com'),
    ).resolves.toBeNull();
  });

  it('permite usuário ativo consultando apenas id e ativo', async () => {
    await expect(service.garantirUsuarioAtivo(1)).resolves.toBeUndefined();
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: { id: true, ativo: true },
    });
  });

  it('lança NotFoundException para usuário inexistente', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);
    await expect(service.garantirUsuarioAtivo(99)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança ForbiddenException para usuário inativo', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue({ id: 1, ativo: false });
    await expect(service.garantirUsuarioAtivo(1)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('permite email disponível e normaliza a consulta selecionando apenas id', async () => {
    prismaMock.usuario.findUnique.mockResolvedValue(null);
    await expect(
      service.garantirEmailDisponivel(' NOVO@Example.COM '),
    ).resolves.toBeUndefined();
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'novo@example.com' },
      select: { id: true },
    });
  });

  it('lança ConflictException para email ocupado', async () => {
    await expect(
      service.garantirEmailDisponivel(usuario.email),
    ).rejects.toThrow(ConflictException);
  });

  it('permite conservar o email do próprio usuário', async () => {
    await expect(
      service.garantirEmailDisponivel(' ANA@EXAMPLE.COM ', 1),
    ).resolves.toBeUndefined();
    expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: usuario.email },
      select: { id: true },
    });
  });

  it('não ignora email pertencente a outro usuário na edição', async () => {
    await expect(
      service.garantirEmailDisponivel(usuario.email, 2),
    ).rejects.toThrow(ConflictException);
  });

  it('propaga falhas do Prisma sem tratá-las como email disponível', async () => {
    const erro = new Error('Falha de consulta');
    prismaMock.usuario.findUnique.mockRejectedValue(erro);
    await expect(service.garantirEmailDisponivel(usuario.email)).rejects.toBe(
      erro,
    );
  });
});
