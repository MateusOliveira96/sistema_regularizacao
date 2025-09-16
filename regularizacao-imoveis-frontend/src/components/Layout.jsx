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
import './Layout.css';

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

export default function Layout() {
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
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const current = isCurrentPath(item.href);
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`nav-item ${current ? 'nav-item-active' : ''} ${mobile ? 'mobile' : ''}`}
            onClick={() => mobile && setSidebarOpen(false)}
          >
            <Icon className="nav-icon" />
            {item.name}
          </Link>
        );
      })}
      
      {isAdmin() && (
        <>
          <div className={`nav-separator ${mobile ? 'mobile' : ''}`}>
            <span>Administração</span>
          </div>
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            const current = isCurrentPath(item.href);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-item ${current ? 'nav-item-active' : ''} ${mobile ? 'mobile' : ''}`}
                onClick={() => mobile && setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                {item.name}
              </Link>
            );
          })}
        </>
      )}
    </>
  );

  return (
    <div className="layout">
      {/* Sidebar Desktop */}
      <div className="sidebar">
        <div className="sidebar-header">
          <Building2 className="sidebar-logo" />
          <div className="sidebar-title">
            <h1>Regularização</h1>
            <p>Prefeitura de Mogi Mirim</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <NavItems />
        </nav>
      </div>

      {/* Sidebar Mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="sidebar-mobile">
          <div className="sidebar-header">
            <Building2 className="sidebar-logo" />
            <div className="sidebar-title">
              <h1>Regularização</h1>
              <p>Prefeitura de Mogi Mirim</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <NavItems mobile />
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mobile-menu-button"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>

          <div className="header-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="user-menu">
                  <Avatar className="user-avatar">
                    <AvatarFallback>
                      {getUserInitials(user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="user-info">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">
                      {user?.role === 'admin' && 'Administrador'}
                      {user?.role === 'manager' && 'Gestor'}
                      {user?.role === 'operator' && 'Operador'}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="user-menu-content">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="menu-icon" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="menu-icon" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="menu-icon" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

