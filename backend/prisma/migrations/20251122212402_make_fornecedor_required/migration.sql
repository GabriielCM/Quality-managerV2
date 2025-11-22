/*
  Warnings:

  - Made the column `fornecedorId` on table `incs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "incs" DROP CONSTRAINT "incs_fornecedorId_fkey";

-- AlterTable
ALTER TABLE "incs" ALTER COLUMN "fornecedorId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "incs" ADD CONSTRAINT "incs_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
