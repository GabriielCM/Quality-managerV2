import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { fornecedoresApi } from '@/services/api/fornecedores';
import { Fornecedor } from '@/types/fornecedor';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Trash2 } from 'lucide-react';

interface Inc {
  id: string;
  ar: number;
  nfeNumero: string;
  nfeAnexo: string;
  um: string;
  quantidadeRecebida: number;
  quantidadeComDefeito: number;
  descricaoNaoConformidade?: string;
  fornecedorId: string;
  fornecedor: Fornecedor;
  status: string;
  fotos: {
    id: string;
    path: string;
    filename: string;
  }[];
}

export default function IncEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inc, setInc] = useState<Inc | null>(null);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [formData, setFormData] = useState({
    ar: '',
    nfeNumero: '',
    um: 'KG',
    quantidadeRecebida: '',
    quantidadeComDefeito: '',
    descricaoNaoConformidade: '',
    fornecedorId: '',
    status: 'Em análise',
  });
  const [nfeFile, setNfeFile] = useState<File | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);

  useEffect(() => {
    loadInc();
    loadFornecedores();
  }, [id]);

  const loadFornecedores = async () => {
    try {
      const data = await fornecedoresApi.findAll();
      setFornecedores(data);
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedores');
      console.error(error);
    }
  };

  const loadInc = async () => {
    try {
      const response = await api.get(`/inc/${id}`);
      const data = response.data;
      setInc(data);
      setFormData({
        ar: data.ar.toString(),
        nfeNumero: data.nfeNumero,
        um: data.um,
        quantidadeRecebida: data.quantidadeRecebida.toString(),
        quantidadeComDefeito: data.quantidadeComDefeito.toString(),
        descricaoNaoConformidade: data.descricaoNaoConformidade || '',
        fornecedorId: data.fornecedorId,
        status: data.status,
      });
    } catch (error: any) {
      toast.error('Erro ao carregar INC');
      navigate('/inc');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNfeFile(e.target.files[0]);
    }
  };

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files));
    }
  };

  const removeFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleDeleteFoto = async (fotoId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta foto?')) return;

    try {
      await api.delete(`/inc/${id}/fotos/${fotoId}`);
      toast.success('Foto deletada com sucesso');
      loadInc();
    } catch (error: any) {
      toast.error('Erro ao deletar foto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const data = new FormData();
      data.append('ar', formData.ar);
      data.append('nfeNumero', formData.nfeNumero);
      data.append('um', formData.um);
      data.append('quantidadeRecebida', formData.quantidadeRecebida);
      data.append('quantidadeComDefeito', formData.quantidadeComDefeito);
      data.append('fornecedorId', formData.fornecedorId);
      if (formData.descricaoNaoConformidade) {
        data.append('descricaoNaoConformidade', formData.descricaoNaoConformidade);
      }
      data.append('status', formData.status);

      if (nfeFile) {
        data.append('nfeFile', nfeFile);
      }

      fotos.forEach((foto) => {
        data.append('fotos', foto);
      });

      await api.patch(`/inc/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('INC atualizado com sucesso');
      navigate(`/inc/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar INC');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  if (!inc) {
    return <div className="text-center py-12">INC não encontrado</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/inc/${id}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Editar INC #{inc.ar}</h1>
        <p className="text-gray-600 mt-2">Atualize os dados do INC</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ar" className="label">
              AR <span className="text-red-500">*</span>
            </label>
            <input
              id="ar"
              type="number"
              value={formData.ar}
              onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="nfeNumero" className="label">
              NF-e Número <span className="text-red-500">*</span>
            </label>
            <input
              id="nfeNumero"
              type="text"
              value={formData.nfeNumero}
              onChange={(e) => setFormData({ ...formData, nfeNumero: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="um" className="label">
              Unidade de Medida <span className="text-red-500">*</span>
            </label>
            <select
              id="um"
              value={formData.um}
              onChange={(e) => setFormData({ ...formData, um: e.target.value })}
              className="input"
              required
            >
              <option value="UN">UN</option>
              <option value="KG">KG</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="CX">CX</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="label">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input"
              required
            >
              <option value="Em análise">Em análise</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantidadeRecebida" className="label">
              Quantidade Recebida <span className="text-red-500">*</span>
            </label>
            <input
              id="quantidadeRecebida"
              type="number"
              step="0.01"
              value={formData.quantidadeRecebida}
              onChange={(e) =>
                setFormData({ ...formData, quantidadeRecebida: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="quantidadeComDefeito" className="label">
              Quantidade Com Defeito <span className="text-red-500">*</span>
            </label>
            <input
              id="quantidadeComDefeito"
              type="number"
              step="0.01"
              value={formData.quantidadeComDefeito}
              onChange={(e) =>
                setFormData({ ...formData, quantidadeComDefeito: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="fornecedorId" className="label">
              Fornecedor <span className="text-red-500">*</span>
            </label>
            <select
              id="fornecedorId"
              value={formData.fornecedorId}
              onChange={(e) => setFormData({ ...formData, fornecedorId: e.target.value })}
              className="input"
              required
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.razaoSocial} - {fornecedor.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descricaoNaoConformidade" className="label">
              Descrição da Não Conformidade
            </label>
            <textarea
              id="descricaoNaoConformidade"
              value={formData.descricaoNaoConformidade}
              onChange={(e) =>
                setFormData({ ...formData, descricaoNaoConformidade: e.target.value })
              }
              className="input"
              rows={4}
              placeholder="Descreva detalhadamente a não conformidade encontrada..."
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="nfeFile" className="label">
              NF-e Atual: {inc.nfeAnexo ? inc.nfeAnexo : 'Nenhuma'}
            </label>
            <label htmlFor="nfeFile" className="label mt-2">
              Substituir NF-e (PDF)
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <label className="flex-1 cursor-pointer">
                <div className="input flex items-center justify-between">
                  <span className="text-gray-500 truncate">
                    {nfeFile ? nfeFile.name : 'Selecione um arquivo'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="nfeFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {nfeFile && (
                <button
                  type="button"
                  onClick={() => setNfeFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {inc.fotos.length > 0 && (
            <div className="md:col-span-2">
              <label className="label">Fotos Existentes</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {inc.fotos.map((foto) => (
                  <div key={foto.id} className="relative group">
                    <img
                      src={`/uploads/${foto.path}`}
                      alt={foto.filename}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteFoto(foto.id)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{foto.filename}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <label htmlFor="fotos" className="label">
              Adicionar Novas Fotos
            </label>
            <div className="mt-1">
              <label className="cursor-pointer">
                <div className="input flex items-center justify-between">
                  <span className="text-gray-500">
                    {fotos.length > 0
                      ? `${fotos.length} foto(s) selecionada(s)`
                      : 'Selecione as fotos'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="fotos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFotosChange}
                  className="hidden"
                />
              </label>
            </div>

            {fotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {fotos.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`Nova foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{foto.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/inc/${id}`)}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
