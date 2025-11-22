import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { fornecedoresApi } from '@/services/api/fornecedores';
import { Fornecedor } from '@/types/fornecedor';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

// Função para formatar CNPJ
const formatCNPJ = (cnpj: string) => {
  if (!cnpj) return '';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

export default function FornecedorViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuthStore();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const canUpdate = hasPermission('fornecedores.update');
  const canDelete = hasPermission('fornecedores.delete');

  useEffect(() => {
    loadFornecedor();
  }, [id]);

  const loadFornecedor = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await fornecedoresApi.findOne(id);
      setFornecedor(data);
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedor');
      navigate('/fornecedores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Tem certeza que deseja deletar este fornecedor?')) return;

    try {
      await fornecedoresApi.remove(id);
      toast.success('Fornecedor deletado com sucesso');
      navigate('/fornecedores');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar fornecedor');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
  }

  if (!fornecedor) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/fornecedores')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detalhes do Fornecedor</h1>
            <p className="text-gray-600 mt-2">Visualize as informações do fornecedor</p>
          </div>
          <div className="flex space-x-2">
            {canUpdate && (
              <button
                onClick={() => navigate(`/fornecedores/${id}/edit`)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Editar</span>
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="btn bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
              >
                <Trash2 className="w-5 h-5" />
                <span>Deletar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Fornecedor</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">CNPJ</label>
            <p className="text-gray-900 font-medium">{formatCNPJ(fornecedor.cnpj)}</p>
          </div>

          <div>
            <label className="label">Código Logix</label>
            <p className="text-gray-900 font-medium">{fornecedor.codigoLogix}</p>
          </div>

          <div className="md:col-span-2">
            <label className="label">Razão Social</label>
            <p className="text-gray-900 font-medium">{fornecedor.razaoSocial}</p>
          </div>

          <div>
            <label className="label">Data de Cadastro</label>
            <p className="text-gray-900 font-medium">
              {new Date(fornecedor.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div>
            <label className="label">Última Atualização</label>
            <p className="text-gray-900 font-medium">
              {new Date(fornecedor.updatedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
