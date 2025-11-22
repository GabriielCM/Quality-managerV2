import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { fornecedoresApi } from '@/services/api/fornecedores';
import { Fornecedor } from '@/types/fornecedor';
import toast from 'react-hot-toast';
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';

// Função para formatar CNPJ
const formatCNPJ = (cnpj: string) => {
  if (!cnpj) return '';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

export default function FornecedoresListPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    cnpj: '',
    razaoSocial: '',
    codigoLogix: '',
  });

  const canCreate = hasPermission('fornecedores.create');
  const canUpdate = hasPermission('fornecedores.update');
  const canDelete = hasPermission('fornecedores.delete');

  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      setIsLoading(true);
      const activeFilters: any = {};

      if (filters.cnpj) activeFilters.cnpj = filters.cnpj;
      if (filters.razaoSocial) activeFilters.razaoSocial = filters.razaoSocial;
      if (filters.codigoLogix) activeFilters.codigoLogix = filters.codigoLogix;

      const data = await fornecedoresApi.findAll(activeFilters);
      setFornecedores(data);
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedores');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este fornecedor?')) return;

    try {
      await fornecedoresApi.remove(id);
      toast.success('Fornecedor deletado com sucesso');
      loadFornecedores();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar fornecedor');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      cnpj: '',
      razaoSocial: '',
      codigoLogix: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600 mt-2">Gestão de Fornecedores</p>
        </div>

        {canCreate && (
          <Link to="/fornecedores/create" className="btn btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Novo Fornecedor</span>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">CNPJ</label>
            <input
              type="text"
              value={filters.cnpj}
              onChange={(e) => setFilters({ ...filters, cnpj: e.target.value })}
              className="input"
              placeholder="Digite o CNPJ"
            />
          </div>

          <div>
            <label className="label">Razão Social</label>
            <input
              type="text"
              value={filters.razaoSocial}
              onChange={(e) => setFilters({ ...filters, razaoSocial: e.target.value })}
              className="input"
              placeholder="Digite a Razão Social"
            />
          </div>

          <div>
            <label className="label">Código Logix</label>
            <input
              type="text"
              value={filters.codigoLogix}
              onChange={(e) => setFilters({ ...filters, codigoLogix: e.target.value })}
              className="input"
              placeholder="Digite o Código Logix"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button onClick={handleClearFilters} className="btn btn-secondary">
            Limpar
          </button>
          <button onClick={loadFornecedores} className="btn btn-primary">
            Aplicar Filtros
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : fornecedores.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Nenhum fornecedor encontrado</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Razão Social
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código Logix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data de Cadastro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fornecedores.map((fornecedor) => (
                  <tr key={fornecedor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCNPJ(fornecedor.cnpj)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{fornecedor.razaoSocial}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{fornecedor.codigoLogix}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(fornecedor.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/fornecedores/${fornecedor.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => navigate(`/fornecedores/${fornecedor.id}/edit`)}
                            className="text-green-600 hover:text-green-900"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(fornecedor.id)}
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
