-- CreateEnum
CREATE TYPE "ConsertoStatus" AS ENUM ('RNC_ACEITA', 'CONSERTO_SOLICITADA', 'NFE_EMITIDA', 'CONSERTO_COLETADO', 'CONSERTO_RECEBIDO', 'MATERIAL_RETORNADO', 'FINALIZADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "consertos" (
    "id" TEXT NOT NULL,
    "rncId" TEXT NOT NULL,
    "arOrigem" INTEGER NOT NULL,
    "quantidadeTotal" DOUBLE PRECISION NOT NULL,
    "pesoKg" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "frete" TEXT NOT NULL,
    "transportadora" TEXT,
    "consertoEmGarantia" BOOLEAN NOT NULL DEFAULT false,
    "nfeNumero" TEXT,
    "nfePdfPath" TEXT,
    "nfeEmitidaPorId" TEXT,
    "nfeEmitidaEm" TIMESTAMP(3),
    "dataColeta" TIMESTAMP(3),
    "coletaConfirmadaPorId" TEXT,
    "dataRecebimento" TIMESTAMP(3),
    "recebimentoConfirmadoPorId" TEXT,
    "prazoConsertoInicio" TIMESTAMP(3),
    "prazoConsertoFim" TIMESTAMP(3),
    "dataRetorno" TIMESTAMP(3),
    "nfeRetornoNumero" TEXT,
    "nfeRetornoPdfPath" TEXT,
    "retornoConfirmadoPorId" TEXT,
    "inspecaoAprovada" BOOLEAN,
    "inspecaoData" TIMESTAMP(3),
    "inspecaoDescricao" TEXT,
    "inspecaoRealizadaPorId" TEXT,
    "status" "ConsertoStatus" NOT NULL DEFAULT 'RNC_ACEITA',
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consertos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conserto_inspecao_fotos" (
    "id" TEXT NOT NULL,
    "consertoId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conserto_inspecao_fotos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "consertos_rncId_key" ON "consertos"("rncId");

-- AddForeignKey
ALTER TABLE "consertos" ADD CONSTRAINT "consertos_rncId_fkey" FOREIGN KEY ("rncId") REFERENCES "rncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consertos" ADD CONSTRAINT "consertos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consertos" ADD CONSTRAINT "consertos_nfeEmitidaPorId_fkey" FOREIGN KEY ("nfeEmitidaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consertos" ADD CONSTRAINT "consertos_coletaConfirmadaPorId_fkey" FOREIGN KEY ("coletaConfirmadaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consertos" ADD CONSTRAINT "consertos_recebimentoConfirmadoPorId_fkey" FOREIGN KEY ("recebimentoConfirmadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consertos" ADD CONSTRAINT "consertos_retornoConfirmadoPorId_fkey" FOREIGN KEY ("retornoConfirmadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consertos" ADD CONSTRAINT "consertos_inspecaoRealizadaPorId_fkey" FOREIGN KEY ("inspecaoRealizadaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conserto_inspecao_fotos" ADD CONSTRAINT "conserto_inspecao_fotos_consertoId_fkey" FOREIGN KEY ("consertoId") REFERENCES "consertos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
