import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Package, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { devolucaoApi } from '@/services/api/devolucao';
import { Devolucao, DevolucaoStatus } from '@/types/devolucao';
import { useAuthStore } from '@/stores/authStore';
import TimelineStepper from '@/components/devolucao/TimelineStepper';
import EmitirNfeModal from '@/components/devolucao/EmitirNfeModal';

export default function DevolucaoViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();

  const [devolucao, setDevolucao] = useState<Devolucao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmitirNfeModal, setShowEmitirNfeModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    action: 'coleta' | 'recebimento' | 'compensacao' | null;
  }>({ action: null });

  const canUpdate = hasPermission('devolucao.update');

  useEffect(() => {
    if (id) {
      loadDevolucao(id);
    }
  }, [id]);

  const loadDevolucao = async (devolucaoId: string) => {
    try {
      setIsLoading(true);
      const data = await devolucaoApi.findOne(devolucaoId);
      setDevolucao(data);
    } catch (error: any) {
      toast.error('Erro ao carregar devolução');
      navigate('/devolucao');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!devolucao) return;
    try {
      const blob = await devolucaoApi.downloadNfePdf(devolucao.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nfe-devolucao-${devolucao.rnc?.numero}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Erro ao baixar PDF');
    }
  };

  const handleConfirmarColeta = async () => {
    if (!devolucao) return;
    try {
      await devolucaoApi.confirmarColeta(devolucao.id);
      toast.success('Coleta confirmada com sucesso');
      loadDevolucao(devolucao.id);
      setShowConfirmModal({ action: null });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar coleta');
    }
  };

  const handleConfirmarRecebimento = async () => {
    if (!devolucao) return;
    try {
      await devolucaoApi.confirmarRecebimento(devolucao.id);
      toast.success('Recebimento confirmado com sucesso');
      loadDevolucao(devolucao.id);
      setShowConfirmModal({ action: null });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar recebimento');
    }
  };

  const handleConfirmarCompensacao = async () => {
    if (!devolucao) return;
    try {
      await devolucaoApi.confirmarCompensacao(devolucao.id);
      toast.success('Compensação fiscal confirmada com sucesso');
      loadDevolucao(devolucao.id);
      setShowConfirmModal({ action: null });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar compensação');
    }
  };

  const handleEmitirNfe = async (nfeNumero: string, file: File) => {
    if (!devolucao) return;
    await devolucaoApi.emitirNfe(devolucao.id, nfeNumero, file);
    toast.success('NF-e emitida com sucesso');
    loadDevolucao(devolucao.id);
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
    const labels = {
      [DevolucaoStatus.RNC_ACEITA]: 'RNC Aceita',
      [DevolucaoStatus.DEVOLUCAO_SOLICITADA]: 'Devolução Solicitada',
      [DevolucaoStatus.NFE_EMITIDA]: 'NF-e Emitida',
      [DevolucaoStatus.DEVOLUCAO_COLETADA]: 'Coletada',
      [DevolucaoStatus.DEVOLUCAO_RECEBIDA]: 'Recebida',
      [DevolucaoStatus.FINALIZADO]: 'Finalizado',
    };
    return labels[status] || status;
  };

  if (!hasPermission('devolucao.read')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Você não tem permissão para visualizar devoluções.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!devolucao) {
    return <div>Devolução não encontrada</div>;
  }

  const timelineSteps = [
    {
      status: DevolucaoStatus.RNC_ACEITA,
      label: 'RNC Aceita',
      date: null,
      user: null,
    },
    {
      status: DevolucaoStatus.DEVOLUCAO_SOLICITADA,
      label: 'Devolução Solicitada',
      date: devolucao.createdAt,
      user: devolucao.criadoPor?.nome,
    },
    {
      status: DevolucaoStatus.NFE_EMITIDA,
      label: 'NF-e Emitida',
      date: devolucao.nfeEmitidaEm,
      user: devolucao.nfeEmitidaPor?.nome,
    },
    {
      status: DevolucaoStatus.DEVOLUCAO_COLETADA,
      label: 'Coletada',
      date: devolucao.dataColeta,
      user: devolucao.coletaConfirmadaPor?.nome,
    },
    {
      status: DevolucaoStatus.DEVOLUCAO_RECEBIDA,
      label: 'Recebida',
      date: devolucao.dataRecebimento,
      user: devolucao.recebimentoConfirmadoPor?.nome,
    },
    {
      status: DevolucaoStatus.FINALIZADO,
      label: 'Finalizado',
      date: devolucao.dataCompensacao,
      user: devolucao.compensacaoConfirmadaPor?.nome,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/devolucao')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Devolução - RNC {devolucao.rnc?.numero}
            </h1>
            <p className="text-gray-600 mt-1">
              Visualização completa da devolução
            </p>
          </div>
        </div>
        {devolucao.nfePdfPath && (
          <button onClick={handleDownloadPdf} className="btn btn-secondary flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Download NF-e PDF</span>
          </button>
        )}
      </div>

      <TimelineStepper currentStatus={devolucao.status} steps={timelineSteps} />

      <div className="card">
        <div className="mb-4">
          <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(devolucao.status)}`}>
            {getStatusLabel(devolucao.status)}
          </span>
        </div>
      </div>

      {/* Dynamic Action Panels */}
      {canUpdate && devolucao.status === DevolucaoStatus.DEVOLUCAO_SOLICITADA && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Etapa: Emitir NF-e
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Registre o número da NF-e de devolução e faça upload do PDF.
          </p>
          <button
            onClick={() => setShowEmitirNfeModal(true)}
            className="btn btn-primary"
          >
            Emitir NF-e
          </button>
        </div>
      )}

      {canUpdate && devolucao.status === DevolucaoStatus.NFE_EMITIDA && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="w-6 h-6 text-cyan-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Etapa: Confirmar Coleta
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Confirme que a mercadoria foi coletada pela transportadora.
          </p>
          <button
            onClick={() => setShowConfirmModal({ action: 'coleta' })}
            className="btn btn-primary"
          >
            Confirmar Coleta
          </button>
        </div>
      )}

      {canUpdate && devolucao.status === DevolucaoStatus.DEVOLUCAO_COLETADA && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Etapa: Confirmar Recebimento
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Confirme que a mercadoria foi recebida de volta.
          </p>
          <button
            onClick={() => setShowConfirmModal({ action: 'recebimento' })}
            className="btn btn-primary"
          >
            Confirmar Recebimento
          </button>
        </div>
      )}

      {canUpdate && devolucao.status === DevolucaoStatus.DEVOLUCAO_RECEBIDA && (
        <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Última Etapa: Confirmar Compensação Fiscal
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Confirme que a compensação fiscal foi realizada. Isso finalizará o processo.
          </p>
          <button
            onClick={() => setShowConfirmModal({ action: 'compensacao' })}
            className="btn btn-success"
          >
            Confirmar Compensação Fiscal
          </button>
        </div>
      )}

      {devolucao.status === DevolucaoStatus.FINALIZADO && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Devolução Finalizada
              </h3>
              <p className="text-gray-700">
                O processo de devolução foi concluído com sucesso.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dados da Solicitação
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">AR Origem:</span>{' '}
              <span className="font-medium">{devolucao.arOrigem}</span>
            </div>
            <div>
              <span className="text-gray-600">Quantidade Total:</span>{' '}
              <span className="font-medium">{devolucao.quantidadeTotal}</span>
            </div>
            <div>
              <span className="text-gray-600">Peso (Kg):</span>{' '}
              <span className="font-medium">{devolucao.pesoKg}</span>
            </div>
            <div>
              <span className="text-gray-600">Transportadora:</span>{' '}
              <span className="font-medium">{devolucao.transportadora}</span>
            </div>
            <div>
              <span className="text-gray-600">Frete:</span>{' '}
              <span className="font-medium">{devolucao.frete}</span>
            </div>
            <div>
              <span className="text-gray-600">Meio de Compensação:</span>{' '}
              <span className="font-medium">{devolucao.meioCompensacao}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dados da RNC Origem
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Número RNC:</span>{' '}
              <button
                onClick={() => navigate(`/rnc/${devolucao.rncId}`)}
                className="font-medium text-sky-600 hover:text-sky-800"
              >
                {devolucao.rnc?.numero}
              </button>
            </div>
            <div>
              <span className="text-gray-600">Fornecedor:</span>{' '}
              <span className="font-medium">
                {devolucao.rnc?.fornecedor?.razaoSocial}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Motivo:</span>
              <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                {devolucao.motivo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {(devolucao.nfeNumero || devolucao.dataColeta || devolucao.dataRecebimento || devolucao.dataCompensacao) && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Rastreamento e Datas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {devolucao.nfeNumero && (
              <>
                <div>
                  <span className="text-gray-600">Número NF-e:</span>{' '}
                  <span className="font-medium">{devolucao.nfeNumero}</span>
                </div>
                <div>
                  <span className="text-gray-600">NF-e Emitida em:</span>{' '}
                  <span className="font-medium">
                    {devolucao.nfeEmitidaEm && new Date(devolucao.nfeEmitidaEm).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Emitida por:</span>{' '}
                  <span className="font-medium">{devolucao.nfeEmitidaPor?.nome}</span>
                </div>
              </>
            )}
            {devolucao.dataColeta && (
              <>
                <div>
                  <span className="text-gray-600">Data de Coleta:</span>{' '}
                  <span className="font-medium">
                    {new Date(devolucao.dataColeta).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Confirmada por:</span>{' '}
                  <span className="font-medium">{devolucao.coletaConfirmadaPor?.nome}</span>
                </div>
              </>
            )}
            {devolucao.dataRecebimento && (
              <>
                <div>
                  <span className="text-gray-600">Data de Recebimento:</span>{' '}
                  <span className="font-medium">
                    {new Date(devolucao.dataRecebimento).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Confirmado por:</span>{' '}
                  <span className="font-medium">{devolucao.recebimentoConfirmadoPor?.nome}</span>
                </div>
              </>
            )}
            {devolucao.dataCompensacao && (
              <>
                <div>
                  <span className="text-gray-600">Data de Compensação:</span>{' '}
                  <span className="font-medium">
                    {new Date(devolucao.dataCompensacao).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Confirmado por:</span>{' '}
                  <span className="font-medium">{devolucao.compensacaoConfirmadaPor?.nome}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modals - To be implemented in separate component files */}
      {showConfirmModal.action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {showConfirmModal.action === 'coleta' && 'Confirmar Coleta'}
              {showConfirmModal.action === 'recebimento' && 'Confirmar Recebimento'}
              {showConfirmModal.action === 'compensacao' && 'Confirmar Compensação Fiscal'}
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja confirmar esta ação? Esta operação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal({ action: null })}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (showConfirmModal.action === 'coleta') handleConfirmarColeta();
                  if (showConfirmModal.action === 'recebimento') handleConfirmarRecebimento();
                  if (showConfirmModal.action === 'compensacao') handleConfirmarCompensacao();
                }}
                className="btn btn-primary"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <EmitirNfeModal
        isOpen={showEmitirNfeModal}
        onClose={() => setShowEmitirNfeModal(false)}
        onSubmit={handleEmitirNfe}
        devolucaoId={devolucao.id}
      />
    </div>
  );
}
