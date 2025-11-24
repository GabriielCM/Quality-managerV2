import { useState } from 'react';
import { X, Upload, XCircle } from 'lucide-react';

interface RecusarPlanoAcaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, justificativa: string) => Promise<void>;
  rncNumero: string;
}

export function RecusarPlanoAcaoModal({
  isOpen,
  onClose,
  onSubmit,
  rncNumero,
}: RecusarPlanoAcaoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar se é PDF
      if (selectedFile.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos');
        return;
      }
      // Validar tamanho (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Arquivo deve ter no máximo 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Selecione um arquivo PDF');
      return;
    }

    if (!justificativa.trim()) {
      setError('A justificativa é obrigatória');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(file, justificativa);
      onClose();
      setFile(null);
      setJustificativa('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao recusar plano de ação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFile(null);
      setJustificativa('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            Recusar Plano de Ação
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Você está recusando o plano de ação para a RNC{' '}
                <span className="font-semibold">{rncNumero}</span>.
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                <p className="text-sm text-yellow-800">
                  Após recusar, o status da RNC permanecerá como{' '}
                  <span className="font-semibold">RNC enviada</span> e um novo
                  prazo de 7 dias será iniciado.
                </p>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF do Plano de Ação <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-red-500 transition-colors"
                >
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {file ? (
                        <span className="text-red-600 font-medium">
                          {file.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-blue-600 font-medium">
                            Selecione um arquivo
                          </span>{' '}
                          ou arraste aqui
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">PDF até 10MB</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>

            {/* Justificativa */}
            <div>
              <label
                htmlFor="justificativa"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Justificativa da Recusa <span className="text-red-500">*</span>
              </label>
              <textarea
                id="justificativa"
                rows={5}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                disabled={isSubmitting}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Descreva os motivos da recusa do plano de ação..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {justificativa.length} caracteres
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg sticky bottom-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file || !justificativa.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Recusando...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Recusar Plano de Ação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
