import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LayoutDashboard, Users, FileText, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  permissions?: string[];
}

export default function Sidebar() {
  const { hasAnyPermission } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'INC',
      href: '/inc',
      icon: FileText,
      permissions: ['inc.read', 'admin.all'],
    },
    {
      name: 'Usuários',
      href: '/users',
      icon: Users,
      permissions: ['users.read', 'admin.all'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permissions) return true;
    return hasAnyPermission(item.permissions);
  });

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">Q-Manager</h1>
        <button
          className="lg:hidden text-gray-500 hover:text-gray-700"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 p-4 bg-primary-600 text-white rounded-full shadow-lg"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <LayoutDashboard className="w-6 h-6" />
      </button>
    </>
  );
}
