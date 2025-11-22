import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X } from 'lucide-react';

export default function IncCreatePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ar: '',
    nfeNumero: '',
    um: 'KG',
    quantidadeRecebida: '',
    quantidadeComDefeito: '',
    descricaoNaoConformidade: '',
  });
  const [nfeFile, setNfeFile] = useState<File | null>(null);
  const [fotos, setFotos] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNfeFile(e.target.files[0]);
    }
  };

  const handleFotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files));
    }
  };

  const removeFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append('ar', formData.ar);
      data.append('nfeNumero', formData.nfeNumero);
      data.append('um', formData.um);
      data.append('quantidadeRecebida', formData.quantidadeRecebida);
      data.append('quantidadeComDefeito', formData.quantidadeComDefeito);
      if (formData.descricaoNaoConformidade) {
        data.append('descricaoNaoConformidade', formData.descricaoNaoConformidade);
      }

      if (nfeFile) {
        data.append('nfeFile', nfeFile);
      }

      fotos.forEach((foto) => {
        data.append('fotos', foto);
      });

      await api.post('/inc', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('INC criado com sucesso');
      navigate('/inc');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar INC');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/inc')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Novo INC</h1>
        <p className="text-gray-600 mt-2">Preencha os dados para criar um novo INC</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ar" className="label">
              AR <span className="text-red-500">*</span>
            </label>
            <input
              id="ar"
              type="number"
              value={formData.ar}
              onChange={(e) => setFormData({ ...formData, ar: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="nfeNumero" className="label">
              NF-e Número <span className="text-red-500">*</span>
            </label>
            <input
              id="nfeNumero"
              type="text"
              value={formData.nfeNumero}
              onChange={(e) => setFormData({ ...formData, nfeNumero: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="um" className="label">
              Unidade de Medida <span className="text-red-500">*</span>
            </label>
            <select
              id="um"
              value={formData.um}
              onChange={(e) => setFormData({ ...formData, um: e.target.value })}
              className="input"
              required
            >
              <option value="UN">UN</option>
              <option value="KG">KG</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="CX">CX</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantidadeRecebida" className="label">
              Quantidade Recebida <span className="text-red-500">*</span>
            </label>
            <input
              id="quantidadeRecebida"
              type="number"
              step="0.01"
              value={formData.quantidadeRecebida}
              onChange={(e) =>
                setFormData({ ...formData, quantidadeRecebida: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="quantidadeComDefeito" className="label">
              Quantidade Com Defeito <span className="text-red-500">*</span>
            </label>
            <input
              id="quantidadeComDefeito"
              type="number"
              step="0.01"
              value={formData.quantidadeComDefeito}
              onChange={(e) =>
                setFormData({ ...formData, quantidadeComDefeito: e.target.value })
              }
              className="input"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="descricaoNaoConformidade" className="label">
              Descrição da Não Conformidade
            </label>
            <textarea
              id="descricaoNaoConformidade"
              value={formData.descricaoNaoConformidade}
              onChange={(e) =>
                setFormData({ ...formData, descricaoNaoConformidade: e.target.value })
              }
              className="input"
              rows={4}
              placeholder="Descreva detalhadamente a não conformidade encontrada..."
            />
          </div>

          <div>
            <label htmlFor="nfeFile" className="label">
              Anexar NF-e (PDF)
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <label className="flex-1 cursor-pointer">
                <div className="input flex items-center justify-between">
                  <span className="text-gray-500 truncate">
                    {nfeFile ? nfeFile.name : 'Selecione um arquivo'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="nfeFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {nfeFile && (
                <button
                  type="button"
                  onClick={() => setNfeFile(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="fotos" className="label">
              Fotos
            </label>
            <div className="mt-1">
              <label className="cursor-pointer">
                <div className="input flex items-center justify-between">
                  <span className="text-gray-500">
                    {fotos.length > 0
                      ? `${fotos.length} foto(s) selecionada(s)`
                      : 'Selecione as fotos'}
                  </span>
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="fotos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFotosChange}
                  className="hidden"
                />
              </label>
            </div>

            {fotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {fotos.map((foto, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(foto)}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeFoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{foto.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/inc')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Criando...' : 'Criar INC'}
          </button>
        </div>
      </form>
    </div>
  );
}
