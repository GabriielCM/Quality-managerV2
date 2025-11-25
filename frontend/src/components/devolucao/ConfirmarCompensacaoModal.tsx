import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface ConfirmarCompensacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  devolucaoId: string;
}

export default function ConfirmarCompensacaoModal({
  isOpen,
  onClose,
  onSubmit,
}: ConfirmarCompensacaoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type (PDF or images)
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Apenas arquivos PDF ou imagens (JPG, PNG) são permitidos');
        setFile(null);
        return;
      }
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('Arquivo deve ter no máximo 10MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Selecione um arquivo PDF ou imagem do comprovante');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(file);
      // Reset form
      setFile(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao confirmar compensação');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Confirmar Compensação Fiscal
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="comprovante" className="label">
              Comprovante (PDF ou Imagem) <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <label className="flex-1 cursor-pointer">
                <div className="input flex items-center justify-between">
                  <span className={file ? 'text-gray-900' : 'text-gray-500'}>
                    {file ? file.name : 'Selecione um arquivo'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="comprovante"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
              </label>
              {file && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setError('');
                  }}
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-sm text-blue-800">
              Ao confirmar a compensação fiscal, o status da devolução será alterado
              para <strong>"Finalizado"</strong>. Esta ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="btn btn-success"
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Compensação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
