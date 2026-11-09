/*
  Warnings:

  - You are about to drop the column `observacao` on the `HistoricoEtapa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HistoricoEtapa" DROP COLUMN "observacao";

-- CreateTable
CREATE TABLE "ObservacaoEtapa" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "etapaId" INTEGER NOT NULL,
    "observacao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObservacaoEtapa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ObservacaoEtapa_pedidoId_etapaId_key" ON "ObservacaoEtapa"("pedidoId", "etapaId");

-- AddForeignKey
ALTER TABLE "ObservacaoEtapa" ADD CONSTRAINT "ObservacaoEtapa_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObservacaoEtapa" ADD CONSTRAINT "ObservacaoEtapa_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
