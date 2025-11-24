import api from '@/lib/api';
import {
  Rnc,
  CreateRncDto,
  UpdateRncDto,
  FilterRncDto,
  AprovarPorConcessaoDto,
  RncAnterior,
  RncHistorico,
} from '@/types/rnc';

export const rncApi = {
  /**
   * Criar nova RNC a partir de uma INC
   */
  async create(data: CreateRncDto): Promise<Rnc> {
    const response = await api.post<Rnc>('/rnc', data);
    return response.data;
  },

  /**
   * Listar todas as RNCs com filtros opcionais
   */
  async findAll(filters?: FilterRncDto): Promise<Rnc[]> {
    const response = await api.get<Rnc[]>('/rnc', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Buscar RNC por ID
   */
  async findOne(id: string): Promise<Rnc> {
    const response = await api.get<Rnc>(`/rnc/${id}`);
    return response.data;
  },

  /**
   * Atualizar RNC
   */
  async update(id: string, data: UpdateRncDto): Promise<Rnc> {
    const response = await api.patch<Rnc>(`/rnc/${id}`, data);
    return response.data;
  },

  /**
   * Remover RNC
   */
  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/rnc/${id}`);
    return response.data;
  },

  /**
   * Aprovar INC por concessão
   */
  async aprovarPorConcessao(data: AprovarPorConcessaoDto): Promise<any> {
    const response = await api.post('/rnc/aprovar-concessao', data);
    return response.data;
  },

  /**
   * Buscar RNCs anteriores de um fornecedor (para dropdown de reincidência)
   */
  async findRncsByFornecedor(
    fornecedorId: string,
    ano?: number,
  ): Promise<RncAnterior[]> {
    const response = await api.get<RncAnterior[]>(
      `/rnc/fornecedor/${fornecedorId}/anteriores`,
      {
        params: ano ? { ano } : undefined,
      },
    );
    return response.data;
  },

  /**
   * Baixar PDF da RNC
   */
  async downloadPdf(id: string): Promise<Blob> {
    const response = await api.get(`/rnc/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Aceitar plano de ação de uma RNC
   */
  async aceitarPlanoAcao(id: string, file: File): Promise<Rnc> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Rnc>(`/rnc/${id}/aceitar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Recusar plano de ação de uma RNC
   */
  async recusarPlanoAcao(
    id: string,
    file: File,
    justificativa: string,
  ): Promise<Rnc> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('justificativa', justificativa);

    const response = await api.post<Rnc>(`/rnc/${id}/recusar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Buscar histórico de uma RNC
   */
  async getHistorico(id: string): Promise<RncHistorico[]> {
    const response = await api.get<RncHistorico[]>(`/rnc/${id}/historico`);
    return response.data;
  },

  /**
   * Baixar PDF do plano de ação
   */
  async downloadPlanoAcaoPdf(id: string): Promise<Blob> {
    const response = await api.get(`/rnc/${id}/plano-acao-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Baixar PDF de um item do histórico
   */
  async downloadHistoricoPdf(historicoId: string): Promise<Blob> {
    const response = await api.get(`/rnc/historico/${historicoId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
