import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Trash2, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { consertoApi } from '@/services/api/conserto';
import { Conserto, ConsertoStatus } from '@/types/conserto';
import { useAuthStore } from '@/stores/authStore';

export default function ConsertoListPage() {
  const { hasPermission } = useAuthStore();
  const [consertos, setConsertos] = useState<Conserto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ConsertoStatus | ''>('');

  const canCreate = hasPermission('conserto.create');
  const canDelete = hasPermission('conserto.delete');

  useEffect(() => {
    loadConsertos();
  }, [statusFilter]);

  const loadConsertos = async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await consertoApi.findAll(filters);
      setConsertos(data);
    } catch (error) {
      toast.error('Erro ao carregar consertos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este conserto?')) {
      return;
    }

    try {
      await consertoApi.remove(id);
      toast.success('Conserto removido com sucesso');
      loadConsertos();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao remover conserto');
    }
  };

  const handleDownloadPdf = async (
    id: string,
    type: 'nfe' | 'nfe-retorno',
    filename: string,
  ) => {
    try {
      const blob =
        type === 'nfe'
          ? await consertoApi.downloadNfePdf(id)
          : await consertoApi.downloadNfeRetornoPdf(id);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download concluído');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer download');
    }
  };

  const getStatusColor = (status: ConsertoStatus) => {
    switch (status) {
      case ConsertoStatus.RNC_ACEITA:
        return 'bg-purple-100 text-purple-800';
      case ConsertoStatus.CONSERTO_SOLICITADA:
        return 'bg-blue-100 text-blue-800';
      case ConsertoStatus.NFE_EMITIDA:
        return 'bg-yellow-100 text-yellow-800';
      case ConsertoStatus.CONSERTO_COLETADO:
        return 'bg-indigo-100 text-indigo-800';
      case ConsertoStatus.CONSERTO_RECEBIDO:
        return 'bg-orange-100 text-orange-800';
      case ConsertoStatus.MATERIAL_RETORNADO:
        return 'bg-cyan-100 text-cyan-800';
      case ConsertoStatus.FINALIZADO:
        return 'bg-green-100 text-green-800';
      case ConsertoStatus.REJEITADO:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: ConsertoStatus) => {
    switch (status) {
      case ConsertoStatus.RNC_ACEITA:
        return 'RNC Aceita';
      case ConsertoStatus.CONSERTO_SOLICITADA:
        return 'Conserto Solicitado';
      case ConsertoStatus.NFE_EMITIDA:
        return 'NF-e Emitida';
      case ConsertoStatus.CONSERTO_COLETADO:
        return 'Material Coletado';
      case ConsertoStatus.CONSERTO_RECEBIDO:
        return 'Material Recebido';
      case ConsertoStatus.MATERIAL_RETORNADO:
        return 'Material Retornado';
      case ConsertoStatus.FINALIZADO:
        return 'Finalizado';
      case ConsertoStatus.REJEITADO:
        return 'Rejeitado';
      default:
        return status;
    }
  };

  if (!hasPermission('conserto.read')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Você não tem permissão para visualizar consertos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consertos</h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento de solicitações de conserto
          </p>
        </div>
        {canCreate && (
          <Link to="/conserto/create" className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Novo Conserto
          </Link>
        )}
      </div>

      <div className="card">
        <div className="mb-4">
          <label htmlFor="statusFilter" className="label">
            Filtrar por Status
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ConsertoStatus | '')}
            className="input max-w-xs"
          >
            <option value="">Todos os status</option>
            <option value={ConsertoStatus.RNC_ACEITA}>RNC Aceita</option>
            <option value={ConsertoStatus.CONSERTO_SOLICITADA}>
              Conserto Solicitado
            </option>
            <option value={ConsertoStatus.NFE_EMITIDA}>NF-e Emitida</option>
            <option value={ConsertoStatus.CONSERTO_COLETADO}>
              Material Coletado
            </option>
            <option value={ConsertoStatus.CONSERTO_RECEBIDO}>
              Material Recebido
            </option>
            <option value={ConsertoStatus.MATERIAL_RETORNADO}>
              Material Retornado
            </option>
            <option value={ConsertoStatus.FINALIZADO}>Finalizado</option>
            <option value={ConsertoStatus.REJEITADO}>Rejeitado</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : consertos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum conserto encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>RNC</th>
                  <th>Fornecedor</th>
                  <th>AR Origem</th>
                  <th>Status</th>
                  <th>Garantia</th>
                  <th>NF-e</th>
                  <th>NF-e Retorno</th>
                  <th>Data Criação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {consertos.map((conserto) => (
                  <tr key={conserto.id}>
                    <td>{conserto.rnc?.numero || '-'}</td>
                    <td>{conserto.rnc?.fornecedor?.razaoSocial || '-'}</td>
                    <td>{conserto.arOrigem}</td>
                    <td>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          conserto.status,
                        )}`}
                      >
                        {getStatusLabel(conserto.status)}
                      </span>
                    </td>
                    <td>
                      {conserto.consertoEmGarantia ? (
                        <span className="text-green-600 font-medium">Sim</span>
                      ) : (
                        <span className="text-gray-500">Não</span>
                      )}
                    </td>
                    <td>
                      {conserto.nfeNumero ? (
                        <button
                          onClick={() =>
                            handleDownloadPdf(
                              conserto.id,
                              'nfe',
                              `NF-e-${conserto.nfeNumero}.pdf`,
                            )
                          }
                          className="text-sky-600 hover:text-sky-800 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {conserto.nfeNumero}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {conserto.nfeRetornoNumero ? (
                        <button
                          onClick={() =>
                            handleDownloadPdf(
                              conserto.id,
                              'nfe-retorno',
                              `NF-e-Retorno-${conserto.nfeRetornoNumero}.pdf`,
                            )
                          }
                          className="text-sky-600 hover:text-sky-800 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          {conserto.nfeRetornoNumero}
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{new Date(conserto.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex space-x-2">
                        <Link
                          to={`/conserto/${conserto.id}`}
                          className="text-sky-600 hover:text-sky-800"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(conserto.id)}
                            className="text-red-600 hover:text-red-800"
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
