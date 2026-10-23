import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const etapas = [
  "Visita técnica", 
  "Elaboração do projeto executivo",
  "Aprovação/revisão do projeto executivo",
  "Revisão pré-efetivação",
  "Efetivação do serviço",
  "Compra de material",
  "Recebimento de material",
  "Fila de produção",
  "Usinagem",
  "Separação de peças 1",
  "Fitamento",
  "Separação de peças 2",
  "Fila de pré montagem",
  "Pré montagem",
  "Embalagem",
  "Expedição",
  "Montagem",
  "Finalização",
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

const senhaHash = await bcrypt.hash("Admin@123", 10);
await prisma.usuarioAdministrativo.upsert({
  where: { email: "admin@teste.com" },
  update: {},
  create: {
    nome: "Administrador",
    email: "admin@teste.com",
    senhaHash: senhaHash,
  },
});
  console.log("Seed concluído!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());