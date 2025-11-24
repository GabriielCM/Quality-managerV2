import { useState } from 'react';
import { X, Upload, CheckCircle2 } from 'lucide-react';

interface AceitarPlanoAcaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  rncNumero: string;
}

export function AceitarPlanoAcaoModal({
  isOpen,
  onClose,
  onSubmit,
  rncNumero,
}: AceitarPlanoAcaoModalProps) {
  const [file, setFile] = useState<File | null>(null);
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

    try {
      setIsSubmitting(true);
      await onSubmit(file);
      onClose();
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao aceitar plano de ação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFile(null);
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Aceitar Plano de Ação
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
                Você está aceitando o plano de ação para a RNC{' '}
                <span className="font-semibold">{rncNumero}</span>.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Após aceitar, o status da RNC será alterado para{' '}
                <span className="font-semibold text-green-600">
                  RNC aceita
                </span>
                .
              </p>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF do Plano de Ação <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-green-500 transition-colors"
                >
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {file ? (
                        <span className="text-green-600 font-medium">
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
                    <p className="text-xs text-gray-500">
                      PDF até 10MB
                    </p>
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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
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
              disabled={isSubmitting || !file}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Aceitando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Aceitar Plano de Ação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
