import { Fornecedor } from './fornecedor';

export interface Rnc {
  id: string;
  numero: string;
  sequencial: number;
  ano: number;
  data: string;

  // Dados importados da INC
  ar: number;
  nfeNumero: string;
  um: string;
  quantidadeRecebida: number;
  quantidadeComDefeito: number;
  descricaoNaoConformidade: string;

  // Campos específicos da RNC
  reincidente: boolean;
  rncAnteriorId: string | null;
  status: string;
  pdfPath: string | null;

  // Relacionamentos
  incId: string;
  fornecedorId: string;
  criadoPorId: string;

  inc?: {
    id: string;
    data: string;
    ar: number;
    nfeNumero: string;
    status: string;
    fotos?: Array<{
      id: string;
      path: string;
      filename: string;
    }>;
  };

  fornecedor?: Fornecedor;

  criadoPor?: {
    id: string;
    nome: string;
    email: string;
  };

  rncAnterior?: {
    id: string;
    numero: string;
    data: string;
  };

  rncsFilhas?: Array<{
    id: string;
    numero: string;
    data: string;
    status: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

export interface CreateRncDto {
  incId: string;
  descricaoNaoConformidade: string;
  reincidente: boolean;
  rncAnteriorId?: string;
  data?: string;
}

export interface UpdateRncDto {
  descricaoNaoConformidade?: string;
  status?: string;
  reincidente?: boolean;
  rncAnteriorId?: string;
}

export interface FilterRncDto {
  status?: string;
  fornecedorId?: string;
  ano?: number;
  reincidente?: boolean;
}

export interface AprovarPorConcessaoDto {
  incId: string;
}

export interface RncAnterior {
  id: string;
  numero: string;
  data: string;
  status: string;
  descricaoNaoConformidade: string;
}
