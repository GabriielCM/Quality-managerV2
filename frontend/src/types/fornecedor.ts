export interface Fornecedor {
  id: string;
  cnpj: string;
  razaoSocial: string;
  codigoLogix: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFornecedorDto {
  cnpj: string;
  razaoSocial: string;
  codigoLogix: string;
}

export interface UpdateFornecedorDto {
  cnpj?: string;
  razaoSocial?: string;
  codigoLogix?: string;
}

export interface FilterFornecedorDto {
  cnpj?: string;
  razaoSocial?: string;
  codigoLogix?: string;
}
