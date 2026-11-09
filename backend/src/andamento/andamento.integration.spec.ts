import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { Prisma, type Pedido } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AndamentoService } from './andamento.service';

// Execução explícita: os testes unitários habituais não acessam PostgreSQL.
// Não carrega .env e nunca utiliza DATABASE_URL como fallback.
const integrar =
  process.env.QINA_INTEGRATION === '1' ? describe : describe.skip;

function validarConexao(valor: string | undefined): string {
  const mensagem =
    'TEST_DATABASE_URL deve apontar exclusivamente para localhost/127.0.0.1:5433/qina_design_test, sem parâmetros ou fragmento.';
  if (!valor) throw new Error(mensagem);
  let url: URL;
  try {
    url = new URL(valor);
  } catch {
    // Não incluir a URL no erro: ela contém credenciais.
    throw new Error(mensagem);
  }
  if (
    !['postgres:', 'postgresql:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1'].includes(url.hostname) ||
    url.port !== '5433' ||
    url.pathname !== '/qina_design_test' ||
    url.search !== '' ||
    url.hash !== ''
  ) {
    throw new Error(mensagem);
  }
  return url.toString();
}

// Ambas as consultas reais já terminaram quando a barreira é liberada.
// Timeout próprio evita uma transação presa se a segunda leitura falhar.
function criarBarreira() {
  let chegadas = 0;
  let liberar!: () => void;
  let rejeitar!: (erro: Error) => void;
  const promessa = new Promise<void>((resolve, reject) => {
    liberar = resolve;
    rejeitar = reject;
  });
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    async esperar() {
      chegadas++;
      if (chegadas === 1) {
        timer = setTimeout(
          () => rejeitar(new Error('A segunda leitura não chegou à barreira.')),
          3000,
        );
      }
      if (chegadas === 2) {
        clearTimeout(timer);
        liberar();
      }
      await promessa;
    },
    fechar() {
      clearTimeout(timer);
    },
  };
}

