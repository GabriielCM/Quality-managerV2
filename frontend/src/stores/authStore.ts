import { create } from 'zustand';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  nome: string;
  email: string;
  permissions: {
    code: string;
    name: string;
    module: string;
  }[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, senha: string) => {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      set({ user, isAuthenticated: true });
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao fazer login');
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
      toast.success('Logout realizado com sucesso!');
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      // Tentar fazer uma requisição simples para validar o token
      await api.get('/permissions/modules');

      // Se chegou aqui, o token é válido
      // Vamos pegar os dados do usuário do payload do JWT
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));

      const user: User = {
        id: tokenPayload.sub,
        nome: tokenPayload.nome,
        email: tokenPayload.email,
        permissions: tokenPayload.permissions.map((code: string) => ({
          code,
          name: code,
          module: code.split('.')[0],
        })),
      };

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;

    return (
      user.permissions.some((p) => p.code === 'admin.all') ||
      user.permissions.some((p) => p.code === permission)
    );
  },

  hasAnyPermission: (permissions: string[]) => {
    const { user } = get();
    if (!user) return false;

    return (
      user.permissions.some((p) => p.code === 'admin.all') ||
      permissions.some((permission) =>
        user.permissions.some((p) => p.code === permission)
      )
    );
  },
}));
