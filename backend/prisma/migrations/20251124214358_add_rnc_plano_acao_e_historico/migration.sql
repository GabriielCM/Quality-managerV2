-- AlterTable
ALTER TABLE "rncs" ADD COLUMN     "planoAcaoPdfPath" TEXT,
ADD COLUMN     "prazoInicio" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "rnc_historico" (
    "id" TEXT NOT NULL,
    "rncId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfPath" TEXT NOT NULL,
    "justificativa" TEXT,
    "prazoInicio" TIMESTAMP(3) NOT NULL,
    "prazoFim" TIMESTAMP(3) NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rnc_historico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "rnc_historico" ADD CONSTRAINT "rnc_historico_rncId_fkey" FOREIGN KEY ("rncId") REFERENCES "rncs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rnc_historico" ADD CONSTRAINT "rnc_historico_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
