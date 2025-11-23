import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';

interface Inc {
  id: string;
  data: string;
  ar: number;
  nfeNumero: string;
  um: string;
  quantidadeRecebida: number;
  quantidadeComDefeito: number;
  status: string;
  criadoPor: {
    nome: string;
  };
  createdAt: string;
}

export default function IncListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [incs, setIncs] = useState<Inc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    ar: '',
    dataInicio: '',
    dataFim: '',
  });

  const canCreate = hasPermission('inc.create');
  const canUpdate = hasPermission('inc.update');
  const canDelete = hasPermission('inc.delete');

  useEffect(() => {
    loadIncs();
  }, []);

  const loadIncs = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();

      if (filters.status) queryParams.append('status', filters.status);
      if (filters.ar) queryParams.append('ar', filters.ar);
      if (filters.dataInicio) queryParams.append('dataInicio', filters.dataInicio);
      if (filters.dataFim) queryParams.append('dataFim', filters.dataFim);

      const response = await api.get(`/inc?${queryParams.toString()}`);
      setIncs(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar INCs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este INC?')) return;

    try {
      await api.delete(`/inc/${id}`);
      toast.success('INC deletado com sucesso');
      loadIncs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar INC');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em análise':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      case 'Aprovado por concessão':
        return 'bg-green-100 text-green-800';
      case 'RNC enviada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">INC</h1>
          <p className="text-gray-600 mt-2">Gestão de Incidências</p>
        </div>

        {canCreate && (
          <Link to="/inc/create" className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Novo INC</span>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input"
            >
              <option value="">Todos</option>
              <option value="Em análise">Em análise</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
            </select>
          </div>

          <div>
            <label className="label">AR</label>
            <input
              type="number"
              value={filters.ar}
              onChange={(e) => setFilters({ ...filters, ar: e.target.value })}
              className="input"
              placeholder="Número AR"
            />
          </div>

          <div>
            <label className="label">Data Início</label>
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Data Fim</label>
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={loadIncs} className="btn btn-primary">
            Aplicar Filtros
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : incs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Nenhum INC encontrado</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    AR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    NF-e
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Defeitos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Criado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incs.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inc.ar}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{inc.nfeNumero}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {inc.quantidadeRecebida} {inc.um}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {inc.quantidadeComDefeito} {inc.um}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inc.status)}`}
                      >
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{inc.criadoPor.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(inc.data).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/inc/${inc.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => navigate(`/inc/${inc.id}/edit`)}
                            className="text-green-600 hover:text-green-900"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(inc.id)}
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
    </div>
  );
}
