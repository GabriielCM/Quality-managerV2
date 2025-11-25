/*
  Warnings:

  - Changed the type of `meioCompensacao` on the `devolucoes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- CreateEnum
CREATE TYPE "MeioCompensacao" AS ENUM ('TRANSFERENCIA_DIRETA', 'COMPENSACAO_PAGAMENTOS_FUTUROS');

-- AlterTable - Adicionar comprovantePath
ALTER TABLE "devolucoes" ADD COLUMN "comprovantePath" TEXT;

-- AlterTable - Converter meioCompensacao para enum
-- Passo 1: Adicionar nova coluna temporária com tipo enum (nullable)
ALTER TABLE "devolucoes" ADD COLUMN "meioCompensacao_new" "MeioCompensacao";

-- Passo 2: Migrar dados existentes com conversão
-- Qualquer string será convertida para TRANSFERENCIA_DIRETA como padrão
UPDATE "devolucoes"
SET "meioCompensacao_new" =
  CASE
    WHEN LOWER("meioCompensacao") LIKE '%transferencia%' OR LOWER("meioCompensacao") LIKE '%direta%'
      THEN 'TRANSFERENCIA_DIRETA'::"MeioCompensacao"
    WHEN LOWER("meioCompensacao") LIKE '%compensacao%' OR LOWER("meioCompensacao") LIKE '%futur%'
      THEN 'COMPENSACAO_PAGAMENTOS_FUTUROS'::"MeioCompensacao"
    ELSE 'TRANSFERENCIA_DIRETA'::"MeioCompensacao"
  END;

-- Passo 3: Tornar a nova coluna NOT NULL
ALTER TABLE "devolucoes" ALTER COLUMN "meioCompensacao_new" SET NOT NULL;

-- Passo 4: Remover coluna antiga
ALTER TABLE "devolucoes" DROP COLUMN "meioCompensacao";

-- Passo 5: Renomear nova coluna
ALTER TABLE "devolucoes" RENAME COLUMN "meioCompensacao_new" TO "meioCompensacao";
