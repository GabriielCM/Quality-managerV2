import { Rnc } from './rnc';

export enum ConsertoStatus {
  RNC_ACEITA = 'RNC_ACEITA',
  CONSERTO_SOLICITADA = 'CONSERTO_SOLICITADA',
  NFE_EMITIDA = 'NFE_EMITIDA',
  CONSERTO_COLETADO = 'CONSERTO_COLETADO',
  CONSERTO_RECEBIDO = 'CONSERTO_RECEBIDO',
  MATERIAL_RETORNADO = 'MATERIAL_RETORNADO',
  FINALIZADO = 'FINALIZADO',
  REJEITADO = 'REJEITADO',
}

export interface ConsertoInspecaoFoto {
  id: string;
  consertoId: string;
  path: string;
  filename: string;
  createdAt: string;
}

export interface Conserto {
  id: string;
  rncId: string;
  arOrigem: number;
  quantidadeTotal: number;
  pesoKg: number;
  motivo: string;
  frete: string;
  transportadora: string | null;
  consertoEmGarantia: boolean;
  nfeNumero: string | null;
  nfePdfPath: string | null;
  nfeEmitidaPorId: string | null;
  nfeEmitidaEm: string | null;
  dataColeta: string | null;
  coletaConfirmadaPorId: string | null;
  dataRecebimento: string | null;
  recebimentoConfirmadoPorId: string | null;
  prazoConsertoInicio: string | null;
  prazoConsertoFim: string | null;
  dataRetorno: string | null;
  nfeRetornoNumero: string | null;
  nfeRetornoPdfPath: string | null;
  retornoConfirmadoPorId: string | null;
  inspecaoAprovada: boolean | null;
  inspecaoData: string | null;
  inspecaoDescricao: string | null;
  inspecaoRealizadaPorId: string | null;
  status: ConsertoStatus;
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
  retornoConfirmadoPor?: {
    id: string;
    nome: string;
    email: string;
  };
  inspecaoRealizadaPor?: {
    id: string;
    nome: string;
    email: string;
  };
  inspecaoFotos?: ConsertoInspecaoFoto[];
}

export interface CreateConsertoDto {
  rncId: string;
  quantidadeTotal: number;
  pesoKg: number;
  motivo: string;
  frete: string;
  transportadora?: string;
  consertoEmGarantia: boolean;
}

export interface EmitirNfeConsertoDto {
  nfeNumero: string;
}

export interface ConfirmarRetornoDto {
  nfeRetornoNumero: string;
}

export interface AprovarInspecaoDto {
  inspecaoDescricao?: string;
}

export interface RejeitarInspecaoDto {
  inspecaoDescricao: string;
}

export interface FilterConsertoDto {
  status?: ConsertoStatus;
  rncId?: string;
  fornecedorId?: string;
}
