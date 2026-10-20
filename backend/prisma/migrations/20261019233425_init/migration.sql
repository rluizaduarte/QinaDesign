-- CreateEnum
CREATE TYPE "SituacaoPedido" AS ENUM ('EM_ANDAMENTO', 'FINALIZADO');

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "situacao" "SituacaoPedido" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "etapaAtualId" INTEGER,
    "dataUltimaAtualizacao" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etapa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "Etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoEtapa" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "etapaId" INTEGER NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,

    CONSTRAINT "HistoricoEtapa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_codigo_key" ON "Pedido"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Etapa_nome_key" ON "Etapa"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Etapa_ordem_key" ON "Etapa"("ordem");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_etapaAtualId_fkey" FOREIGN KEY ("etapaAtualId") REFERENCES "Etapa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoEtapa" ADD CONSTRAINT "HistoricoEtapa_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoricoEtapa" ADD CONSTRAINT "HistoricoEtapa_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
