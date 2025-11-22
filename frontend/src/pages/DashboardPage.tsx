import { useAuthStore } from '@/stores/authStore';
import { FileText, Users, Shield } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de INCs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suas Permissões</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {user?.permissions.length || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Suas Permissões</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {user?.permissions.map((permission) => (
            <div
              key={permission.code}
              className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
            >
              <Shield className="w-4 h-4 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                <p className="text-xs text-gray-500">{permission.module}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
