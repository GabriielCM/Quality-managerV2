import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { rncApi } from '@/services/api/rnc';
import { Rnc, RncHistorico } from '@/types/rnc';
import { AceitarPlanoAcaoModal } from '@/components/rnc/AceitarPlanoAcaoModal';
import { RecusarPlanoAcaoModal } from '@/components/rnc/RecusarPlanoAcaoModal';

export default function RncViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();
  const [rnc, setRnc] = useState<Rnc | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historico, setHistorico] = useState<RncHistorico[]>([]);
  const [isLoadingHistorico, setIsLoadingHistorico] = useState(false);
  const [isAceitarModalOpen, setIsAceitarModalOpen] = useState(false);
  const [isRecusarModalOpen, setIsRecusarModalOpen] = useState(false);

  const canRead = hasPermission('rnc.read');
  const canUpdate = hasPermission('rnc.update');

  useEffect(() => {
    if (id) {
      loadRnc(id);
    }
  }, [id]);

  const loadRnc = async (rncId: string) => {
    try {
      setIsLoading(true);
      const data = await rncApi.findOne(rncId);
      setRnc(data);
      loadHistorico(rncId);
    } catch (error: any) {
      toast.error('Erro ao carregar RNC');
      navigate('/rnc');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistorico = async (rncId: string) => {
    try {
      setIsLoadingHistorico(true);
      const data = await rncApi.getHistorico(rncId);
      setHistorico(data);
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoadingHistorico(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!rnc) return;

    try {
      const blob = await rncApi.downloadPdf(rnc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${rnc.numero.replace(/[:\/]/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF baixado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao baixar PDF');
    }
  };

  const handleDownloadPlanoAcaoPdf = async () => {
    if (!rnc) return;

    try {
      const blob = await rncApi.downloadPlanoAcaoPdf(rnc.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plano-acao-${rnc.numero.replace(/[:\/]/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF do plano de ação baixado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao baixar PDF do plano de ação');
    }
  };

  const handleDownloadHistoricoPdf = async (
    historicoId: string,
    tipo: string,
    data: string,
  ) => {
    try {
      const blob = await rncApi.downloadHistoricoPdf(historicoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const tipoTexto = tipo === 'ACEITE' ? 'aceito' : 'recusado';
      const dataFormatada = new Date(data).toISOString().split('T')[0];
      link.download = `plano-acao-${tipoTexto}-${dataFormatada}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF do histórico baixado com sucesso');
    } catch (error: any) {
      toast.error('Erro ao baixar PDF do histórico');
    }
  };

  const handleAceitarPlanoAcao = async (file: File) => {
    if (!rnc) return;

    try {
      const updatedRnc = await rncApi.aceitarPlanoAcao(rnc.id, file);
      setRnc(updatedRnc);
      loadHistorico(rnc.id);
      toast.success('Plano de ação aceito com sucesso!');
    } catch (error: any) {
      throw error;
    }
  };

  const handleRecusarPlanoAcao = async (file: File, justificativa: string) => {
    if (!rnc) return;

    try {
      const updatedRnc = await rncApi.recusarPlanoAcao(rnc.id, file, justificativa);
      setRnc(updatedRnc);
      loadHistorico(rnc.id);
      toast.success('Plano de ação recusado. Novo prazo de 7 dias iniciado.');
    } catch (error: any) {
      throw error;
    }
  };

  const calcularDiasRestantes = (prazoInicio: string | null): number => {
    if (!prazoInicio) return 0;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicio = new Date(prazoInicio);
    inicio.setHours(0, 0, 0, 0);

    const prazoFim = new Date(inicio);
    prazoFim.setDate(prazoFim.getDate() + 7);

    const diffTime = prazoFim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RNC enviada':
        return 'bg-blue-100 text-blue-800';
      case 'Aguardando resposta':
        return 'bg-yellow-100 text-yellow-800';
      case 'Em análise':
        return 'bg-orange-100 text-orange-800';
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      case 'RNC aceita':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!canRead) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Você não tem permissão para visualizar RNCs.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando RNC...</p>
        </div>
      </div>
    );
  }

  if (!rnc) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{rnc.numero}</h1>
          <p className="text-gray-600 mt-2">Relatório de Não Conformidade</p>
        </div>
        <div className="flex space-x-3">
          {rnc.planoAcaoPdfPath && (
            <button
              onClick={handleDownloadPlanoAcaoPdf}
              className="btn btn-success flex items-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>Plano de Ação</span>
            </button>
          )}
          {rnc.pdfPath && (
            <button
              onClick={handleDownloadPdf}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download PDF</span>
            </button>
          )}
          <button
            onClick={() => navigate('/rnc')}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      {/* Botões de Ação do Plano de Ação */}
      {rnc.status === 'RNC enviada' && canUpdate && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Clock className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Aguardando Resposta do Plano de Ação
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {calcularDiasRestantes(rnc.prazoInicio)} dias restantes do prazo de 7 dias
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsRecusarModalOpen(true)}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>Recusar</span>
              </button>
              <button
                onClick={() => setIsAceitarModalOpen(true)}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Aceitar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status e Reincidência */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                rnc.status,
              )}`}
            >
              {rnc.status}
            </span>
          </div>
          {rnc.reincidente && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-semibold">REINCIDENTE</span>
            </div>
          )}
        </div>
      </div>

      {/* Dados da RNC */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dados da RNC
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <p className="text-gray-900">
              {new Date(rnc.data).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Criado por
            </label>
            <p className="text-gray-900">{rnc.criadoPor?.nome || 'N/A'}</p>
            <p className="text-sm text-gray-500">{rnc.criadoPor?.email}</p>
          </div>
        </div>
      </div>

      {/* Dados do Fornecedor */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Dados do Fornecedor
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social
            </label>
            <p className="text-gray-900">
              {rnc.fornecedor?.razaoSocial || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <p className="text-gray-900">
              {rnc.fornecedor?.cnpj.replace(
                /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                '$1.$2.$3/$4-$5',
              ) || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Logix
            </label>
            <p className="text-gray-900">
              {rnc.fornecedor?.codigoLogix || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Dados da INC Original */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Dados da INC Original
          </h2>
          <Link
            to={`/inc/${rnc.incId}`}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            Ver INC completa
            <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AR
            </label>
            <p className="text-gray-900">{rnc.ar}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NF-e
            </label>
            <p className="text-gray-900">{rnc.nfeNumero}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade de Medida
            </label>
            <p className="text-gray-900">{rnc.um}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade Recebida
            </label>
            <p className="text-gray-900">{rnc.quantidadeRecebida}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade com Defeito
            </label>
            <p className="text-gray-900">{rnc.quantidadeComDefeito}</p>
          </div>
        </div>
      </div>

      {/* Descrição da Não Conformidade */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Descrição da Não Conformidade
        </h2>
        <div className="prose max-w-none">
          <p className="text-gray-900 whitespace-pre-wrap">
            {rnc.descricaoNaoConformidade || 'Não informada'}
          </p>
        </div>
      </div>

      {/* Reincidência */}
      {rnc.reincidente && rnc.rncAnterior && (
        <div className="bg-red-50 border border-red-200 shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-red-900">
              Informações de Reincidência
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">
                RNC Anterior
              </label>
              <Link
                to={`/rnc/${rnc.rncAnterior.id}`}
                className="text-red-900 hover:text-red-700 font-medium flex items-center"
              >
                {rnc.rncAnterior.numero}
                <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1">
                Data da RNC Anterior
              </label>
              <p className="text-red-900">
                {new Date(rnc.rncAnterior.data).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RNCs Filhas (se esta RNC gerou reincidências) */}
      {rnc.rncsFilhas && rnc.rncsFilhas.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            RNCs Reincidentes Relacionadas
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Esta RNC foi marcada como anterior nas seguintes reincidências:
          </p>
          <div className="space-y-2">
            {rnc.rncsFilhas.map((rncFilha) => (
              <div
                key={rncFilha.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <Link
                    to={`/rnc/${rncFilha.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {rncFilha.numero}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {new Date(rncFilha.data).toLocaleDateString('pt-BR')} - {rncFilha.status}
                  </p>
                </div>
                <Link
                  to={`/rnc/${rncFilha.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Aceites e Recusas */}
      {historico.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Histórico do Plano de Ação
          </h2>
          {isLoadingHistorico ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 ${
                    item.tipo === 'ACEITE'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        {item.tipo === 'ACEITE' ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`font-semibold ${
                              item.tipo === 'ACEITE'
                                ? 'text-green-900'
                                : 'text-red-900'
                            }`}
                          >
                            {item.tipo === 'ACEITE'
                              ? 'Plano de Ação Aceito'
                              : 'Plano de Ação Recusado'}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(item.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Por: {item.criadoPor?.nome || 'N/A'}
                        </p>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>
                            <span className="font-medium">Prazo:</span>{' '}
                            {new Date(item.prazoInicio).toLocaleDateString('pt-BR')} -{' '}
                            {new Date(item.prazoFim).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {item.justificativa && (
                          <div className="mt-3 p-3 bg-white rounded border border-red-200">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Justificativa:
                            </p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">
                              {item.justificativa}
                            </p>
                          </div>
                        )}
                        {item.pdfPath && (
                          <div className="mt-3">
                            <button
                              onClick={() =>
                                handleDownloadHistoricoPdf(
                                  item.id,
                                  item.tipo,
                                  item.data,
                                )
                              }
                              className={`btn btn-sm flex items-center space-x-2 ${
                                item.tipo === 'ACEITE'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              <Download className="w-4 h-4" />
                              <span>Baixar PDF Anexado</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fotos da INC (se houver) */}
      {rnc.inc?.fotos && rnc.inc.fotos.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Fotos da INC Original
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rnc.inc.fotos.map((foto) => (
              <a
                key={foto.id}
                href={`/uploads/${foto.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={`/uploads/${foto.path}`}
                  alt={foto.filename}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <AceitarPlanoAcaoModal
        isOpen={isAceitarModalOpen}
        onClose={() => setIsAceitarModalOpen(false)}
        onSubmit={handleAceitarPlanoAcao}
        rncNumero={rnc.numero}
      />
      <RecusarPlanoAcaoModal
        isOpen={isRecusarModalOpen}
        onClose={() => setIsRecusarModalOpen(false)}
        onSubmit={handleRecusarPlanoAcao}
        rncNumero={rnc.numero}
      />
    </div>
  );
}
