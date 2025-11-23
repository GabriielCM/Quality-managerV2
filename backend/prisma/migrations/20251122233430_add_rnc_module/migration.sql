-- CreateTable
CREATE TABLE "rncs" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "sequencial" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ar" INTEGER NOT NULL,
    "nfeNumero" TEXT NOT NULL,
    "um" TEXT NOT NULL,
    "quantidadeRecebida" DOUBLE PRECISION NOT NULL,
    "quantidadeComDefeito" DOUBLE PRECISION NOT NULL,
    "descricaoNaoConformidade" TEXT NOT NULL,
    "reincidente" BOOLEAN NOT NULL DEFAULT false,
    "rncAnteriorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RNC enviada',
    "pdfPath" TEXT,
    "incId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rncs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rncs_numero_key" ON "rncs"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "rncs_fornecedorId_sequencial_ano_key" ON "rncs"("fornecedorId", "sequencial", "ano");

-- AddForeignKey
ALTER TABLE "rncs" ADD CONSTRAINT "rncs_incId_fkey" FOREIGN KEY ("incId") REFERENCES "incs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rncs" ADD CONSTRAINT "rncs_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rncs" ADD CONSTRAINT "rncs_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rncs" ADD CONSTRAINT "rncs_rncAnteriorId_fkey" FOREIGN KEY ("rncAnteriorId") REFERENCES "rncs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
