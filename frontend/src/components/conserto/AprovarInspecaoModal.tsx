import { useState } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface AprovarInspecaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fotos: File[], descricao?: string) => Promise<void>;
  consertoId: string;
}

export default function AprovarInspecaoModal({
  isOpen,
  onClose,
  onSubmit,
}: AprovarInspecaoModalProps) {
  const [fotos, setFotos] = useState<File[]>([]);
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    // Validate total count
    if (fotos.length + selectedFiles.length > 10) {
      setError('Máximo de 10 fotos permitidas');
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    for (const file of selectedFiles) {
      // Validate type
      if (!allowedTypes.includes(file.type)) {
        setError('Apenas imagens JPG ou PNG são permitidas');
        continue;
      }

      // Validate size (10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        setError(`Arquivo ${file.name} excede 10MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFotos([...fotos, ...validFiles]);
      setError('');
    }
  };

  const handleRemoveFile = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fotos.length === 0) {
      setError('Selecione pelo menos 1 foto');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(fotos, descricao.trim() || undefined);
      // Reset form
      setFotos([]);
      setDescricao('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao aprovar inspeção');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFotos([]);
      setDescricao('');
      setError('');
      onClose();
    }
  };

  const getTotalSize = () => {
    return fotos.reduce((sum, file) => sum + file.size, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Aprovar Inspeção de Retorno
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
            <label htmlFor="fotos" className="label">
              Fotos da Inspeção <span className="text-red-500">*</span>
              <span className="text-sm text-gray-500 ml-2">
                (1-10 fotos, JPG ou PNG)
              </span>
            </label>
            <div className="mt-1">
              <label className="cursor-pointer">
                <div className="input flex items-center justify-between bg-green-50 border-green-300 hover:bg-green-100">
                  <span className="text-green-700 flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2" />
                    {fotos.length > 0
                      ? `${fotos.length} foto(s) selecionada(s)`
                      : 'Clique para selecionar fotos'}
                  </span>
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
                <input
                  id="fotos"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting || fotos.length >= 10}
                />
              </label>
              {fotos.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  Tamanho total: {(getTotalSize() / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>

            {/* Photo Grid */}
            {fotos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((file, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-300"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isSubmitting}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="descricao" className="label">
              Descrição (Opcional)
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="input"
              rows={4}
              placeholder="Adicione observações sobre a inspeção (opcional)"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <p className="text-sm text-green-800">
              Ao aprovar a inspeção, o status do conserto será alterado para{' '}
              <strong>"FINALIZADO"</strong>. O processo de conserto será concluído
              com sucesso.
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
              disabled={isSubmitting || fotos.length === 0}
              className="btn btn-success"
            >
              {isSubmitting ? 'Aprovando...' : 'Aprovar Inspeção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
