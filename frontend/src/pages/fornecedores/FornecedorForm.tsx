import { useState, useEffect } from 'react';
import { Fornecedor } from '@/types/fornecedor';

interface FornecedorFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

// Função para aplicar máscara de CNPJ
const applyCNPJMask = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
};

// Função para remover máscara do CNPJ
const removeCNPJMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Função para formatar CNPJ completo
const formatCNPJ = (cnpj: string): string => {
  if (!cnpj) return '';
  return applyCNPJMask(cnpj);
};

export default function FornecedorForm({ fornecedor, onSubmit, isLoading }: FornecedorFormProps) {
  const [formData, setFormData] = useState({
    cnpj: '',
    razaoSocial: '',
    codigoLogix: '',
  });

  const [cnpjDisplay, setCnpjDisplay] = useState('');

  useEffect(() => {
    if (fornecedor) {
      setFormData({
        cnpj: fornecedor.cnpj,
        razaoSocial: fornecedor.razaoSocial,
        codigoLogix: fornecedor.codigoLogix,
      });
      setCnpjDisplay(formatCNPJ(fornecedor.cnpj));
    }
  }, [fornecedor]);

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = applyCNPJMask(e.target.value);
    setCnpjDisplay(masked);
    setFormData({ ...formData, cnpj: removeCNPJMask(masked) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar CNPJ
    if (formData.cnpj.length !== 14) {
      alert('CNPJ deve ter 14 dígitos');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="cnpj" className="label">
            CNPJ <span className="text-red-500">*</span>
          </label>
          <input
            id="cnpj"
            type="text"
            value={cnpjDisplay}
            onChange={handleCNPJChange}
            className="input"
            placeholder="00.000.000/0000-00"
            required
            maxLength={18}
          />
          <p className="mt-1 text-sm text-gray-500">
            Digite apenas números ou com a formatação XX.XXX.XXX/XXXX-XX
          </p>
        </div>

        <div>
          <label htmlFor="razaoSocial" className="label">
            Razão Social <span className="text-red-500">*</span>
          </label>
          <input
            id="razaoSocial"
            type="text"
            value={formData.razaoSocial}
            onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
            className="input"
            placeholder="Digite a Razão Social"
            required
          />
        </div>

        <div>
          <label htmlFor="codigoLogix" className="label">
            Código Logix <span className="text-red-500">*</span>
          </label>
          <input
            id="codigoLogix"
            type="text"
            value={formData.codigoLogix}
            onChange={(e) => setFormData({ ...formData, codigoLogix: e.target.value })}
            className="input"
            placeholder="Digite o Código Logix"
            required
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
