import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FileText, CheckCircle } from 'lucide-react';
import { rncApi } from '@/services/api/rnc';

interface Inc {
  id: string;
  data: string;
  ar: number;
  nfeNumero: string;
  quantidadeRecebida: number;
  quantidadeComDefeito: number;
  descricaoNaoConformidade: string | null;
  fornecedor: {
    id: string;
    razaoSocial: string;
    cnpj: string;
  };
  createdAt: string;
}

export default function RncAnalysisPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [incs, setIncs] = useState<Inc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const canCreateRnc = hasPermission('rnc.create');
  const canApprove = hasPermission('rnc.approve');

  useEffect(() => {
    loadIncs();
  }, []);

  const loadIncs = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/inc?status=Em análise');
      setIncs(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar INCs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGerarRnc = (incId: string) => {
    navigate(`/rnc/create?incId=${incId}`);
  };

  const handleAprovarPorConcessao = async (inc: Inc) => {
    if (
      !confirm(
        `Tem certeza que deseja aprovar por concessão a INC ${inc.ar}?\n\nFornecedor: ${inc.fornecedor.razaoSocial}`,
      )
    ) {
      return;
    }

    try {
      await rncApi.aprovarPorConcessao({ incId: inc.id });
      toast.success('INC aprovada por concessão com sucesso');
      loadIncs(); // Recarregar lista
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Erro ao aprovar por concessão',
      );
    }
  };

  if (!canCreateRnc && !canApprove) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Análise de INCs</h1>
        <p className="text-gray-600 mt-2">
          INCs em análise aguardando decisão (Gerar RNC ou Aprovar por Concessão)
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando...</p>
        </div>
      ) : incs.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            Nenhuma INC em análise no momento.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NF-e
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd. Defeito
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
                {incs.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inc.ar}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inc.fornecedor.razaoSocial}
                      </div>
                      <div className="text-xs text-gray-500">
                        CNPJ: {inc.fornecedor.cnpj.replace(
                          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                          '$1.$2.$3/$4-$5',
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inc.nfeNumero}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inc.quantidadeComDefeito}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inc.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {canCreateRnc && (
                          <button
                            onClick={() => handleGerarRnc(inc.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Gerar RNC"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Gerar RNC
                          </button>
                        )}
                        {canApprove && (
                          <button
                            onClick={() => handleAprovarPorConcessao(inc)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            title="Aprovar por Concessão"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
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
          <strong>Total de INCs em análise:</strong> {incs.length}
        </p>
      </div>
    </div>
  );
}
