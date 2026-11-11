import type { Prisma } from '../generated/prisma/client';

export const usuarioPublicoSelect = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  cargo: true,
  telefone: true,
  ativo: true,
  criadoEm: true,
  atualizadoEm: true,
} as const satisfies Prisma.UsuarioSelect;

export type UsuarioPublico = Prisma.UsuarioGetPayload<{
  select: typeof usuarioPublicoSelect;
}>;