integrar('AndamentoService — integração PostgreSQL 16', () => {
  const marca = `andamento-it-${randomUUID()}`;
  let banco: PrismaService | undefined;
  let leitor: PrismaService | undefined;
  let preparado = false;
  let pedido: Pedido;
  let usuarioId: number;
  let usuarioExcluidoId: number;
  let etapas: { id: number; ordem: number }[] = [];
  const pedidosCriados: number[] = [];
  const usuariosCriados: number[] = [];
  const etapasCriadas: number[] = [];

  beforeAll(async () => {
    // Obrigatoriamente antes da construção dos clients e de qualquer escrita.
    const conexao = validarConexao(process.env.TEST_DATABASE_URL);
    banco = new PrismaService(new ConfigService({ DATABASE_URL: conexao }));
    leitor = new PrismaService(new ConfigService({ DATABASE_URL: conexao }));
    await Promise.all([banco.$connect(), leitor.$connect()]);
    const [destino] = await banco.$queryRaw<
      { banco: string; versao: number; isolamento: string; esquema: string }[]
    >`
      SELECT current_database() AS banco,
             current_setting('server_version_num')::int AS versao,
             current_setting('transaction_isolation') AS isolamento,
             current_schema() AS esquema
    `;
    if (
      destino?.banco !== 'qina_design_test' ||
      destino.versao < 160000 ||
      destino.versao >= 170000 ||
      destino.isolamento !== 'read committed' ||
      destino.esquema !== 'public'
    ) {
      throw new Error(
        'Integração exige qina_design_test, PostgreSQL 16, READ COMMITTED e schema public. Nenhum dado foi criado.',
      );
    }
    preparado = true;
  }, 20000);

  beforeEach(async () => {
    if (!preparado || !banco) throw new Error('Banco de testes não validado.');
    const sufixo = randomUUID();
    // Nunca reaproveita usuários, etapas ou pedidos preexistentes.
    for (const papel of ['responsavel', 'referencia-invalida']) {
      const usuario = await banco.usuario.create({
        data: {
          nome: `${marca}-${papel}`,
          email: `${marca}-${sufixo}-${papel}@example.invalid`,
          senhaHash: 'fixture-sem-login',
          perfil: 'FUNCIONARIO',
        },
      });
      usuariosCriados.push(usuario.id);
      if (papel === 'responsavel') usuarioId = usuario.id;
      else usuarioExcluidoId = usuario.id;
    }
    // ID realmente alocado e depois excluído: não depende de adivinhar um ID livre.
    await banco.usuario.delete({ where: { id: usuarioExcluidoId } });

    const maior = await banco.etapa.findFirst({ orderBy: { ordem: 'desc' } });
    etapas = [];
    for (let i = 1; i <= 4; i++) {
      const etapa = await banco.etapa.create({
        data: {
          nome: `${marca}-${sufixo}-etapa-${i}`,
          ordem: (maior?.ordem ?? 0) + i,
        },
      });
      etapasCriadas.push(etapa.id);
      etapas.push(etapa);
    }
    pedido = await banco.pedido.create({
      data: {
        codigo: `${marca}-${sufixo}`,
        nomeCliente: 'Cliente sintético de integração',
        titulo: 'Pedido sintético de integração',
        dataInicio: new Date('2026-01-01T12:00:00Z'),
        etapaAtualId: etapas[1].id,
        criadoPorId: usuarioId,
      },
    });
    pedidosCriados.push(pedido.id);
  }, 20000);

  afterEach(async () => {
    if (!preparado || !banco) return;
    // IDs capturados e marca da execução: nenhum DELETE global.
    // Pedido -> históricos usa o Cascade já existente no schema.
    await banco.pedido.deleteMany({
      where: { id: { in: pedidosCriados }, codigo: { startsWith: marca } },
    });
    await banco.etapa.deleteMany({
      where: { id: { in: etapasCriadas }, nome: { startsWith: marca } },
    });
    await banco.usuario.deleteMany({
      where: { id: { in: usuariosCriados }, nome: { startsWith: marca } },
    });
    pedidosCriados.length = 0;
    etapasCriadas.length = 0;
    usuariosCriados.length = 0;
  }, 20000);

  afterAll(async () => {
    await Promise.all([banco?.$disconnect(), leitor?.$disconnect()]);
  }, 10000);

  it('confirma somente uma transição concorrente e exatamente um histórico', async () => {
    const prisma = banco!;
    const barreira = criarBarreira();
    const leituras: { etapaAtualId: number | null; atualizacao: number }[] = [];
    const contagens: number[] = [];
    const antes = await leitor!.historicoEtapa.count({
      where: { pedidoId: pedido.id },
    });
    const sincronizado = prisma.$extends({
      query: {
        pedido: {
          async findUnique({ args, query }) {
            const resultado = await query(args); // SELECT real, dentro do tx.
            if (args.where.id === pedido.id && resultado) {
              if (
                resultado.etapaAtualId === undefined ||
                !(resultado.dataUltimaAtualizacao instanceof Date)
              ) {
                throw new Error(
                  'A leitura deve incluir etapa e timestamp reais.',
                );
              }
              leituras.push({
                etapaAtualId: resultado.etapaAtualId,
                atualizacao: resultado.dataUltimaAtualizacao.getTime(),
              });
              await barreira.esperar();
            }
            return resultado;
          },
          async updateMany({ args, query }) {
            const resultado = await query(args); // UPDATE real, sem mock.
            contagens.push(resultado.count);
            return resultado;
          },
        },
      },
    });
    // O cast adapta somente o tipo DI; o objeto é um Prisma real com extensão.
    const service = new AndamentoService(
      sincronizado as unknown as PrismaService,
    );
    try {
      const resultados = await Promise.allSettled([
        service.atualizarEtapa(
          pedido.id,
          etapas[0].id,
          usuarioId,
          '  retrocesso  ',
        ),
        service.atualizarEtapa(
          pedido.id,
          etapas[2].id,
          usuarioId,
          '  avanço  ',
        ),
      ]);
      expect(leituras).toEqual([
        {
          etapaAtualId: pedido.etapaAtualId,
          atualizacao: pedido.dataUltimaAtualizacao.getTime(),
        },
        {
          etapaAtualId: pedido.etapaAtualId,
          atualizacao: pedido.dataUltimaAtualizacao.getTime(),
        },
      ]);
      expect(contagens.sort()).toEqual([0, 1]);
      const sucessos = resultados.filter((item) => item.status === 'fulfilled');
      const falhas = resultados.filter((item) => item.status === 'rejected');
      expect(sucessos).toHaveLength(1);
      expect(falhas).toHaveLength(1);
      const falha = falhas[0];
      if (falha.status !== 'rejected')
        throw new Error('Conflito não observado.');
      expect(falha.reason).toBeInstanceOf(ConflictException);
      expect((falha.reason as ConflictException).getStatus()).toBe(409);

      // Outro client só pode enxergar os dados já confirmados.
      const persistido = await leitor!.pedido.findUniqueOrThrow({
        where: { id: pedido.id },
      });
      const historicos = await leitor!.historicoEtapa.findMany({
        where: { pedidoId: pedido.id },
      });
      expect(historicos).toHaveLength(antes + 1);
      expect(persistido.situacao).toBe('EM_ANDAMENTO');
      expect(historicos[0].etapaId).toBe(persistido.etapaAtualId);
      expect(historicos[0].usuarioId).toBe(usuarioId);
      expect(historicos[0].observacao).toBe(
        persistido.etapaAtualId === etapas[0].id ? 'retrocesso' : 'avanço',
      );
      expect(historicos[0].dataHora).toBeInstanceOf(Date);
      const sucesso = sucessos[0];
      if (sucesso.status !== 'fulfilled')
        throw new Error('Commit não observado.');
      expect(sucesso.value.etapaAtualId).toBe(persistido.etapaAtualId);
    } finally {
      barreira.fechar();
    }
  }, 20000);

  it('desfaz o UPDATE real quando o PostgreSQL rejeita o INSERT do histórico', async () => {
    let atualizacoesReais = 0;
    let insercoesReais = 0;
    const antes = await leitor!.pedido.findUniqueOrThrow({
      where: { id: pedido.id },
    });
    const historicosAntes = await leitor!.historicoEtapa.findMany({
      where: { pedidoId: pedido.id },
    });
    const comFalhaDeFK = banco!.$extends({
      query: {
        pedido: {
          async updateMany({ args, query }) {
            const resultado = await query(args);
            atualizacoesReais += resultado.count;
            return resultado;
          },
        },
        historicoEtapa: {
          async create({ args, query }) {
            if (
              typeof args.data.pedidoId !== 'number' ||
              typeof args.data.etapaId !== 'number'
            ) {
              throw new Error(
                'Esperado histórico com IDs escalares do service.',
              );
            }
            insercoesReais++;
            // Fault injection só neste client: o INSERT chega ao PostgreSQL
            // com uma FK inexistente. Não lança erro artificial nem usa DDL.
            const data: Prisma.HistoricoEtapaUncheckedCreateInput = {
              pedidoId: args.data.pedidoId,
              etapaId: args.data.etapaId,
              usuarioId: usuarioExcluidoId,
              observacao: args.data.observacao,
              dataHora: args.data.dataHora,
            };
            return query({ ...args, data });
          },
        },
      },
    });
    const service = new AndamentoService(
      comFalhaDeFK as unknown as PrismaService,
    );
    await expect(
      service.atualizarEtapa(
        pedido.id,
        etapas[2].id,
        usuarioId,
        'Não deve persistir',
      ),
    ).rejects.toMatchObject({ code: 'P2003' });
    expect(atualizacoesReais).toBe(1);
    expect(insercoesReais).toBe(1);

    const depois = await leitor!.pedido.findUniqueOrThrow({
      where: { id: pedido.id },
    });
    expect(depois).toEqual(antes); // Inclui etapa, situação e timestamp original.
    expect(
      await leitor!.historicoEtapa.findMany({ where: { pedidoId: pedido.id } }),
    ).toEqual(historicosAntes);
    expect(historicosAntes).toHaveLength(0);
  }, 15000);

  it('finaliza na última etapa e impede novas alterações sem adicionar histórico', async () => {
    const service = new AndamentoService(banco!);
    await service.atualizarEtapa(pedido.id, etapas[2].id, usuarioId);
    await service.atualizarEtapa(
      pedido.id,
      etapas[3].id,
      usuarioId,
      '  Finalizado  ',
    );
    const finalizado = await leitor!.pedido.findUniqueOrThrow({
      where: { id: pedido.id },
    });
    expect(finalizado.etapaAtualId).toBe(etapas[3].id);
    expect(finalizado.situacao).toBe('FINALIZADO');
    const historicos = await leitor!.historicoEtapa.findMany({
      where: { pedidoId: pedido.id },
      orderBy: { id: 'asc' },
    });
    expect(historicos).toHaveLength(2);
    expect(historicos[0].observacao).toBeNull();
    expect(historicos[1]).toMatchObject({
      etapaId: etapas[3].id,
      usuarioId,
      observacao: 'Finalizado',
    });
    expect(historicos[1].dataHora).toBeInstanceOf(Date);
    await expect(
      service.atualizarEtapa(pedido.id, etapas[2].id, usuarioId),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(
      await leitor!.pedido.findUniqueOrThrow({ where: { id: pedido.id } }),
    ).toEqual(finalizado);
    expect(
      await leitor!.historicoEtapa.findMany({
        where: { pedidoId: pedido.id },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(historicos);
  }, 15000);
});
