import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { devolucaoApi } from '@/services/api/devolucao';
import { rncApi } from '@/services/api/rnc';
import { Rnc } from '@/types/rnc';
import { MeioCompensacao } from '@/types/devolucao';
import { useAuthStore } from '@/stores/authStore';

export default function DevolucaoCreatePage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuthStore();

  const [rncsAceitas, setRncsAceitas] = useState<Rnc[]>([]);
  const [selectedRnc, setSelectedRnc] = useState<Rnc | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRncs, setIsLoadingRncs] = useState(true);

  const [formData, setFormData] = useState({
    rncId: '',
    quantidadeTotal: '',
    pesoKg: '',
    motivo: '',
    transportadora: '',
    frete: 'FOB',
    meioCompensacao: '' as MeioCompensacao | '',
  });

  useEffect(() => {
    loadRncsAceitas();
  }, []);

  const loadRncsAceitas = async () => {
    try {
      setIsLoadingRncs(true);
      const data = await rncApi.findAll({ status: 'RNC aceita' });
      setRncsAceitas(data);
    } catch (error) {
      toast.error('Erro ao carregar RNCs aceitas');
    } finally {
      setIsLoadingRncs(false);
    }
  };

  const handleRncChange = (rncId: string) => {
    const rnc = rncsAceitas.find((r) => r.id === rncId);
    setSelectedRnc(rnc || null);

    if (rnc) {
      setFormData({
        ...formData,
        rncId,
        quantidadeTotal: rnc.quantidadeRecebida.toString(),
        motivo: rnc.descricaoNaoConformidade,
      });
    } else {
      setFormData({
        rncId: '',
        quantidadeTotal: '',
        pesoKg: '',
        motivo: '',
        transportadora: '',
        frete: 'FOB',
        meioCompensacao: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.rncId) {
      toast.error('Selecione uma RNC');
      return;
    }

    if (!formData.quantidadeTotal || parseFloat(formData.quantidadeTotal) <= 0) {
      toast.error('Quantidade total deve ser maior que zero');
      return;
    }

    if (!formData.pesoKg || parseFloat(formData.pesoKg) <= 0) {
      toast.error('Peso deve ser maior que zero');
      return;
    }

    try {
      setIsLoading(true);
      await devolucaoApi.create({
        rncId: formData.rncId,
        quantidadeTotal: parseFloat(formData.quantidadeTotal),
        pesoKg: parseFloat(formData.pesoKg),
        motivo: formData.motivo,
        transportadora: formData.transportadora,
        frete: formData.frete,
        meioCompensacao: formData.meioCompensacao,
      });

      toast.success('Devolução criada com sucesso');
      navigate('/devolucao');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Erro ao criar devolução',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasPermission('devolucao.create')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Você não tem permissão para criar devoluções.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/devolucao')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nova Devolução</h1>
          <p className="text-gray-600 mt-1">
            Criar solicitação de devolução a partir de RNC aceita
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Etapa 1 - Solicitação de Faturamento
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="rncId" className="label">
                RNC Aceita <span className="text-red-500">*</span>
              </label>
              {isLoadingRncs ? (
                <div className="text-gray-500">Carregando RNCs...</div>
              ) : rncsAceitas.length === 0 ? (
                <div className="text-yellow-600 bg-yellow-50 border border-yellow-200 p-3 rounded">
                  Nenhuma RNC com status "RNC aceita" disponível para devolução.
                </div>
              ) : (
                <select
                  id="rncId"
                  value={formData.rncId}
                  onChange={(e) => handleRncChange(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Selecione uma RNC</option>
                  {rncsAceitas.map((rnc) => (
                    <option key={rnc.id} value={rnc.id}>
                      {rnc.numero} - {rnc.fornecedor?.razaoSocial} - AR {rnc.ar}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedRnc && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Dados da RNC Selecionada
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">AR Origem:</span>{' '}
                      <span className="font-medium">{selectedRnc.ar}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quantidade Recebida:</span>{' '}
                      <span className="font-medium">
                        {selectedRnc.quantidadeRecebida}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Fornecedor:</span>{' '}
                      <span className="font-medium">
                        {selectedRnc.fornecedor?.razaoSocial}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="quantidadeTotal" className="label">
                    Quantidade Total para Devolução <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantidadeTotal"
                    value={formData.quantidadeTotal}
                    onChange={(e) =>
                      setFormData({ ...formData, quantidadeTotal: e.target.value })
                    }
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="pesoKg" className="label">
                    Peso (Kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="pesoKg"
                    value={formData.pesoKg}
                    onChange={(e) =>
                      setFormData({ ...formData, pesoKg: e.target.value })
                    }
                    className="input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="motivo" className="label">
                    Motivo da Devolução <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) =>
                      setFormData({ ...formData, motivo: e.target.value })
                    }
                    className="input"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="transportadora" className="label">
                    Transportadora <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="transportadora"
                    value={formData.transportadora}
                    onChange={(e) =>
                      setFormData({ ...formData, transportadora: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    Tipo de Frete <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="frete"
                        value="FOB"
                        checked={formData.frete === 'FOB'}
                        onChange={(e) =>
                          setFormData({ ...formData, frete: e.target.value })
                        }
                        className="form-radio text-sky-500"
                      />
                      <span>FOB (Fornecedor paga)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="frete"
                        value="CIF"
                        checked={formData.frete === 'CIF'}
                        onChange={(e) =>
                          setFormData({ ...formData, frete: e.target.value })
                        }
                        className="form-radio text-sky-500"
                      />
                      <span>CIF (Cristofoli paga)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="meioCompensacao" className="label">
                    Meio de Compensação <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="meioCompensacao"
                    value={formData.meioCompensacao}
                    onChange={(e) =>
                      setFormData({ ...formData, meioCompensacao: e.target.value as MeioCompensacao })
                    }
                    className="input"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value={MeioCompensacao.TRANSFERENCIA_DIRETA}>
                      Transferência Direta
                    </option>
                    <option value={MeioCompensacao.COMPENSACAO_PAGAMENTOS_FUTUROS}>
                      Compensação em Pagamentos Futuros
                    </option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/devolucao')}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !selectedRnc}
          >
            {isLoading ? 'Criando...' : 'Criar Devolução'}
          </button>
        </div>
      </form>
    </div>
  );
}
