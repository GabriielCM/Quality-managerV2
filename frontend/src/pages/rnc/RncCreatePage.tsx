import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText } from 'lucide-react';
import { rncApi } from '@/services/api/rnc';
import { RncAnterior } from '@/types/rnc';

interface Inc {
  id: string;
  data: string;
  ar: number;
  nfeNumero: string;
  um: string;
  quantidadeRecebida: number;
  quantidadeComDefeito: number;
  descricaoNaoConformidade: string | null;
  fornecedor: {
    id: string;
    razaoSocial: string;
    cnpj: string;
    codigoLogix: string;
  };
}

export default function RncCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = useAuthStore();
  const [inc, setInc] = useState<Inc | null>(null);
  const [rncAnteriores, setRncAnteriores] = useState<RncAnterior[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    descricaoNaoConformidade: '',
    reincidente: false,
    rncAnteriorId: '',
    data: new Date().toISOString().split('T')[0], // Data de hoje
  });

  const canCreate = hasPermission('rnc.create');

  useEffect(() => {
    const incId = searchParams.get('incId');
    if (!incId) {
      toast.error('INC não especificada');
      navigate('/rnc/analysis');
      return;
    }

    loadInc(incId);
  }, [searchParams]);

  const loadInc = async (incId: string) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/inc/${incId}`);
      const incData = response.data;
      setInc(incData);

      // Pré-preencher descrição se existir
      if (incData.descricaoNaoConformidade) {
        setFormData((prev) => ({
          ...prev,
          descricaoNaoConformidade: incData.descricaoNaoConformidade,
        }));
      }

      // Carregar RNCs anteriores do fornecedor
      loadRncAnteriores(incData.fornecedor.id);
    } catch (error: any) {
      toast.error('Erro ao carregar INC');
      navigate('/rnc/analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRncAnteriores = async (fornecedorId: string) => {
    try {
      const rncs = await rncApi.findRncsByFornecedor(fornecedorId);
      setRncAnteriores(rncs);
    } catch (error) {
      console.error('Erro ao carregar RNCs anteriores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inc) return;

    if (!formData.descricaoNaoConformidade.trim()) {
      toast.error('Descrição da não conformidade é obrigatória');
      return;
    }

    if (formData.reincidente && !formData.rncAnteriorId) {
      toast.error(
        'Selecione a RNC anterior quando marcar como reincidente',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const createDto = {
        incId: inc.id,
        descricaoNaoConformidade: formData.descricaoNaoConformidade,
        reincidente: formData.reincidente,
        rncAnteriorId: formData.reincidente ? formData.rncAnteriorId : undefined,
        data: formData.data,
      };

      const rnc = await rncApi.create(createDto);

      toast.success(`RNC ${rnc.numero} criada com sucesso!`);
      navigate(`/rnc/${rnc.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar RNC');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Você não tem permissão para criar RNCs.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando dados da INC...</p>
        </div>
      </div>
    );
  }

  if (!inc) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerar RNC</h1>
          <p className="text-gray-600 mt-2">
            Relatório de Não Conformidade a partir da INC {inc.ar}
          </p>
        </div>
        <button
          onClick={() => navigate('/rnc/analysis')}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dados da INC (Importados)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AR
            </label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {inc.ar}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NF-e
            </label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {inc.nfeNumero}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade de Medida
            </label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {inc.um}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade Recebida
            </label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {inc.quantidadeRecebida}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade com Defeito
            </label>
            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
              {inc.quantidadeComDefeito}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Fornecedor
          </h3>
          <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded border border-gray-200">
            {inc.fornecedor.razaoSocial}
            <div className="text-sm text-gray-600 mt-1">
              CNPJ: {inc.fornecedor.cnpj.replace(
                /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                '$1.$2.$3/$4-$5',
              )} | Código Logix: {inc.fornecedor.codigoLogix}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dados da RNC
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição da Não Conformidade *
            </label>
            <textarea
              value={formData.descricaoNaoConformidade}
              onChange={(e) =>
                setFormData({ ...formData, descricaoNaoConformidade: e.target.value })
              }
              className="input w-full"
              rows={5}
              required
              placeholder="Descreva a não conformidade encontrada..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da RNC *
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) =>
                setFormData({ ...formData, data: e.target.value })
              }
              className="input w-full"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="reincidente"
              checked={formData.reincidente}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  reincidente: e.target.checked,
                  rncAnteriorId: e.target.checked ? formData.rncAnteriorId : '',
                })
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="reincidente"
              className="ml-2 block text-sm text-gray-900"
            >
              Reincidente (Esta não conformidade já ocorreu antes)
            </label>
          </div>

          {formData.reincidente && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RNC Anterior *
              </label>
              {rncAnteriores.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Nenhuma RNC anterior encontrada para este fornecedor.
                </p>
              ) : (
                <select
                  value={formData.rncAnteriorId}
                  onChange={(e) =>
                    setFormData({ ...formData, rncAnteriorId: e.target.value })
                  }
                  className="input w-full"
                  required={formData.reincidente}
                >
                  <option value="">Selecione a RNC anterior...</option>
                  {rncAnteriores.map((rnc) => (
                    <option key={rnc.id} value={rnc.id}>
                      {rnc.numero} - {new Date(rnc.data).toLocaleDateString('pt-BR')} - {rnc.status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>{isSubmitting ? 'Gerando RNC...' : 'Gerar RNC'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/rnc/analysis')}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
