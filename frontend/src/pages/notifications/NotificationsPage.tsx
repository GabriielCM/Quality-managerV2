import { useState, useEffect } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'todas' | 'nao_lidas'>('nao_lidas');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/notifications', {
        params: { lida: filter === 'nao_lidas' ? false : undefined },
      });
      setNotifications(response.data);
    } catch (error) {
      toast.error('Erro ao carregar notificações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.lida) {
      handleMarkAsRead(notification.id);
    }

    // Navegar para a entidade relacionada
    if (notification.entityType === 'rnc' && notification.entityId) {
      navigate(`/rnc/${notification.entityId}`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-7 h-7" />
          Notificações
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('nao_lidas')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'nao_lidas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Não Lidas
          </button>
          <button
            onClick={() => setFilter('todas')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'todas'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando notificações...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 font-medium">Nenhuma notificação</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'nao_lidas'
              ? 'Você não tem notificações não lidas'
              : 'Você não tem notificações'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                notification.lida
                  ? 'bg-white hover:bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              } ${notification.urgente ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell
                      className={`w-5 h-5 ${
                        notification.urgente ? 'text-red-600' : 'text-gray-600'
                      }`}
                    />
                    <h3 className="font-semibold text-gray-900">
                      {notification.titulo}
                    </h3>
                    {notification.urgente && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-semibold">
                        URGENTE
                      </span>
                    )}
                    {!notification.lida && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-semibold">
                        NOVA
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{notification.mensagem}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                {!notification.lida && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification.id);
                    }}
                    className="text-blue-600 hover:text-blue-800 ml-4"
                    title="Marcar como lida"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
