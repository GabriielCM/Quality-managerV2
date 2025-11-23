import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import PrivateRoute from '@/components/PrivateRoute';
import MainLayout from '@/components/layouts/MainLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import UsersPage from '@/pages/users/UsersPage';
import IncListPage from '@/pages/inc/IncListPage';
import IncCreatePage from '@/pages/inc/IncCreatePage';
import IncEditPage from '@/pages/inc/IncEditPage';
import IncViewPage from '@/pages/inc/IncViewPage';
import FornecedoresListPage from '@/pages/fornecedores/FornecedoresListPage';
import FornecedorCreatePage from '@/pages/fornecedores/FornecedorCreatePage';
import FornecedorEditPage from '@/pages/fornecedores/FornecedorEditPage';
import FornecedorViewPage from '@/pages/fornecedores/FornecedorViewPage';
import RncAnalysisPage from '@/pages/rnc/RncAnalysisPage';
import RncCreatePage from '@/pages/rnc/RncCreatePage';
import RncListPage from '@/pages/rnc/RncListPage';
import RncViewPage from '@/pages/rnc/RncViewPage';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Usuários */}
          <Route path="users" element={<UsersPage />} />

          {/* INC */}
          <Route path="inc">
            <Route index element={<IncListPage />} />
            <Route path="create" element={<IncCreatePage />} />
            <Route path=":id" element={<IncViewPage />} />
            <Route path=":id/edit" element={<IncEditPage />} />
          </Route>

          {/* Fornecedores */}
          <Route path="fornecedores">
            <Route index element={<FornecedoresListPage />} />
            <Route path="create" element={<FornecedorCreatePage />} />
            <Route path=":id" element={<FornecedorViewPage />} />
            <Route path=":id/edit" element={<FornecedorEditPage />} />
          </Route>

          {/* RNC */}
          <Route path="rnc">
            <Route index element={<RncListPage />} />
            <Route path="analysis" element={<RncAnalysisPage />} />
            <Route path="create" element={<RncCreatePage />} />
            <Route path=":id" element={<RncViewPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
