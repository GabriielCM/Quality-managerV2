import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { Eye, Trash2, Download, Filter } from 'lucide-react';
import { rncApi } from '@/services/api/rnc';
import { Rnc } from '@/types/rnc';

export default function RncListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [rncs, setRncs] = useState<Rnc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    ano: '',
    reincidente: '',
  });

  const canDelete = hasPermission('rnc.delete');

  useEffect(() => {
    loadRncs();
  }, []);

  const loadRncs = async () => {
    try {
      setIsLoading(true);
      const filterParams: any = {};

      if (filters.status) filterParams.status = filters.status;
      if (filters.ano) filterParams.ano = parseInt(filters.ano, 10);
      if (filters.reincidente === 'true') filterParams.reincidente = true;
      if (filters.reincidente === 'false') filterParams.reincidente = false;

      const data = await rncApi.findAll(filterParams);
      setRncs(data);
    } catch (error: any) {
      toast.error('Erro ao carregar RNCs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, numero: string) => {
    if (
      !confirm(
        `Tem certeza que deseja deletar a RNC ${numero}?\n\nO PDF também será removido.`,
      )
    ) {
      return;
    }

    try {
      await rncApi.remove(id);
      toast.success('RNC deletada com sucesso');
      loadRncs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar RNC');
    }
  };

  const handleDownloadPdf = async (id: string, numero: string) => {
    try {
      const blob = await rncApi.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${numero.replace(/[:\/]/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF baixado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao baixar PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RNC enviada':
        return 'bg-blue-100 text-blue-800';
      case 'Aguardando resposta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em análise':
        return 'bg-orange-100 text-orange-800';
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">RNCs</h1>
        <p className="text-gray-600 mt-2">
          Relatórios de Não Conformidade registrados
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex items-center mb-3">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input w-full"
            >
              <option value="">Todos</option>
              <option value="RNC enviada">RNC enviada</option>
              <option value="Aguardando resposta">Aguardando resposta</option>
              <option value="Em análise">Em análise</option>
              <option value="Concluída">Concluída</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ano
            </label>
            <input
              type="number"
              value={filters.ano}
              onChange={(e) => setFilters({ ...filters, ano: e.target.value })}
              className="input w-full"
              placeholder="Ex: 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reincidente
            </label>
            <select
              value={filters.reincidente}
              onChange={(e) =>
                setFilters({ ...filters, reincidente: e.target.value })
              }
              className="input w-full"
            >
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadRncs}
              className="btn btn-primary w-full"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      ) : rncs.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">Nenhuma RNC encontrada.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reincidente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rncs.map((rnc) => (
                  <tr key={rnc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rnc.numero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rnc.fornecedor?.razaoSocial || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rnc.ar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          rnc.status,
                        )}`}
                      >
                        {rnc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {rnc.reincidente ? (
                        <span className="text-red-600 font-medium">Sim</span>
                      ) : (
                        <span className="text-gray-500">Não</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(rnc.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/rnc/${rnc.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {rnc.pdfPath && (
                          <button
                            onClick={() => handleDownloadPdf(rnc.id, rnc.numero)}
                            className="text-green-600 hover:text-green-900"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(rnc.id, rnc.numero)}
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
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Total de RNCs:</strong> {rncs.length}
        </p>
      </div>
    </div>
  );
}
