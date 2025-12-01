import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Package,
  CheckCircle2,
  XCircle,
  Trash2,
  Wrench,
  TruckIcon,
  Clock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { consertoApi } from '@/services/api/conserto';
import { Conserto, ConsertoStatus } from '@/types/conserto';
import { useAuthStore } from '@/stores/authStore';
import EmitirNfeConsertoModal from '@/components/conserto/EmitirNfeConsertoModal';
import ConfirmarRetornoModal from '@/components/conserto/ConfirmarRetornoModal';
import AprovarInspecaoModal from '@/components/conserto/AprovarInspecaoModal';
import RejeitarInspecaoModal from '@/components/conserto/RejeitarInspecaoModal';

export default function ConsertoViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission, hasAnyPermission } = useAuthStore();

  const [conserto, setConserto] = useState<Conserto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    action: 'coleta' | 'recebimento' | null;
  }>({ action: null });

  // Placeholder modals - will be implemented as separate components
  const [showEmitirNfeModal, setShowEmitirNfeModal] = useState(false);
  const [showConfirmarRetornoModal, setShowConfirmarRetornoModal] = useState(false);
  const [showAprovarInspecaoModal, setShowAprovarInspecaoModal] = useState(false);
  const [showRejeitarInspecaoModal, setShowRejeitarInspecaoModal] = useState(false);

  const canEmitirNfe = hasAnyPermission(['conserto.emitir_nfe', 'admin.all']);
  const canConfirmarColeta = hasAnyPermission(['conserto.confirmar_coleta', 'admin.all']);
  const canConfirmarRecebimento = hasAnyPermission(['conserto.confirmar_recebimento', 'admin.all']);
  const canConfirmarRetorno = hasAnyPermission(['conserto.confirmar_retorno', 'admin.all']);
  const canAprovarInspecao = hasAnyPermission(['conserto.aprovar_inspecao', 'admin.all']);
  const canRejeitarInspecao = hasAnyPermission(['conserto.rejeitar_inspecao', 'admin.all']);
  const isAdmin = hasPermission('admin.all');

  useEffect(() => {
    if (id) {
      loadConserto(id);
    }
  }, [id]);

  const loadConserto = async (consertoId: string) => {
    try {
      setIsLoading(true);
      const data = await consertoApi.findOne(consertoId);
      setConserto(data);
    } catch (error: any) {
      toast.error('Erro ao carregar conserto');
      navigate('/conserto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async (type: 'nfe' | 'nfe-retorno') => {
    if (!conserto) return;
    try {
      const blob =
        type === 'nfe'
          ? await consertoApi.downloadNfePdf(conserto.id)
          : await consertoApi.downloadNfeRetornoPdf(conserto.id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        type === 'nfe'
          ? `nfe-conserto-${conserto.rnc?.numero}.pdf`
          : `nfe-retorno-${conserto.rnc?.numero}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download concluído');
    } catch (error) {
      toast.error('Erro ao baixar PDF');
    }
  };

  const handleConfirmarColeta = async () => {
    if (!conserto) return;
    try {
      await consertoApi.confirmarColeta(conserto.id);
      toast.success('Coleta confirmada com sucesso');
      loadConserto(conserto.id);
      setShowConfirmModal({ action: null });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar coleta');
    }
  };

  const handleConfirmarRecebimento = async () => {
    if (!conserto) return;
    try {
      await consertoApi.confirmarRecebimento(conserto.id);
      toast.success('Recebimento confirmado com sucesso. Prazo de 30 dias iniciado.');
      loadConserto(conserto.id);
      setShowConfirmModal({ action: null });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao confirmar recebimento');
    }
  };

  const handleDelete = async () => {
    if (!conserto) return;
    try {
      await consertoApi.remove(conserto.id);
      toast.success('Conserto excluído com sucesso');
      navigate('/conserto');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao excluir conserto');
    }
  };

  const handleEmitirNfe = async (nfeNumero: string, file: File) => {
    if (!conserto) return;
    await consertoApi.emitirNfe(conserto.id, nfeNumero, file);
    toast.success('NF-e emitida com sucesso');
    loadConserto(conserto.id);
  };

  const handleConfirmarRetorno = async (nfeRetornoNumero: string, file: File) => {
    if (!conserto) return;
    await consertoApi.confirmarRetorno(conserto.id, nfeRetornoNumero, file);
    toast.success('Retorno confirmado com sucesso');
    loadConserto(conserto.id);
  };

  const handleAprovarInspecao = async (fotos: File[], descricao?: string) => {
    if (!conserto) return;
    await consertoApi.aprovarInspecao(conserto.id, fotos, descricao);
    toast.success('Inspeção aprovada com sucesso');
    loadConserto(conserto.id);
  };

  const handleRejeitarInspecao = async (fotos: File[], descricao: string) => {
    if (!conserto) return;
    await consertoApi.rejeitarInspecao(conserto.id, fotos, descricao);
    toast.success('Inspeção rejeitada');
    loadConserto(conserto.id);
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
    const labels = {
      [ConsertoStatus.RNC_ACEITA]: 'RNC Aceita',
      [ConsertoStatus.CONSERTO_SOLICITADA]: 'Conserto Solicitado',
      [ConsertoStatus.NFE_EMITIDA]: 'NF-e Emitida',
      [ConsertoStatus.CONSERTO_COLETADO]: 'Material Coletado',
      [ConsertoStatus.CONSERTO_RECEBIDO]: 'Material Recebido',
      [ConsertoStatus.MATERIAL_RETORNADO]: 'Material Retornado',
      [ConsertoStatus.FINALIZADO]: 'Finalizado',
      [ConsertoStatus.REJEITADO]: 'Rejeitado',
    };
    return labels[status] || status;
  };

  const isPrazoVencido = () => {
    if (!conserto?.prazoConsertoFim) return false;
    return new Date() > new Date(conserto.prazoConsertoFim);
  };

  const getDiasRestantes = () => {
    if (!conserto?.prazoConsertoFim) return null;
    const hoje = new Date();
    const fim = new Date(conserto.prazoConsertoFim);
    const diff = fim.getTime() - hoje.getTime();
    const dias = Math.ceil(diff / (1000 * 3600 * 24));
    return dias;
  };

  if (!hasPermission('conserto.read')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Você não tem permissão para visualizar consertos.
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

  if (!conserto) {
    return <div>Conserto não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/conserto')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Conserto - RNC {conserto.rnc?.numero}
            </h1>
            <p className="text-gray-600 mt-1">
              Visualização completa do conserto
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-danger flex items-center space-x-2"
            title="Excluir conserto (apenas admin)"
          >
            <Trash2 className="w-5 h-5" />
            <span>Excluir</span>
          </button>
        )}
      </div>

      {/* Status Badge */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <span
            className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
              conserto.status,
            )}`}
          >
            {getStatusLabel(conserto.status)}
          </span>
          {conserto.consertoEmGarantia && (
            <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
              Em Garantia
            </span>
          )}
        </div>

        {/* Prazo Display */}
        {conserto.prazoConsertoInicio && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  Prazo para Conserto: 30 dias
                </h3>
                <div className="text-sm text-gray-700 mt-1">
                  <span>Início: {new Date(conserto.prazoConsertoInicio).toLocaleDateString('pt-BR')}</span>
                  {' • '}
                  <span>Fim: {new Date(conserto.prazoConsertoFim!).toLocaleDateString('pt-BR')}</span>
                </div>
                {getDiasRestantes() !== null && (
                  <div className="mt-2">
                    {isPrazoVencido() ? (
                      <span className="text-red-600 font-semibold">
                        ⚠️ Prazo vencido há {Math.abs(getDiasRestantes()!)} dia(s)
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        ✓ Restam {getDiasRestantes()} dia(s)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Action Panels */}
      {canEmitirNfe && conserto.status === ConsertoStatus.CONSERTO_SOLICITADA && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Etapa: Emitir NF-e
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Registre o número da NF-e de envio para conserto e faça upload do PDF.
          </p>
          <button
            onClick={() => setShowEmitirNfeModal(true)}
            className="btn btn-primary"
          >
            Emitir NF-e
          </button>
        </div>
      )}

      {canConfirmarColeta && conserto.status === ConsertoStatus.NFE_EMITIDA && (
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="w-6 h-6 text-cyan-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Etapa: Confirmar Coleta
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Confirme que o material foi coletado pela transportadora.
          </p>
          <button
            onClick={() => setShowConfirmModal({ action: 'coleta' })}
            className="btn btn-primary"
          >
            Confirmar Coleta
          </button>
        </div>
      )}

      {canConfirmarRecebimento && conserto.status === ConsertoStatus.CONSERTO_COLETADO && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Etapa: Confirmar Recebimento pelo Fornecedor
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Confirme que o material foi recebido pelo fornecedor. Isso iniciará o prazo de 30 dias para conserto.
          </p>
          <button
            onClick={() => setShowConfirmModal({ action: 'recebimento' })}
            className="btn btn-primary"
          >
            Confirmar Recebimento
          </button>
        </div>
      )}

      {canConfirmarRetorno && conserto.status === ConsertoStatus.CONSERTO_RECEBIDO && (
        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TruckIcon className="w-6 h-6 text-cyan-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Próxima Etapa: Confirmar Retorno do Material
            </h3>
          </div>
          <p className="text-gray-700 mb-4">
            Registre o número da NF-e de retorno e faça upload do PDF.
          </p>
          <button
            onClick={() => setShowConfirmarRetornoModal(true)}
            className="btn btn-primary"
          >
            Confirmar Retorno
          </button>
        </div>
      )}

      {(canAprovarInspecao || canRejeitarInspecao) &&
        conserto.status === ConsertoStatus.MATERIAL_RETORNADO && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Wrench className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Última Etapa: Inspeção de Retorno
              </h3>
            </div>
            <p className="text-gray-700 mb-4">
              Realize a inspeção do material consertado. Aprove se o conserto está conforme
              ou rejeite caso contrário.
            </p>
            <div className="flex space-x-3">
              {canAprovarInspecao && (
                <button
                  onClick={() => setShowAprovarInspecaoModal(true)}
                  className="btn btn-success flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Aprovar Inspeção</span>
                </button>
              )}
              {canRejeitarInspecao && (
                <button
                  onClick={() => setShowRejeitarInspecaoModal(true)}
                  className="btn btn-danger flex items-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Rejeitar Inspeção</span>
                </button>
              )}
            </div>
          </div>
        )}

      {conserto.status === ConsertoStatus.FINALIZADO && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Conserto Finalizado com Sucesso
              </h3>
              <p className="text-gray-700">
                O material foi consertado e aprovado na inspeção.
              </p>
            </div>
          </div>
        </div>
      )}

      {conserto.status === ConsertoStatus.REJEITADO && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Conserto Rejeitado
              </h3>
              <p className="text-gray-700">
                O material foi rejeitado na inspeção de retorno.
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
              <span className="font-medium">{conserto.arOrigem}</span>
            </div>
            <div>
              <span className="text-gray-600">Quantidade Total:</span>{' '}
              <span className="font-medium">{conserto.quantidadeTotal}</span>
            </div>
            <div>
              <span className="text-gray-600">Peso (Kg):</span>{' '}
              <span className="font-medium">{conserto.pesoKg}</span>
            </div>
            <div>
              <span className="text-gray-600">Transportadora:</span>{' '}
              <span className="font-medium">{conserto.transportadora || 'CIF'}</span>
            </div>
            <div>
              <span className="text-gray-600">Frete:</span>{' '}
              <span className="font-medium">{conserto.frete}</span>
            </div>
            <div>
              <span className="text-gray-600">Conserto em Garantia:</span>{' '}
              <span className="font-medium">
                {conserto.consertoEmGarantia ? (
                  <span className="text-green-600">Sim</span>
                ) : (
                  <span className="text-gray-500">Não</span>
                )}
              </span>
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
                onClick={() => navigate(`/rnc/${conserto.rncId}`)}
                className="font-medium text-sky-600 hover:text-sky-800"
              >
                {conserto.rnc?.numero}
              </button>
            </div>
            <div>
              <span className="text-gray-600">Fornecedor:</span>{' '}
              <span className="font-medium">
                {conserto.rnc?.fornecedor?.razaoSocial}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Motivo:</span>
              <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                {conserto.motivo}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rastreamento e Datas - Seções Separadas por Etapa */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Rastreamento e Datas</h2>

        {/* Etapa 1: Solicitação */}
        <div className="card border-l-4 border-blue-500">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Etapa 1: Solicitação de Conserto
            </h3>
          </div>
          <div className="space-y-2 ml-11">
            <div>
              <span className="text-gray-600">Criada em:</span>{' '}
              <span className="font-medium">
                {new Date(conserto.createdAt).toLocaleString('pt-BR')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Criada por:</span>{' '}
              <span className="font-medium">{conserto.criadoPor?.nome}</span>
            </div>
          </div>
        </div>

        {/* Etapa 2: Emissão de NF-e */}
        {conserto.nfeNumero && (
          <div className="card border-l-4 border-indigo-500">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-indigo-100 p-2 rounded-full">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Etapa 2: Emissão de NF-e de Envio
              </h3>
            </div>
            <div className="space-y-2 ml-11">
              <div>
                <span className="text-gray-600">Número NF-e:</span>{' '}
                <span className="font-medium">{conserto.nfeNumero}</span>
              </div>
              <div>
                <span className="text-gray-600">Emitida em:</span>{' '}
                <span className="font-medium">
                  {conserto.nfeEmitidaEm &&
                    new Date(conserto.nfeEmitidaEm).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Emitida por:</span>{' '}
                <span className="font-medium">{conserto.nfeEmitidaPor?.nome}</span>
              </div>
              {conserto.nfePdfPath && (
                <div className="mt-3">
                  <button
                    onClick={() => handleDownloadPdf('nfe')}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar PDF da NF-e de Envio</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Etapa 3a: Coleta */}
        {conserto.dataColeta && (
          <div className="card border-l-4 border-cyan-500">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-cyan-100 p-2 rounded-full">
                <Package className="w-5 h-5 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Etapa 3a: Coleta do Material
              </h3>
            </div>
            <div className="space-y-2 ml-11">
              <div>
                <span className="text-gray-600">Coletada em:</span>{' '}
                <span className="font-medium">
                  {new Date(conserto.dataColeta).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Confirmada por:</span>{' '}
                <span className="font-medium">
                  {conserto.coletaConfirmadaPor?.nome}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 3b: Recebimento */}
        {conserto.dataRecebimento && (
          <div className="card border-l-4 border-orange-500">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Etapa 3b: Recebimento pelo Fornecedor
              </h3>
            </div>
            <div className="space-y-2 ml-11">
              <div>
                <span className="text-gray-600">Recebido em:</span>{' '}
                <span className="font-medium">
                  {new Date(conserto.dataRecebimento).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Confirmado por:</span>{' '}
                <span className="font-medium">
                  {conserto.recebimentoConfirmadoPor?.nome}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 3c: Retorno */}
        {conserto.dataRetorno && (
          <div className="card border-l-4 border-teal-500">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-teal-100 p-2 rounded-full">
                <TruckIcon className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Etapa 3c: Retorno do Material
              </h3>
            </div>
            <div className="space-y-2 ml-11">
              <div>
                <span className="text-gray-600">Número NF-e Retorno:</span>{' '}
                <span className="font-medium">{conserto.nfeRetornoNumero}</span>
              </div>
              <div>
                <span className="text-gray-600">Retornado em:</span>{' '}
                <span className="font-medium">
                  {new Date(conserto.dataRetorno).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Confirmado por:</span>{' '}
                <span className="font-medium">
                  {conserto.retornoConfirmadoPor?.nome}
                </span>
              </div>
              {conserto.nfeRetornoPdfPath && (
                <div className="mt-3">
                  <button
                    onClick={() => handleDownloadPdf('nfe-retorno')}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar PDF da NF-e de Retorno</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Etapa 4: Inspeção */}
        {conserto.inspecaoData && (
          <div
            className={`card border-l-4 ${
              conserto.inspecaoAprovada ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`p-2 rounded-full ${
                  conserto.inspecaoAprovada ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {conserto.inspecaoAprovada ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Etapa 4: Inspeção de Retorno -{' '}
                {conserto.inspecaoAprovada ? 'APROVADA' : 'REJEITADA'}
              </h3>
            </div>
            <div className="space-y-2 ml-11">
              <div>
                <span className="text-gray-600">Inspecionado em:</span>{' '}
                <span className="font-medium">
                  {new Date(conserto.inspecaoData).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Inspecionado por:</span>{' '}
                <span className="font-medium">
                  {conserto.inspecaoRealizadaPor?.nome}
                </span>
              </div>
              {conserto.inspecaoDescricao && (
                <div>
                  <span className="text-gray-600">Descrição:</span>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                    {conserto.inspecaoDescricao}
                  </p>
                </div>
              )}
              {conserto.inspecaoFotos && conserto.inspecaoFotos.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-600 block mb-2">
                    Fotos da Inspeção ({conserto.inspecaoFotos.length}):
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {conserto.inspecaoFotos.map((foto) => (
                      <div
                        key={foto.id}
                        className="relative aspect-square bg-gray-100 rounded overflow-hidden"
                      >
                        <img
                          src={`/api/conserto/${conserto.id}/inspecao-fotos/${foto.id}`}
                          alt="Foto inspeção"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                          onClick={() => {
                            // TODO: Open lightbox modal
                            window.open(
                              `/api/conserto/${conserto.id}/inspecao-fotos/${foto.id}`,
                              '_blank',
                            );
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {showConfirmModal.action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {showConfirmModal.action === 'coleta' && 'Confirmar Coleta'}
              {showConfirmModal.action === 'recebimento' &&
                'Confirmar Recebimento'}
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja confirmar esta ação? Esta operação não pode
              ser desfeita.
              {showConfirmModal.action === 'recebimento' && (
                <span className="block mt-2 text-orange-600 font-semibold">
                  Isso iniciará o prazo de 30 dias para conserto.
                </span>
              )}
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
                  if (showConfirmModal.action === 'coleta')
                    handleConfirmarColeta();
                  if (showConfirmModal.action === 'recebimento')
                    handleConfirmarRecebimento();
                }}
                className="btn btn-primary"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Excluir Conserto
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir este conserto? Esta ação não pode ser
              desfeita e todos os arquivos associados (NF-e e fotos) serão
              permanentemente removidos.
            </p>
            <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
              <p className="text-sm text-red-700">
                <strong>Atenção:</strong> A RNC associada não será afetada e
                poderá ser usada para criar um novo conserto.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
                className="btn btn-danger"
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Components */}
      <EmitirNfeConsertoModal
        isOpen={showEmitirNfeModal}
        onClose={() => setShowEmitirNfeModal(false)}
        onSubmit={handleEmitirNfe}
        consertoId={conserto?.id || ''}
      />

      <ConfirmarRetornoModal
        isOpen={showConfirmarRetornoModal}
        onClose={() => setShowConfirmarRetornoModal(false)}
        onSubmit={handleConfirmarRetorno}
        consertoId={conserto?.id || ''}
      />

      <AprovarInspecaoModal
        isOpen={showAprovarInspecaoModal}
        onClose={() => setShowAprovarInspecaoModal(false)}
        onSubmit={handleAprovarInspecao}
        consertoId={conserto?.id || ''}
      />

      <RejeitarInspecaoModal
        isOpen={showRejeitarInspecaoModal}
        onClose={() => setShowRejeitarInspecaoModal(false)}
        onSubmit={handleRejeitarInspecao}
        consertoId={conserto?.id || ''}
      />
    </div>
  );
}
