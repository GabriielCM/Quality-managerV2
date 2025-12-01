import api from '@/lib/api';
import {
  Conserto,
  CreateConsertoDto,
  FilterConsertoDto,
} from '@/types/conserto';

export const consertoApi = {
  async create(data: CreateConsertoDto): Promise<Conserto> {
    const response = await api.post<Conserto>('/conserto', data);
    return response.data;
  },

  async findAll(filters?: FilterConsertoDto): Promise<Conserto[]> {
    const response = await api.get<Conserto[]>('/conserto', {
      params: filters,
    });
    return response.data;
  },

  async findOne(id: string): Promise<Conserto> {
    const response = await api.get<Conserto>(`/conserto/${id}`);
    return response.data;
  },

  async emitirNfe(
    id: string,
    nfeNumero: string,
    file: File,
  ): Promise<Conserto> {
    const formData = new FormData();
    formData.append('nfeNumero', nfeNumero);
    formData.append('nfePdf', file);

    const response = await api.post<Conserto>(
      `/conserto/${id}/emitir-nfe`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async confirmarColeta(id: string): Promise<Conserto> {
    const response = await api.post<Conserto>(
      `/conserto/${id}/confirmar-coleta`,
    );
    return response.data;
  },

  async confirmarRecebimento(id: string): Promise<Conserto> {
    const response = await api.post<Conserto>(
      `/conserto/${id}/confirmar-recebimento`,
    );
    return response.data;
  },

  async confirmarRetorno(
    id: string,
    nfeRetornoNumero: string,
    file: File,
  ): Promise<Conserto> {
    const formData = new FormData();
    formData.append('nfeRetornoNumero', nfeRetornoNumero);
    formData.append('nfeRetornoPdf', file);

    const response = await api.post<Conserto>(
      `/conserto/${id}/confirmar-retorno`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async aprovarInspecao(
    id: string,
    fotos: File[],
    descricao?: string,
  ): Promise<Conserto> {
    const formData = new FormData();
    fotos.forEach((foto) => formData.append('fotos', foto));
    if (descricao) {
      formData.append('inspecaoDescricao', descricao);
    }

    const response = await api.post<Conserto>(
      `/conserto/${id}/aprovar-inspecao`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async rejeitarInspecao(
    id: string,
    fotos: File[],
    descricao: string,
  ): Promise<Conserto> {
    const formData = new FormData();
    fotos.forEach((foto) => formData.append('fotos', foto));
    formData.append('inspecaoDescricao', descricao);

    const response = await api.post<Conserto>(
      `/conserto/${id}/rejeitar-inspecao`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  },

  async downloadNfePdf(id: string): Promise<Blob> {
    const response = await api.get(`/conserto/${id}/nfe-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadNfeRetornoPdf(id: string): Promise<Blob> {
    const response = await api.get(`/conserto/${id}/nfe-retorno-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadInspecaoFoto(consertoId: string, fotoId: string): Promise<Blob> {
    const response = await api.get(`/conserto/${consertoId}/inspecao-fotos/${fotoId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/conserto/${id}`);
    return response.data;
  },
};
