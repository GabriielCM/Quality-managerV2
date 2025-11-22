import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import UserModal from './UserModal';
import PermissionsModal from './PermissionsModal';

interface User {
  id: string;
  nome: string;
  email: string;
  createdAt: string;
  permissions: any[];
}

export default function UsersPage() {
  const { hasPermission } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const canCreate = hasPermission('users.create');
  const canUpdate = hasPermission('users.update');
  const canDelete = hasPermission('users.delete');
  const canManagePermissions = hasPermission('users.manage_permissions');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success('Usuário deletado com sucesso');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar usuário');
    }
  };

  const handleManagePermissions = (user: User) => {
    setSelectedUser(user);
    setIsPermissionsModalOpen(true);
  };

  if (!hasPermission('users.read')) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Acesso Negado</h2>
        <p className="text-gray-600 mt-2">Você não tem permissão para visualizar usuários.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-2">Gerencie os usuários do sistema</p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Novo Usuário</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">Carregando...</div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.permissions.length} permissões
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {canManagePermissions && (
                          <button
                            onClick={() => handleManagePermissions(user)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Gerenciar Permissões"
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Deletar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            loadUsers();
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {isPermissionsModalOpen && selectedUser && (
        <PermissionsModal
          user={selectedUser}
          onClose={() => {
            setIsPermissionsModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            loadUsers();
            setIsPermissionsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
