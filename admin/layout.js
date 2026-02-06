'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartLine, 
  faNewspaper, 
  faComments, 
  faTags, 
  faLayerGroup, 
  faUsers, 
  faRightFromBracket,
  faBars,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faSearch,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from '@/lib/authUtils';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [seoMenuOpen, setSeoMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      console.log('🔐 Verificando auth, token:', token ? 'Existe' : 'No existe');
      
      if (!token) {
        console.log('❌ No hay token, redirigiendo a /noticias');
        window.location.href = '/noticias';
        return;
      }

      const res = await authFetch('/api/auth/me');
      
      console.log('📡 Respuesta auth:', res.status, res.ok);

      if (res.ok) {
        const data = await res.json();
        console.log('✅ Autenticación exitosa');
        setUser(data.user);
      } else {
        console.log('❌ Autenticación fallida, limpiando token');
        localStorage.removeItem('auth_token');
        window.location.href = '/noticias';
      }
    } catch (error) {
      console.error('💥 Error verificando autenticación:', error);
      localStorage.removeItem('auth_token');
      window.location.href = '/noticias';
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/noticias';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    { href: '/admin/dashboard', icon: faChartLine, label: 'Dashboard' },
    { href: '/admin/noticias', icon: faNewspaper, label: 'Noticias' },
    { href: '/admin/comentarios', icon: faComments, label: 'Comentarios' },
    { href: '/admin/categorias', icon: faLayerGroup, label: 'Categorías' },
  ];

  const seoMenuItems = [
    { href: '/admin/keywords', icon: faTags, label: 'Keywords' },
    { href: '/admin/page-keywords', icon: faSearch, label: 'Keywords por Página' },
  ];

  if (user.rol === 'admin') {
    menuItems.push({ href: '/admin/usuarios', icon: faUsers, label: 'Usuarios' });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
      >
        <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Azul oscuro profesional */}
      <div className={`fixed inset-y-0 left-0 bg-[rgba(30,77,142,1)] dark:bg-[rgba(20,55,100,1)] shadow-xl transform transition-all duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-64`}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center h-16 border-b border-[rgba(20,60,110,0.5)] relative">
            {!sidebarCollapsed ? (
              <div className="text-center">
                <h1 className="text-xl font-semibold text-white tracking-tight">VisualCont</h1>
                <p className="text-xs text-blue-200 mt-0.5">Panel de Gestión</p>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[rgba(50,110,180,1)] flex items-center justify-center text-white font-bold text-lg">
                V
              </div>
            )}
            
            {/* Toggle button - solo en desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-[rgba(50,110,180,1)] rounded-full text-white hover:bg-[rgba(40,90,160,1)] transition-colors shadow-md"
            >
              <FontAwesomeIcon icon={sidebarCollapsed ? faChevronRight : faChevronLeft} className="w-3 h-3" />
            </button>
          </div>

          {/* User Info */}
          <div className={`p-4 border-b border-[rgba(20,60,110,0.5)] ${sidebarCollapsed ? 'px-2' : ''}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="w-10 h-10 rounded-full bg-[rgba(50,110,180,1)] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold ml-1 text-white truncate">
                    {user.nombre}
                  </p>
                  <span className="inline-block text-xs bg-blue-900 px-2 py-0.5 rounded text-blue-200 uppercase tracking-wide font-medium">
                    {user.rol}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 py-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-[rgba(50,110,180,1)] text-white shadow-sm'
                      : 'text-blue-100 hover:bg-[rgba(40,90,160,0.5)] hover:text-white'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <FontAwesomeIcon 
                    icon={item.icon} 
                    className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-blue-200'}`}
                  />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            {/* SEO Menu */}
            <div>
              <button
                onClick={() => setSeoMenuOpen(!seoMenuOpen)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors text-blue-100 hover:bg-[rgba(40,90,160,0.5)] hover:text-white ${
                  sidebarCollapsed ? 'justify-center' : 'justify-between'
                }`}
                title={sidebarCollapsed ? 'SEO' : ''}
              >
                <div className={`flex items-center ${sidebarCollapsed ? '' : 'flex-1'}`}>
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-3' : ''} text-blue-200`}
                  />
                  {!sidebarCollapsed && <span>SEO</span>}
                </div>
                {!sidebarCollapsed && (
                  <FontAwesomeIcon 
                    icon={seoMenuOpen ? faChevronUp : faChevronDown} 
                    className="w-3 h-3 text-blue-200"
                  />
                )}
              </button>
              
              {seoMenuOpen && !sidebarCollapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {seoMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-[rgba(50,110,180,1)] text-white shadow-sm'
                            : 'text-blue-100 hover:bg-[rgba(40,90,160,0.5)] hover:text-white'
                        }`}
                      >
                        <FontAwesomeIcon 
                          icon={item.icon} 
                          className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-blue-200'}`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Logout Button */}
          <div className={`p-4 border-t border-[rgba(20,60,110,0.5)] ${sidebarCollapsed ? 'px-2' : ''}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium text-white bg-[rgba(20,60,110,0.8)] hover:bg-[rgba(20,60,110,1)] rounded-md transition-colors ${
                sidebarCollapsed ? 'justify-center px-2' : 'justify-center'
              }`}
              title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
            >
              <FontAwesomeIcon icon={faRightFromBracket} className={`w-4 h-4 ${!sidebarCollapsed ? 'mr-2' : ''}`} />
              {!sidebarCollapsed && 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Gestiona tu contenido desde aquí
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.nombre}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
