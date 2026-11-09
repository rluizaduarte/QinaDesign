import 'dotenv/config';
import { Client } from 'pg';

type HistoricoSeed = {
  etapa: string;
  diasAtras: number;
  hora: string;
  observacao?: string;
};

type PedidoSeed = {
  codigo: string;
  nomeCliente: string;
  titulo: string;
  // Nome da etapa em andamento (precisa ser um nome de etapa do seed oficial, prisma/seed.ts)
  etapaAtual: string;
  inicioDiasAtras: number;
  // Etapas já concluídas: data + observação opcional
  historicos: HistoricoSeed[];
};
// ---------------------------------------------------------------------------
// PEDIDOS DE TESTE
// Para liberar outro acesso na plataforma, basta acrescentar um objeto aqui
// com um "codigo" diferente e rodar:  npm run db:seed
// ---------------------------------------------------------------------------
const PEDIDOS: PedidoSeed[] = [
  {
    codigo: '123456',
    nomeCliente: 'Cliente Demonstração',
    titulo: 'Armário planejado - sala de estar',
    etapaAtual: 'Usinagem',   //precisa ser um nome de etapa do seed oficial
    inicioDiasAtras: 7,
    historicos: [
      {
        etapa: 'Visita técnica',
        diasAtras: 7,
        hora: '15:00',
        observacao: 'Medidas conferidas no local com o cliente.',
      },
      { etapa: 'Elaboração do projeto executivo', diasAtras: 6, hora: '10:00' },
      {
        etapa: 'Aprovação/revisão do projeto executivo',
        diasAtras: 5,
        hora: '12:00',
      },
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
    ],
  },

  // --- Exemplo de outro acesso (descomente e rode `npm run db:seed`) ---
  // {
  //   codigo: '654321',
  //   nomeCliente: 'Maria Souza',
  //   titulo: 'Mesa de jantar - 6 lugares',
  //   etapaAtual: 'Embalagem',
  //   inicioDiasAtras: 12,
  //   historicos: [
  //     { etapa: 'Visita técnica', diasAtras: 12, hora: '09:00' },
  //     { etapa: 'Elaboração do projeto executivo', diasAtras: 10, hora: '11:00' },
  //     { etapa: 'Aprovação/revisão do projeto executivo', diasAtras: 9, hora: '16:00',
  //       observacao: 'Cliente pediu ajuste na profundidade.' },
  //     { etapa: 'Efetivação do serviço', diasAtras: 8, hora: '10:00' },
  //     { etapa: 'Compra de material', diasAtras: 7, hora: '14:00' },
  //     { etapa: 'Recebimento de material', diasAtras: 5, hora: '08:30' },
  //     { etapa: 'Fila de produção', diasAtras: 4, hora: '09:00' },
  //     { etapa: 'Usinagem', diasAtras: 3, hora: '17:00' },
  //     { etapa: 'Separação de peças', diasAtras: 2, hora: '10:00' },
  //     { etapa: 'Fitamento', diasAtras: 1, hora: '15:00' },
  //     { etapa: 'Fila de pré-montagem', diasAtras: 1, hora: '17:00' },
  //     { etapa: 'Pré-montagem', diasAtras: 0, hora: '10:00' },
  //     { etapa: 'Embalagem', diasAtras: 0, hora: '11:00' },
  //   ],
  // },
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

    const { rows: etapas } = await client.query<{
    id: number;
    nome: string;
    ordem: number;
    }>('SELECT "id", "nome", "ordem" FROM "Etapa"');

    if (etapas.length === 0) {
      throw new Error('Nenhuma etapa encontrada. Rode antes: npm run db:seed');
    }
    const porNome = new Map(etapas.map((etapa) => [etapa.nome, etapa]));


    // 2) Pedidos de teste
    for (const pedido of PEDIDOS) {
      const etapaAtual = porNome.get(pedido.etapaAtual);
      if (!etapaAtual) {
        throw new Error(
          `Etapa "${pedido.etapaAtual}" não existe. Use um nome do seed oficial (prisma/seed.ts).`,      
        );
      }

      for (const item of pedido.historicos) {
        const etapa = porNome.get(item.etapa);
        if (!etapa) {
          throw new Error(
            `Etapa "${item.etapa}" não existe (pedido ${pedido.codigo}).`,
          );
        }
        if (etapa.ordem > etapaAtual.ordem) {
          throw new Error(
            `Histórico incoerente no pedido ${pedido.codigo}: "${item.etapa}" vem depois da etapa atual "${pedido.etapaAtual}".`,
          );
        }
      }

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
          pedido.codigo,
          pedido.nomeCliente,
          pedido.titulo,
          diasAtras(pedido.inicioDiasAtras, '09:00'),
          etapaAtual.id,
        ],
      );
      const pedidoId = pedidos[0].id;

      // Histórico e observações demonstrativas recriados a cada execução.
      await client.query('DELETE FROM "HistoricoEtapa" WHERE "pedidoId" = $1', [
        pedidoId,
      ]);
      await client.query('DELETE FROM "ObservacaoEtapa" WHERE "pedidoId" = $1', [
        pedidoId,
      ]);

      for (const item of pedido.historicos) {
        await client.query(
          'INSERT INTO "HistoricoEtapa" ("pedidoId", "etapaId", "dataHora") ' +
            'VALUES ($1, $2, $3)',
          [
            pedidoId,
            porNome.get(item.etapa)!.id,
            diasAtras(item.diasAtras, item.hora),
          ],
        );
        if (item.observacao !== undefined) {
          await client.query(
            'INSERT INTO "ObservacaoEtapa" ("pedidoId", "etapaId", "observacao", "atualizadoEm") ' +
              'VALUES ($1, $2, $3, now()) ' +
              'ON CONFLICT ("pedidoId", "etapaId") DO UPDATE SET ' +
              '"observacao" = EXCLUDED."observacao", "atualizadoEm" = now()',
            [pedidoId, porNome.get(item.etapa)!.id, item.observacao],
          );
        }
      }
    }

    await client.query('COMMIT');

    const codigos = PEDIDOS.map((pedido) => `#${pedido.codigo}`).join(', ');
    console.log(
      `Seed demo concluído: ${PEDIDOS.length} pedido(s): ${codigos}.`,
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
