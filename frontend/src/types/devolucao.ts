import { Rnc } from './rnc';

export enum DevolucaoStatus {
  RNC_ACEITA = 'RNC_ACEITA',
  DEVOLUCAO_SOLICITADA = 'DEVOLUCAO_SOLICITADA',
  NFE_EMITIDA = 'NFE_EMITIDA',
  DEVOLUCAO_COLETADA = 'DEVOLUCAO_COLETADA',
  DEVOLUCAO_RECEBIDA = 'DEVOLUCAO_RECEBIDA',
  FINALIZADO = 'FINALIZADO',
}

export enum MeioCompensacao {
  TRANSFERENCIA_DIRETA = 'TRANSFERENCIA_DIRETA',
  COMPENSACAO_PAGAMENTOS_FUTUROS = 'COMPENSACAO_PAGAMENTOS_FUTUROS',
}

export interface Devolucao {
  id: string;
  rncId: string;
  arOrigem: number;
  quantidadeTotal: number;
  pesoKg: number;
  motivo: string;
  transportadora: string;
  frete: string;
  meioCompensacao: MeioCompensacao;
  nfeNumero: string | null;
  nfePdfPath: string | null;
  nfeEmitidaPorId: string | null;
  nfeEmitidaEm: string | null;
  dataColeta: string | null;
  coletaConfirmadaPorId: string | null;
  dataRecebimento: string | null;
  recebimentoConfirmadoPorId: string | null;
  dataCompensacao: string | null;
  comprovantePath: string | null;
  compensacaoConfirmadaPorId: string | null;
  status: DevolucaoStatus;
  criadoPorId: string;
  createdAt: string;
  updatedAt: string;
  // Relacionamentos populados
  rnc?: Rnc;
  criadoPor?: {
    id: string;
    nome: string;
    email: string;
  };
  nfeEmitidaPor?: {
    id: string;
    nome: string;
    email: string;
  };
  coletaConfirmadaPor?: {
    id: string;
    nome: string;
    email: string;
  };
  recebimentoConfirmadoPor?: {
    id: string;
    nome: string;
    email: string;
  };
  compensacaoConfirmadaPor?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface CreateDevolucaoDto {
  rncId: string;
  quantidadeTotal: number;
  pesoKg: number;
  motivo: string;
  transportadora: string;
  frete: string;
  meioCompensacao: MeioCompensacao;
}

export interface EmitirNfeDto {
  nfeNumero: string;
}

export interface FilterDevolucaoDto {
  status?: DevolucaoStatus;
  rncId?: string;
  fornecedorId?: string;
}
