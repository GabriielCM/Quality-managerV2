-- AlterTable
ALTER TABLE "incs" ADD COLUMN     "fornecedorId" TEXT;

-- AddForeignKey
ALTER TABLE "incs" ADD CONSTRAINT "incs_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
