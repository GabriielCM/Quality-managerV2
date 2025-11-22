import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fornecedoresApi } from '@/services/api/fornecedores';
import { CreateFornecedorDto } from '@/types/fornecedor';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import FornecedorForm from './FornecedorForm';

export default function FornecedorCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateFornecedorDto) => {
    setIsLoading(true);

    try {
      await fornecedoresApi.create(data);
      toast.success('Fornecedor criado com sucesso');
      navigate('/fornecedores');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar fornecedor';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Novo Fornecedor</h1>
        <p className="text-gray-600 mt-2">Preencha os dados para cadastrar um novo fornecedor</p>
      </div>

      <FornecedorForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
