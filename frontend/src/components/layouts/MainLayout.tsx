import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={clsx(
          'transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <Header />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
