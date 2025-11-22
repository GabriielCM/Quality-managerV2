import api from '@/lib/api';
import {
  Fornecedor,
  CreateFornecedorDto,
  UpdateFornecedorDto,
  FilterFornecedorDto
} from '@/types/fornecedor';

export const fornecedoresApi = {
  /**
   * Criar novo fornecedor
   */
  async create(data: CreateFornecedorDto): Promise<Fornecedor> {
    const response = await api.post<Fornecedor>('/fornecedores', data);
    return response.data;
  },

  /**
   * Listar todos os fornecedores
   */
  async findAll(filters?: FilterFornecedorDto): Promise<Fornecedor[]> {
    const response = await api.get<Fornecedor[]>('/fornecedores', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Buscar fornecedor por ID
   */
  async findOne(id: string): Promise<Fornecedor> {
    const response = await api.get<Fornecedor>(`/fornecedores/${id}`);
    return response.data;
  },

  /**
   * Atualizar fornecedor
   */
  async update(id: string, data: UpdateFornecedorDto): Promise<Fornecedor> {
    const response = await api.patch<Fornecedor>(`/fornecedores/${id}`, data);
    return response.data;
  },

  /**
   * Remover fornecedor
   */
  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/fornecedores/${id}`);
    return response.data;
  },
};
