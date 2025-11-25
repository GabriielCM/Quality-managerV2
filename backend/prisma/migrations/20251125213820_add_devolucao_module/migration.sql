-- CreateEnum
CREATE TYPE "DevolucaoStatus" AS ENUM ('RNC_ACEITA', 'DEVOLUCAO_SOLICITADA', 'NFE_EMITIDA', 'DEVOLUCAO_COLETADA', 'DEVOLUCAO_RECEBIDA', 'FINALIZADO');

-- CreateTable
CREATE TABLE "devolucoes" (
    "id" TEXT NOT NULL,
    "rncId" TEXT NOT NULL,
    "arOrigem" INTEGER NOT NULL,
    "quantidadeTotal" DOUBLE PRECISION NOT NULL,
    "pesoKg" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "transportadora" TEXT NOT NULL,
    "frete" TEXT NOT NULL,
    "meioCompensacao" TEXT NOT NULL,
    "nfeNumero" TEXT,
    "nfePdfPath" TEXT,
    "nfeEmitidaPorId" TEXT,
    "nfeEmitidaEm" TIMESTAMP(3),
    "dataColeta" TIMESTAMP(3),
    "coletaConfirmadaPorId" TEXT,
    "dataRecebimento" TIMESTAMP(3),
    "recebimentoConfirmadoPorId" TEXT,
    "dataCompensacao" TIMESTAMP(3),
    "compensacaoConfirmadaPorId" TEXT,
    "status" "DevolucaoStatus" NOT NULL DEFAULT 'RNC_ACEITA',
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devolucoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devolucoes_rncId_key" ON "devolucoes"("rncId");

-- AddForeignKey
ALTER TABLE "devolucoes" ADD CONSTRAINT "devolucoes_rncId_fkey" FOREIGN KEY ("rncId") REFERENCES "rncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucoes" ADD CONSTRAINT "devolucoes_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucoes" ADD CONSTRAINT "devolucoes_nfeEmitidaPorId_fkey" FOREIGN KEY ("nfeEmitidaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucoes" ADD CONSTRAINT "devolucoes_coletaConfirmadaPorId_fkey" FOREIGN KEY ("coletaConfirmadaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucoes" ADD CONSTRAINT "devolucoes_recebimentoConfirmadoPorId_fkey" FOREIGN KEY ("recebimentoConfirmadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devolucoes" ADD CONSTRAINT "devolucoes_compensacaoConfirmadaPorId_fkey" FOREIGN KEY ("compensacaoConfirmadaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
