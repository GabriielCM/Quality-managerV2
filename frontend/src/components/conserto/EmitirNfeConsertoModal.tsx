import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface EmitirNfeConsertoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nfeNumero: string, file: File) => Promise<void>;
  consertoId: string;
}

export default function EmitirNfeConsertoModal({
  isOpen,
  onClose,
  onSubmit,
}: EmitirNfeConsertoModalProps) {
  const [nfeNumero, setNfeNumero] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (selectedFile.type !== 'application/pdf') {
        setError('Apenas arquivos PDF são permitidos');
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
      setError('Selecione um arquivo PDF da NF-e');
      return;
    }

    if (!nfeNumero.trim()) {
      setError('Informe o número da NF-e');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(nfeNumero, file);
      // Reset form
      setNfeNumero('');
      setFile(null);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao emitir NF-e');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNfeNumero('');
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
            Emitir NF-e de Envio
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
            <label htmlFor="nfeNumero" className="label">
              Número da NF-e <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nfeNumero"
              value={nfeNumero}
              onChange={(e) => setNfeNumero(e.target.value)}
              className="input"
              placeholder="Ex: 123456"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label htmlFor="nfePdf" className="label">
              Arquivo PDF da NF-e <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <label className="flex-1 cursor-pointer">
                <div className="input flex items-center justify-between">
                  <span className={file ? 'text-gray-900' : 'text-gray-500'}>
                    {file ? file.name : 'Selecione um arquivo PDF'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="nfePdf"
                  type="file"
                  accept="application/pdf"
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
              Ao emitir a NF-e, o status do conserto será alterado para{' '}
              <strong>"NF-e Emitida"</strong>. A próxima etapa será confirmar a
              coleta do material.
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
              disabled={isSubmitting || !file || !nfeNumero}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Emitindo...' : 'Emitir NF-e'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
