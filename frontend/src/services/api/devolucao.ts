import api from '@/lib/api';
import {
  Devolucao,
  CreateDevolucaoDto,
  FilterDevolucaoDto,
} from '@/types/devolucao';

export const devolucaoApi = {
  async create(data: CreateDevolucaoDto): Promise<Devolucao> {
    const response = await api.post<Devolucao>('/devolucao', data);
    return response.data;
  },

  async findAll(filters?: FilterDevolucaoDto): Promise<Devolucao[]> {
    const response = await api.get<Devolucao[]>('/devolucao', {
      params: filters,
    });
    return response.data;
  },

  async findOne(id: string): Promise<Devolucao> {
    const response = await api.get<Devolucao>(`/devolucao/${id}`);
    return response.data;
  },

  async emitirNfe(
    id: string,
    nfeNumero: string,
    file: File,
  ): Promise<Devolucao> {
    const formData = new FormData();
    formData.append('nfeNumero', nfeNumero);
    formData.append('nfePdf', file);

    const response = await api.post<Devolucao>(
      `/devolucao/${id}/emitir-nfe`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async confirmarColeta(id: string): Promise<Devolucao> {
    const response = await api.post<Devolucao>(
      `/devolucao/${id}/confirmar-coleta`,
    );
    return response.data;
  },

  async confirmarRecebimento(id: string): Promise<Devolucao> {
    const response = await api.post<Devolucao>(
      `/devolucao/${id}/confirmar-recebimento`,
    );
    return response.data;
  },

  async confirmarCompensacao(id: string): Promise<Devolucao> {
    const response = await api.post<Devolucao>(
      `/devolucao/${id}/confirmar-compensacao`,
    );
    return response.data;
  },

  async downloadNfePdf(id: string): Promise<Blob> {
    const response = await api.get(`/devolucao/${id}/nfe-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/devolucao/${id}`);
    return response.data;
  },
};
