import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Bell, BellOff } from 'lucide-react';

interface NotificationSettingsModalProps {
  user: any;
  onClose: () => void;
}

export default function NotificationSettingsModal({
  user,
  onClose,
}: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get(`/notifications/users/${user.id}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (typeId: string, currentValue: boolean) => {
    try {
      await api.patch(`/notifications/users/${user.id}/settings/${typeId}`, {
        habilitado: !currentValue,
      });
      setSettings((prev) =>
        prev.map((s) => (s.id === typeId ? { ...s, habilitado: !currentValue } : s))
      );
      toast.success('Configuração atualizada');
    } catch (error) {
      toast.error('Erro ao atualizar configuração');
    }
  };

  const groupedSettings = settings.reduce((acc, s) => {
    if (!acc[s.modulo]) acc[s.modulo] = [];
    acc[s.modulo].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Configurações de Notificação
            </h2>
            <p className="text-sm text-gray-600 mt-1">{user.nome}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando configurações...</p>
            </div>
          ) : settings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum tipo de notificação disponível
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSettings).map(([module, moduleSettings]) => (
                <div key={module} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 capitalize text-lg">{module}</h3>
                  <div className="space-y-3">
                    {moduleSettings.map((setting: any) => (
                      <div
                        key={setting.id}
                        className={`flex items-start justify-between p-3 rounded border transition ${
                          setting.ativo
                            ? 'border-gray-200 hover:bg-gray-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {setting.nome}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {setting.descricao}
                          </p>
                          {!setting.ativo && (
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              ⚠ Desabilitado globalmente pelo administrador
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggle(setting.id, setting.habilitado)}
                          disabled={!setting.ativo}
                          className={`ml-4 p-2 rounded transition ${
                            setting.habilitado && setting.ativo
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          } ${!setting.ativo ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={
                            !setting.ativo
                              ? 'Desabilitado pelo administrador'
                              : setting.habilitado
                              ? 'Desabilitar notificação'
                              : 'Habilitar notificação'
                          }
                        >
                          {setting.habilitado ? (
                            <Bell className="w-5 h-5" />
                          ) : (
                            <BellOff className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
