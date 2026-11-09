import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { Prisma, type Pedido } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from '../pedidos/pedidos.service';
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
  let pedidoInvalidoId: number;
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
        codigo: `${marca}-${sufixo}`.toUpperCase(),
        nomeCliente: 'Cliente sintético de integração',
        titulo: 'Pedido sintético de integração',
        dataInicio: new Date('2026-01-01T12:00:00Z'),
        // Versão inicial distinta do relógio das transições concorrentes.
        dataUltimaAtualizacao: new Date('2026-01-01T12:00:00Z'),
        etapaAtualId: etapas[1].id,
        criadoPorId: usuarioId,
      },
    });
    pedidosCriados.push(pedido.id);
    const pedidoDescartavel = await banco.pedido.create({
      data: {
        codigo: `${marca}-${sufixo}-fk`.toUpperCase(),
        nomeCliente: 'Fixture de referência inválida',
        titulo: 'Pedido descartável',
        dataInicio: pedido.dataInicio,
      },
    });
    pedidosCriados.push(pedidoDescartavel.id);
    pedidoInvalidoId = pedidoDescartavel.id;
    await banco.pedido.delete({ where: { id: pedidoInvalidoId } });
  }, 20000);

  afterEach(async () => {
    if (!preparado || !banco) return;
    // IDs capturados e marca da execução: nenhum DELETE global.
    // Pedido -> históricos e observações usa o Cascade existente no schema.
    await banco.pedido.deleteMany({
      where: { id: { in: pedidosCriados }, codigo: { startsWith: marca.toUpperCase() } },
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

  // Leitura por outro client verifica apenas o estado confirmado no PostgreSQL.
  async function estadoPersistido() {
    return {
      pedido: await leitor!.pedido.findUnique({ where: { id: pedido.id } }),
      historicos: await leitor!.historicoEtapa.findMany({
        where: { pedidoId: pedido.id }, orderBy: { id: 'asc' },
      }),
      observacoes: await leitor!.observacaoEtapa.findMany({
        where: { pedidoId: pedido.id }, orderBy: { id: 'asc' },
      }),
    };
  }

  it('cria com trim e substitui a observação da etapa atual sem duplicar nem criar histórico', async () => {
    const service = new AndamentoService(banco!);
    const antes = await estadoPersistido();
    const criada = await service.atualizarObservacao(pedido.id, usuarioId, '  Medidas conferidas \n');
    expect(criada).toMatchObject({ pedidoId: pedido.id, etapaId: etapas[1].id, observacao: 'Medidas conferidas' });
    expect(criada.criadoEm).toBeInstanceOf(Date);
    expect(criada.atualizadoEm).toBeInstanceOf(Date);
    const aposCriar = await estadoPersistido();
    expect(aposCriar.observacoes).toEqual([criada]);
    expect(aposCriar.pedido!.dataUltimaAtualizacao.getTime())
      .toBeGreaterThan(antes.pedido!.dataUltimaAtualizacao.getTime());

    const editada = await service.atualizarObservacao(pedido.id, usuarioId, '  Medidas revisadas  ');
    expect(editada).toMatchObject({
      id: criada.id, criadoEm: criada.criadoEm, etapaId: etapas[1].id, observacao: 'Medidas revisadas',
    });
    expect(editada.atualizadoEm.getTime()).toBeGreaterThanOrEqual(criada.atualizadoEm.getTime());
    const depois = await estadoPersistido();
    expect(depois.observacoes).toEqual([editada]);
    expect(depois.pedido).toEqual({
      ...antes.pedido, dataUltimaAtualizacao: depois.pedido!.dataUltimaAtualizacao,
    });
    expect(depois.pedido!.dataUltimaAtualizacao.getTime())
      .toBeGreaterThan(aposCriar.pedido!.dataUltimaAtualizacao.getTime());
    expect(depois.historicos).toEqual(antes.historicos);
  }, 15000);

  it.each([
    'usuario-inexistente', 'usuario-inativo', 'pedido-inexistente',
    'etapa-ausente', 'texto-vazio', 'texto-espacos', 'finalizado-fora-da-ultima',
  ])('rejeita %s sem persistir alterações', async (cenario) => {
    const idPedido = pedido.id;
    let idUsuario = usuarioId;
    let texto = 'Observação válida';
    let erro: typeof BadRequestException | typeof NotFoundException | typeof ForbiddenException = BadRequestException;
    if (cenario === 'usuario-inexistente') {
      idUsuario = usuarioExcluidoId;
      erro = NotFoundException;
    } else if (cenario === 'usuario-inativo') {
      await banco!.usuario.update({ where: { id: usuarioId }, data: { ativo: false } });
      erro = ForbiddenException;
    } else if (cenario === 'pedido-inexistente') {
      // Exclui exclusivamente o pedido desta fixture; seu ID foi realmente alocado.
      await banco!.pedido.delete({ where: { id: pedido.id } });
      erro = NotFoundException;
    } else if (cenario === 'etapa-ausente') {
      await banco!.pedido.update({ where: { id: pedido.id }, data: { etapaAtualId: null } });
    } else if (cenario === 'finalizado-fora-da-ultima') {
      await banco!.pedido.update({ where: { id: pedido.id }, data: { situacao: 'FINALIZADO' } });
      erro = ForbiddenException;
    } else {
      texto = cenario === 'texto-vazio' ? '' : ' \n\t ';
    }
    const antes = await estadoPersistido();
    const service = new AndamentoService(banco!);
    await expect(service.atualizarObservacao(idPedido, idUsuario, texto)).rejects.toBeInstanceOf(erro);
    expect(await estadoPersistido()).toEqual(antes);
  }, 15000);

  it('edita a última etapa após finalização sem mudar etapa, situação ou histórico', async () => {
    const service = new AndamentoService(banco!);
    await service.atualizarEtapa(pedido.id, etapas[2].id, usuarioId);
    await service.atualizarEtapa(pedido.id, etapas[3].id, usuarioId);
    const antes = await estadoPersistido();
    expect(antes.pedido!.situacao).toBe('FINALIZADO');
    await service.atualizarObservacao(pedido.id, usuarioId, '  Entregue  ');
    const editada = await service.atualizarObservacao(pedido.id, usuarioId, '  Entrega confirmada  ');
    const depois = await estadoPersistido();
    expect(depois.observacoes).toEqual([editada]);
    expect(editada).toMatchObject({ etapaId: etapas[3].id, observacao: 'Entrega confirmada' });
    expect(depois.pedido).toEqual({
      ...antes.pedido, dataUltimaAtualizacao: depois.pedido!.dataUltimaAtualizacao,
    });
    expect(depois.historicos).toEqual(antes.historicos);
    await expect(service.atualizarEtapa(pedido.id, etapas[2].id, usuarioId))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(await estadoPersistido()).toEqual(depois);
  }, 15000);

  // Não simula resultados: sincroniza SELECTs reais e conta UPDATEs reais.
  function clienteConcorrente(vencedora?: 'edicao' | 'transicao') {
    const barreira = criarBarreira();
    let liberar!: () => void;
    const commitPreferido = new Promise<void>((resolve) => { liberar = resolve; });
    const leituras: { etapaAtualId: number | null; atualizacao: number }[] = [];
    const contagens: number[] = [];
    const client = banco!.$extends({
      query: {
        pedido: {
          async findUnique({ args, query }) {
            const resultado = await query(args);
            if (args.where.id === pedido.id && resultado) {
              if (
                resultado.etapaAtualId === undefined ||
                !(resultado.dataUltimaAtualizacao instanceof Date)
              ) {
                throw new Error('A leitura deve incluir etapa e timestamp reais.');
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
            // Ambas as operações já leram a mesma versão. A perdedora só
            // tenta o UPDATE depois do commit real da operação escolhida.
            const operacao = args.data.etapaAtualId === undefined ? 'edicao' : 'transicao';
            if (vencedora && operacao !== vencedora) await commitPreferido;
            const resultado = await query(args);
            contagens.push(resultado.count);
            return resultado;
          },
        },
      },
    });
    return { service: new AndamentoService(client as unknown as PrismaService), barreira, leituras, contagens, liberar };
  }

  function conferirDisputa(resultados: PromiseSettledResult<unknown>[], leituras: unknown[], contagens: number[]) {
    expect(leituras).toEqual(Array(2).fill({
      etapaAtualId: pedido.etapaAtualId, atualizacao: pedido.dataUltimaAtualizacao.getTime(),
    }));
    expect([...contagens].sort()).toEqual([0, 1]);
    expect(resultados.filter((item) => item.status === 'fulfilled')).toHaveLength(1);
    const falhas = resultados.filter((item) => item.status === 'rejected');
    expect(falhas).toHaveLength(1);
    expect(falhas[0].reason).toBeInstanceOf(ConflictException);
    expect((falhas[0].reason as ConflictException).getStatus()).toBe(409);
  }

  it('confirma apenas uma de duas edições concorrentes sem duplicar observação', async () => {
    const { service, barreira, leituras, contagens } = clienteConcorrente();
    const antes = await estadoPersistido();
    try {
      const textos = ['Primeira edição', 'Segunda edição'];
      const resultados = await Promise.allSettled(textos.map((texto) =>
        service.atualizarObservacao(pedido.id, usuarioId, texto),
      ));
      conferirDisputa(resultados, leituras, contagens);
      const depois = await estadoPersistido();
      expect(depois.observacoes).toHaveLength(1);
      expect(depois.observacoes[0]).toMatchObject({
        pedidoId: pedido.id, etapaId: etapas[1].id,
        observacao: textos[resultados.findIndex((item) => item.status === 'fulfilled')],
      });
      expect(depois.historicos).toEqual(antes.historicos);
      expect(depois.pedido).toEqual({
        ...antes.pedido, dataUltimaAtualizacao: depois.pedido!.dataUltimaAtualizacao,
      });
    } finally {
      barreira.fechar();
    }
  }, 20000);

  it.each(['edicao', 'transicao'] as const)('resolve edição versus transição com %s vencendo sem escrita parcial', async (vencedora) => {
    const { service, barreira, leituras, contagens, liberar } = clienteConcorrente(vencedora);
    try {
      const edicao = service.atualizarObservacao(pedido.id, usuarioId, 'Edição concorrente');
      const transicao = service.atualizarEtapa(pedido.id, etapas[2].id, usuarioId);
      const resultados = await Promise.allSettled([
        vencedora === 'edicao' ? edicao.finally(liberar) : edicao,
        vencedora === 'transicao' ? transicao.finally(liberar) : transicao,
      ]);
      conferirDisputa(resultados, leituras, contagens);
      expect(resultados[vencedora === 'edicao' ? 0 : 1].status).toBe('fulfilled');
      const depois = await estadoPersistido();
      expect(depois.pedido!.situacao).toBe('EM_ANDAMENTO');
      if (resultados[0].status === 'fulfilled') {
        expect(depois.pedido!.etapaAtualId).toBe(etapas[1].id);
        expect(depois.historicos).toEqual([]);
        expect(depois.observacoes).toEqual([resultados[0].value]);
        expect(depois.observacoes[0].etapaId).toBe(etapas[1].id);
      } else {
        expect(depois.pedido!.etapaAtualId).toBe(etapas[2].id);
        expect(depois.observacoes).toEqual([]);
        expect(depois.historicos).toHaveLength(1);
        expect(depois.historicos[0]).toMatchObject({ etapaId: etapas[2].id, usuarioId });
      }
    } finally {
      liberar();
      barreira.fechar();
    }
  }, 20000);

  it.each([false, true])('desfaz marcador e observação ao falhar o upsert real (existente=%s)', async (existente) => {
    if (existente) {
      await new AndamentoService(banco!).atualizarObservacao(pedido.id, usuarioId, 'Texto anterior');
    }
    const antes = await estadoPersistido();
    let atualizacoesReais = 0;
    let gravacoesReais = 0;
    const comFalha = banco!.$extends({
      query: {
        pedido: {
          async updateMany({ args, query }) {
            const resultado = await query(args);
            atualizacoesReais += resultado.count;
            return resultado;
          },
        },
        observacaoEtapa: {
          async upsert({ args, query }) {
            if (
              typeof args.create.etapaId !== 'number' ||
              typeof args.update.observacao !== 'string'
            ) {
              throw new Error('Esperado upsert com etapa escalar e texto do service.');
            }
            gravacoesReais++;
            // FK de pedido alocada e excluída na própria fixture.
            // Tanto INSERT quanto UPDATE chegam ao PostgreSQL com FK inválida.
            return query({
              ...args,
              create: {
                pedidoId: pedidoInvalidoId,
                etapaId: args.create.etapaId,
                observacao: args.create.observacao,
              },
              update: { observacao: args.update.observacao, pedidoId: pedidoInvalidoId },
            });
          },
        },
      },
    });
    const service = new AndamentoService(comFalha as unknown as PrismaService);
    await expect(service.atualizarObservacao(pedido.id, usuarioId, 'Não deve persistir'))
      .rejects.toMatchObject({ code: 'P2003' });
    expect(atualizacoesReais).toBe(1);
    expect(gravacoesReais).toBe(1);
    expect(await estadoPersistido()).toEqual(antes);
  }, 15000);

  it('oculta observações futuras no retrocesso e as reexibe no avanço sem apagar dados', async () => {
    const service = new AndamentoService(banco!);
    const publico = new PedidosService(leitor!);
    await service.atualizarObservacao(pedido.id, usuarioId, 'Observação inicial');
    await service.atualizarEtapa(pedido.id, etapas[2].id, usuarioId);
    await service.atualizarObservacao(pedido.id, usuarioId, 'Observação posterior');
    const antes = await estadoPersistido();
    const avancado = await publico.buscarPorCodigo(pedido.codigo);
    expect(avancado.etapas.find((item) => item.ordem === etapas[1].ordem))
      .toMatchObject({ observacao: 'Observação inicial', status: 'CONCLUIDA' });
    expect(avancado.etapas.find((item) => item.ordem === etapas[2].ordem))
      .toMatchObject({ observacao: 'Observação posterior', status: 'ATUAL' });

    await service.atualizarEtapa(pedido.id, etapas[1].id, usuarioId);
    const retrocedido = await publico.buscarPorCodigo(pedido.codigo);
    expect(retrocedido.etapas.find((item) => item.ordem === etapas[1].ordem))
      .toMatchObject({ observacao: 'Observação inicial', status: 'ATUAL' });
    const futura = retrocedido.etapas.find((item) => item.ordem === etapas[2].ordem);
    expect(futura).toMatchObject({ observacao: null, status: 'PENDENTE' });
    expect(futura!.dataHora).toEqual(antes.historicos[0].dataHora);
    expect((await estadoPersistido()).observacoes).toEqual(antes.observacoes);

    await service.atualizarEtapa(pedido.id, etapas[2].id, usuarioId);
    const reavancado = await publico.buscarPorCodigo(pedido.codigo);
    expect(reavancado.etapas.find((item) => item.ordem === etapas[2].ordem))
      .toMatchObject({ observacao: 'Observação posterior', status: 'ATUAL' });
    expect((await estadoPersistido()).observacoes).toEqual(antes.observacoes);
    expect(reavancado.etapas.map((item) => item.ordem)).toEqual(
      reavancado.etapas.map((item) => item.ordem).sort((a, b) => a - b),
    );
    expect(reavancado).not.toHaveProperty('historicos');
    expect(reavancado).not.toHaveProperty('criadoPorId');
  }, 20000);

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
        ),
        service.atualizarEtapa(
          pedido.id,
          etapas[2].id,
          usuarioId,
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
    expect(historicos[1]).toMatchObject({
      etapaId: etapas[3].id,
      usuarioId,
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
