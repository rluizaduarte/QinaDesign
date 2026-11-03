import 'dotenv/config';
import { Client } from 'pg';

// Etapas fixas do fluxo de produção da Qina.
// O campo "nome" é único no banco, por isso não há nomes repetidos aqui.
const ETAPAS = [
  'Visita técnica',
  'Elaboração do projeto executivo',
  'Aprovação/revisão do projeto executivo',
  'Revisão pré-efetivação',
  'Efetivação do serviço',
  'Compra de material',
  'Recebimento de material',
  'Fila de produção',
  'Usinagem',
  'Separação de peças',
  'Fitamento',
  'Fila de pré-montagem',
  'Pré-montagem',
  'Embalagem',
  'Expedição',
  'Montagem',
  'Finalização',
];

const ETAPA_ATUAL = 'Usinagem';

// Histórico das etapas já concluídas (dias atrás, horário, observação)
const HISTORICOS: {
  etapa: string;
  diasAtras: number;
  hora: string;
  observacao?: string;
}[] = [
  {
    etapa: 'Visita técnica',
    diasAtras: 7,
    hora: '15:00',
    observacao: 'Medidas conferidas no local com o cliente.',
  },
  { etapa: 'Elaboração do projeto executivo', diasAtras: 6, hora: '10:00' },
  { etapa: 'Aprovação/revisão do projeto executivo', diasAtras: 5, hora: '12:00' },
  { etapa: 'Revisão pré-efetivação', diasAtras: 4, hora: '12:00' },
  { etapa: 'Efetivação do serviço', diasAtras: 3, hora: '15:00' },
  { etapa: 'Compra de material', diasAtras: 3, hora: '18:00' },
  { etapa: 'Recebimento de material', diasAtras: 2, hora: '08:00' },
  { etapa: 'Fila de produção', diasAtras: 2, hora: '15:00' },
  {
    etapa: 'Usinagem',
    diasAtras: 0,
    hora: '12:00',
    observacao: 'Peças em usinagem no centro de corte.',
  },
];

function diasAtras(dias: number, hora: string): Date {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  const [h, m] = hora.split(':').map(Number);
  data.setHours(h, m, 0, 0);
  return data;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL não configurada. Crie o arquivo backend/.env a partir do .env.example.',
    );
  }

  // Usa o `pg` direto: o seed roda com ts-node e o client gerado pelo Prisma 7
  // usa imports com extensão .js, que o ts-node em CommonJS não resolve.
  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1) Etapas do fluxo
    for (const [index, nome] of ETAPAS.entries()) {
      await client.query(
        'INSERT INTO "Etapa" ("nome", "ordem") VALUES ($1, $2) ' +
          'ON CONFLICT ("nome") DO UPDATE SET "ordem" = EXCLUDED."ordem"',
        [nome, index + 1],
      );
    }

    const { rows: etapas } = await client.query<{ id: number; nome: string }>(
      'SELECT "id", "nome" FROM "Etapa"',
    );
    const porNome = new Map(etapas.map((etapa) => [etapa.nome, etapa.id]));

    const etapaAtualId = porNome.get(ETAPA_ATUAL);
    if (!etapaAtualId) {
      throw new Error(`Etapa "${ETAPA_ATUAL}" não encontrada`);
    }

    // 2) Pedido de demonstração (código 123456)
    const { rows: pedidos } = await client.query<{ id: number }>(
      'INSERT INTO "Pedido" ("codigo", "nomeCliente", "titulo", "dataInicio", "etapaAtualId", "dataUltimaAtualizacao") ' +
        'VALUES ($1, $2, $3, $4, $5, now()) ' +
        'ON CONFLICT ("codigo") DO UPDATE SET ' +
        '"nomeCliente" = EXCLUDED."nomeCliente", ' +
        '"titulo" = EXCLUDED."titulo", ' +
        '"dataInicio" = EXCLUDED."dataInicio", ' +
        '"etapaAtualId" = EXCLUDED."etapaAtualId", ' +
        '"dataUltimaAtualizacao" = now() ' +
        'RETURNING "id"',
      [
        '123456',
        'Cliente Demonstração',
        'Armário planejado - sala de estar',
        diasAtras(7, '09:00'),
        etapaAtualId,
      ],
    );
    const pedidoId = pedidos[0].id;

    // 3) Histórico do pedido (recriado a cada execução, para poder rodar o seed de novo)
    await client.query('DELETE FROM "HistoricoEtapa" WHERE "pedidoId" = $1', [
      pedidoId,
    ]);

    for (const item of HISTORICOS) {
      const etapaId = porNome.get(item.etapa);
      if (!etapaId) throw new Error(`Etapa "${item.etapa}" não encontrada`);

      await client.query(
        'INSERT INTO "HistoricoEtapa" ("pedidoId", "etapaId", "dataHora", "observacao") ' +
          'VALUES ($1, $2, $3, $4)',
        [pedidoId, etapaId, diasAtras(item.diasAtras, item.hora), item.observacao ?? null],
      );
    }

    await client.query('COMMIT');

    console.log(
      `Seed concluído: ${ETAPAS.length} etapas e pedido de teste #123456.`,
    );
  } catch (erro) {
    await client.query('ROLLBACK');
    throw erro;
  } finally {
    await client.end();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
