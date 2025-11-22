import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/lib/api';
import { Fornecedor } from '@/types/fornecedor';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, FileText, Package, Calendar, User, Building2 } from 'lucide-react';

interface Inc {
  id: string;
  data: string;
  ar: number;
  nfeNumero: string;
  nfeAnexo: string;
  um: string;
  quantidadeRecebida: number;
  quantidadeComDefeito: number;
  descricaoNaoConformidade?: string;
  status: string;
  fornecedor: Fornecedor;
  criadoPor: {
    id: string;
    nome: string;
    email: string;
  };
  fotos: {
    id: string;
    path: string;
    filename: string;
  }[];
  createdAt: string;
}

export default function IncViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inc, setInc] = useState<Inc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInc();
  }, [id]);

  const loadInc = async () => {
    try {
      const response = await api.get(`/inc/${id}`);
      setInc(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar INC');
      navigate('/inc');
    } finally {
      setIsLoading(false);
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
      default:
        return 'bg-gray-100 text-gray-800';
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
          onClick={() => navigate('/inc')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INC #{inc.ar}</h1>
            <p className="text-gray-600 mt-2">Detalhes da incidência</p>
          </div>
          <Link to={`/inc/${inc.id}/edit`} className="btn btn-primary flex items-center space-x-2">
            <Edit className="w-5 h-5" />
            <span>Editar</span>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status */}
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            <span
              className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(inc.status)}`}
            >
              {inc.status}
            </span>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">AR</p>
                <p className="text-base font-semibold text-gray-900">{inc.ar}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">NF-e Número</p>
                <p className="text-base font-semibold text-gray-900">{inc.nfeNumero}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Unidade de Medida</p>
                <p className="text-base font-semibold text-gray-900">{inc.um}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Quantidade Recebida</p>
                <p className="text-base font-semibold text-gray-900">
                  {inc.quantidadeRecebida} {inc.um}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Quantidade Com Defeito</p>
                <p className="text-base font-semibold text-red-600">
                  {inc.quantidadeComDefeito} {inc.um}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Data de Registro</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(inc.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Criado Por</p>
                <p className="text-base font-semibold text-gray-900">{inc.criadoPor.nome}</p>
                <p className="text-sm text-gray-500">{inc.criadoPor.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Criado Em</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(inc.createdAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Fornecedor */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fornecedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Razão Social</p>
                <p className="text-base font-semibold text-gray-900">{inc.fornecedor.razaoSocial}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">CNPJ</p>
                <p className="text-base font-semibold text-gray-900">
                  {inc.fornecedor.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Código Logix</p>
                <p className="text-base font-semibold text-gray-900">{inc.fornecedor.codigoLogix}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição da Não Conformidade */}
        {inc.descricaoNaoConformidade && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descrição da Não Conformidade</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{inc.descricaoNaoConformidade}</p>
          </div>
        )}

        {/* NF-e */}
        {inc.nfeAnexo && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">NF-e Anexada</h2>
            <a
              href={`/uploads/${inc.nfeAnexo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <FileText className="w-5 h-5" />
              <span>Visualizar NF-e</span>
            </a>
          </div>
        )}

        {/* Fotos */}
        {inc.fotos.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Fotos ({inc.fotos.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inc.fotos.map((foto) => (
                <a
                  key={foto.id}
                  href={`/uploads/${foto.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <img
                    src={`/uploads/${foto.path}`}
                    alt={foto.filename}
                    className="w-full h-32 object-cover rounded-lg group-hover:opacity-75 transition-opacity"
                  />
                  <p className="text-xs text-gray-500 mt-1 truncate">{foto.filename}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
