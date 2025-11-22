import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface UserModalProps {
  user: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({ user, onClose, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        senha: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (user) {
        const updateData: any = {
          nome: formData.nome,
          email: formData.email,
        };

        if (formData.senha) {
          updateData.senha = formData.senha;
        }

        await api.patch(`/users/${user.id}`, updateData);
        toast.success('Usuário atualizado com sucesso');
      } else {
        await api.post('/users', formData);
        toast.success('Usuário criado com sucesso');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="nome" className="label">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="senha" className="label">
              Senha {user && '(deixe em branco para manter a atual)'}
            </label>
            <input
              id="senha"
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              className="input"
              required={!user}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
