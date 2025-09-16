import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  Building2,
  Users,
  ClipboardList,
  FileText,
  BarChart3,
  Map,
  Menu,
  LogOut,
  Settings,
  User,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Imóveis', href: '/properties', icon: Building2 },
  { name: 'Etapas', href: '/steps', icon: ClipboardList },
  { name: 'Documentos', href: '/documents', icon: FileText },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Mapa', href: '/map', icon: Map },
];

const adminNavigation = [
  { name: 'Usuários', href: '/users', icon: Users },
];

export default function SimpleLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCurrentPath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const NavItems = ({ mobile = false }) => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const current = isCurrentPath(item.href);
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              current 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } ${mobile ? 'px-4 py-3' : ''}`}
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {item.name}
          </Link>
        );
      })}
      
      {isAdmin() && (
        <>
          <div className={`mt-6 mb-2 ${mobile ? 'px-4' : 'px-3'}`}>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Administração
            </span>
          </div>
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            const current = isCurrentPath(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  current 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } ${mobile ? 'px-4 py-3' : ''}`}
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Regularização</h1>
            <p className="text-sm text-gray-500">Prefeitura de Mogi Mirim</p>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <NavItems />
        </nav>
      </div>

      {/* Sidebar Mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Regularização</h1>
              <p className="text-sm text-gray-500">Prefeitura de Mogi Mirim</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <NavItems mobile />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>

          <div className="flex flex-1 justify-end gap-x-4 lg:gap-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 h-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getUserInitials(user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex sm:flex-col sm:items-start">
                    <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                    <span className="text-xs text-gray-500">
                      {user?.role === 'admin' && 'Administrador'}
                      {user?.role === 'manager' && 'Gestor'}
                      {user?.role === 'operator' && 'Operador'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

