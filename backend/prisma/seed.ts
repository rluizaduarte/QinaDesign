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
  // Nome da etapa em andamento (precisa ser um dos nomes de ETAPAS)
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
    etapaAtual: 'Usinagem',
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

    // 1) Etapas do fluxo
    for (const [index, nome] of ETAPAS.entries()) {
      await client.query(
        'INSERT INTO "Etapa" ("nome", "ordem") VALUES ($1, $2) ' +
          'ON CONFLICT ("nome") DO UPDATE SET "ordem" = EXCLUDED."ordem"',
        [nome, index + 1],
      );
    }

    const { rows: etapas } = await client.query<{
      id: number;
      nome: string;
      ordem: number;
    }>('SELECT "id", "nome", "ordem" FROM "Etapa"');
    const porNome = new Map(etapas.map((etapa) => [etapa.nome, etapa]));

    // 2) Pedidos de teste
    for (const pedido of PEDIDOS) {
      const etapaAtual = porNome.get(pedido.etapaAtual);
      if (!etapaAtual) {
        throw new Error(
          `Etapa "${pedido.etapaAtual}" não existe. Use um nome da lista ETAPAS.`,
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

      // Histórico recriado a cada execução, para poder rodar o seed de novo
      await client.query('DELETE FROM "HistoricoEtapa" WHERE "pedidoId" = $1', [
        pedidoId,
      ]);

      for (const item of pedido.historicos) {
        await client.query(
          'INSERT INTO "HistoricoEtapa" ("pedidoId", "etapaId", "dataHora", "observacao") ' +
            'VALUES ($1, $2, $3, $4)',
          [
            pedidoId,
            porNome.get(item.etapa)!.id,
            diasAtras(item.diasAtras, item.hora),
            item.observacao ?? null,
          ],
        );
      }
    }

    await client.query('COMMIT');

    const codigos = PEDIDOS.map((pedido) => `#${pedido.codigo}`).join(', ');
    console.log(
      `Seed concluído: ${ETAPAS.length} etapas e ${PEDIDOS.length} pedido(s): ${codigos}.`,
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
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const etapas = [
  'Visita técnica',
  'Elaboração do projeto executivo',
  'Aprovação/revisão do projeto executivo',
  'Revisão pré-efetivação',
  'Efetivação do serviço',
  'Compra de material',
  'Recebimento de material',
  'Fila de produção',
  'Usinagem',
  'Separação de peças 1',
  'Fitamento',
  'Separação de peças 2',
  'Fila de pré montagem',
  'Pré montagem',
  'Embalagem',
  'Expedição',
  'Montagem',
  'Finalização',
];

async function main() {
  if (etapas.length !== 18) {
    throw new Error(`Esperado 18 etapas, mas foram definidas ${etapas.length}`);
  }

  for (let i = 0; i < etapas.length; i++) {
    await prisma.etapa.upsert({
      where: { ordem: i + 1 },
      update: { nome: etapas[i] },
      create: { nome: etapas[i], ordem: i + 1 },
    });
  }

  const senhaCriptografada = await bcrypt.hash('Admin@123', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@teste.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@teste.com',
      senhaHash: senhaCriptografada,
      perfil: 'ADMINISTRADOR',
      ativo: true,
    },
  });

  console.log('Seed concluído!');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
