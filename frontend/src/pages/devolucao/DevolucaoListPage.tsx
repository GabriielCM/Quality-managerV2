import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Plus, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { devolucaoApi } from '@/services/api/devolucao';
import { Devolucao, DevolucaoStatus } from '@/types/devolucao';
import { useAuthStore } from '@/stores/authStore';

export default function DevolucaoListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();

  const [devolucoes, setDevolucoes] = useState<Devolucao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<DevolucaoStatus | ''>('');

  const canCreate = hasPermission('devolucao.create');
  const canDelete = hasPermission('devolucao.delete');

  useEffect(() => {
    loadDevolucoes();
  }, [statusFilter]);

  const loadDevolucoes = async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await devolucaoApi.findAll(filters);
      setDevolucoes(data);
    } catch (error: any) {
      toast.error('Erro ao carregar devoluções');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta devolução?')) {
      return;
    }

    try {
      await devolucaoApi.remove(id);
      toast.success('Devolução removida com sucesso');
      loadDevolucoes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar devolução');
    }
  };

  const handleDownloadPdf = async (id: string, rncNumero: string) => {
    try {
      const blob = await devolucaoApi.downloadNfePdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nfe-devolucao-${rncNumero}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error('Erro ao baixar PDF');
    }
  };

  const getStatusColor = (status: DevolucaoStatus) => {
    switch (status) {
      case DevolucaoStatus.RNC_ACEITA:
        return 'bg-purple-100 text-purple-800';
      case DevolucaoStatus.DEVOLUCAO_SOLICITADA:
        return 'bg-blue-100 text-blue-800';
      case DevolucaoStatus.NFE_EMITIDA:
        return 'bg-indigo-100 text-indigo-800';
      case DevolucaoStatus.DEVOLUCAO_COLETADA:
        return 'bg-cyan-100 text-cyan-800';
      case DevolucaoStatus.DEVOLUCAO_RECEBIDA:
        return 'bg-teal-100 text-teal-800';
      case DevolucaoStatus.FINALIZADO:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: DevolucaoStatus) => {
    switch (status) {
      case DevolucaoStatus.RNC_ACEITA:
        return 'RNC Aceita';
      case DevolucaoStatus.DEVOLUCAO_SOLICITADA:
        return 'Devolução Solicitada';
      case DevolucaoStatus.NFE_EMITIDA:
        return 'NF-e Emitida';
      case DevolucaoStatus.DEVOLUCAO_COLETADA:
        return 'Coletada';
      case DevolucaoStatus.DEVOLUCAO_RECEBIDA:
        return 'Recebida';
      case DevolucaoStatus.FINALIZADO:
        return 'Finalizado';
      default:
        return status;
    }
  };

  if (!hasPermission('devolucao.read')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Você não tem permissão para visualizar devoluções.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devoluções</h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento de devoluções de mercadorias
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => navigate('/devolucao/create')}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Devolução</span>
          </button>
        )}
      </div>

      <div className="card">
        <div className="mb-4">
          <label className="label">Filtrar por Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DevolucaoStatus | '')}
            className="input max-w-xs"
          >
            <option value="">Todos os Status</option>
            <option value={DevolucaoStatus.RNC_ACEITA}>RNC Aceita</option>
            <option value={DevolucaoStatus.DEVOLUCAO_SOLICITADA}>
              Devolução Solicitada
            </option>
            <option value={DevolucaoStatus.NFE_EMITIDA}>NF-e Emitida</option>
            <option value={DevolucaoStatus.DEVOLUCAO_COLETADA}>Coletada</option>
            <option value={DevolucaoStatus.DEVOLUCAO_RECEBIDA}>Recebida</option>
            <option value={DevolucaoStatus.FINALIZADO}>Finalizado</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : devolucoes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma devolução encontrada
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    RNC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    AR Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {devolucoes.map((devolucao) => (
                  <tr key={devolucao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {devolucao.rnc?.numero}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{devolucao.arOrigem}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {devolucao.rnc?.fornecedor?.razaoSocial}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {devolucao.quantidadeTotal}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          devolucao.status,
                        )}`}
                      >
                        {getStatusLabel(devolucao.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(devolucao.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/devolucao/${devolucao.id}`)}
                          className="text-sky-600 hover:text-sky-900"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {devolucao.nfePdfPath && (
                          <button
                            onClick={() =>
                              handleDownloadPdf(devolucao.id, devolucao.rnc?.numero || '')
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Download NF-e PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(devolucao.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deletar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
