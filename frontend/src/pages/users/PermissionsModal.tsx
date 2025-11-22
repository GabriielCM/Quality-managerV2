import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

interface PermissionsModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
}

export default function PermissionsModal({ user, onClose, onSuccess }: PermissionsModalProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await api.get('/permissions');
      setPermissions(response.data);

      const userPermissionIds = user.permissions.map((p: any) => p.permissionId);
      setSelectedPermissions(userPermissionIds);
    } catch (error) {
      toast.error('Erro ao carregar permissões');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.post(`/users/${user.id}/permissions`, {
        permissionIds: selectedPermissions,
      });
      toast.success('Permissões atualizadas com sucesso');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar permissões');
    } finally {
      setIsSaving(false);
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciar Permissões</h2>
            <p className="text-sm text-gray-600 mt-1">{user.nome}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="text-center py-8">Carregando permissões...</div>
            ) : (
              Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 capitalize">{module}</h3>
                  <div className="space-y-2">
                    {modulePermissions.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handleTogglePermission(permission.id)}
                          className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{permission.code}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? 'Salvando...' : 'Salvar Permissões'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
