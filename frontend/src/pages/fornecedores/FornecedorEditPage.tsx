import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fornecedoresApi } from '@/services/api/fornecedores';
import { Fornecedor, UpdateFornecedorDto } from '@/types/fornecedor';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import FornecedorForm from './FornecedorForm';

export default function FornecedorEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    loadFornecedor();
  }, [id]);

  const loadFornecedor = async () => {
    if (!id) return;

    try {
      setIsFetching(true);
      const data = await fornecedoresApi.findOne(id);
      setFornecedor(data);
    } catch (error: any) {
      toast.error('Erro ao carregar fornecedor');
      navigate('/fornecedores');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (data: UpdateFornecedorDto) => {
    if (!id) return;

    setIsLoading(true);

    try {
      await fornecedoresApi.update(id, data);
      toast.success('Fornecedor atualizado com sucesso');
      navigate('/fornecedores');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar fornecedor';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Carregando...</div>
      </div>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Editar Fornecedor</h1>
        <p className="text-gray-600 mt-2">Atualize os dados do fornecedor</p>
      </div>

      {fornecedor && (
        <FornecedorForm
          fornecedor={fornecedor}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
