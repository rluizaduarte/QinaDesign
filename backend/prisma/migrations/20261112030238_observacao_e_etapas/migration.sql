/*
  Warnings:

  - You are about to drop the column `titulo` on the `Pedido` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Etapa_nome_key";

-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "titulo",
ADD COLUMN     "observacao" TEXT;
