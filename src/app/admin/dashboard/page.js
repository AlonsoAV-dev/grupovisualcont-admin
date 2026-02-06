'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNewspaper,
  faCommentDots,
  faUsers,
  faArrowTrendUp,
  faEye,
  faPenToSquare,
  faCheckCircle,
  faTags
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from '@/lib/authUtils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    noticias: 0,
    noticiasPublicadas: 0,
    comentariosPendientes: 0,
    usuarios: 0,
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndStats();
  }, []);

  const loadUserAndStats = async () => {
    try {
      // Obtener usuario actual
      const userRes = await authFetch('/api/auth/me');
      
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.user);
        }
      } else {
        // Modo desarrollo: usar datos mock
        console.log('⚠️ Backend no disponible, usando modo desarrollo');
        setUser({ name: 'Admin (Dev)', email: 'admin@dev.local', rol: 'admin' });
      }

      // Cargar estadísticas (cada una independientemente)
      const [noticiasRes, comentariosRes, usuariosRes] = await Promise.all([
        authFetch('/api/noticias'),
        authFetch('/api/comentarios?estado=2'),
        authFetch('/api/usuarios'),
      ]);

      // Procesar noticias
      let totalNoticias = 0;
      let noticiasPublicadas = 0;
      if (noticiasRes.ok) {
        const noticias = await noticiasRes.json();
        console.log('📰 Noticias recibidas:', noticias);
        totalNoticias = noticias.noticias?.length || 0;
        noticiasPublicadas = noticias.noticias?.filter(n => n.estado === 'publicada').length || 0;
      }

      // Procesar comentarios
      let comentariosPendientes = 0;
      if (comentariosRes.ok) {
        const comentarios = await comentariosRes.json();
        console.log('💬 Comentarios recibidos:', comentarios);
        comentariosPendientes = comentarios.comentarios?.length || 0;
      }

      // Procesar usuarios
      let totalUsuarios = 0;
      if (usuariosRes.ok) {
        const usuarios = await usuariosRes.json();
        console.log('👥 Usuarios recibidos:', usuarios);
        totalUsuarios = usuarios.usuarios?.length || 0;
      }

      setStats({
        noticias: totalNoticias,
        noticiasPublicadas,
        comentariosPendientes,
        usuarios: totalUsuarios,
      });

      console.log('📊 Estadísticas finales:', {
        noticias: totalNoticias,
        noticiasPublicadas,
        comentariosPendientes,
        usuarios: totalUsuarios,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // Usar datos mock en caso de error
      setUser({ name: 'Admin (Dev)', email: 'admin@dev.local', rol: 'admin' });
      setStats({
        noticias: 0,
        noticiasPublicadas: 0,
        comentariosPendientes: 0,
        usuarios: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Noticias',
      value: stats.noticias,
      icon: faNewspaper,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: `${stats.noticiasPublicadas} publicadas`
    },
    {
      title: 'Comentarios Pendientes',
      value: stats.comentariosPendientes,
      icon: faCommentDots,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/10',
      borderColor: 'border-amber-200 dark:border-amber-800',
      description: 'Esperan moderación'
    },
    ...(user?.rol === 'admin' ? [{
      title: 'Total Usuarios',
      value: stats.usuarios,
      icon: faUsers,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/10',
      borderColor: 'border-green-200 dark:border-green-800',
      description: 'Usuarios activos'
    }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Header profesional */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
          {user?.rol === 'admin' ? 'Panel de Administración' : 'Panel de Editor'}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Resumen general del sistema
        </p>
      </div>

      {/* Stats Grid - Diseño corporativo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-5 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 ${stat.bgColor} rounded-lg border ${stat.borderColor}`}>
                <FontAwesomeIcon icon={stat.icon} className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">
                {stat.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Acciones Rápidas - Diseño ejecutivo */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {user?.rol === 'admin' ? 'Acciones Rápidas' : 'Mis Acciones'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/noticias"
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {user?.rol === 'admin' ? 'Gestionar Noticias' : 'Mis Noticias'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.rol === 'admin'
                    ? 'Administra todas las publicaciones'
                    : 'Crea y edita tus publicaciones'}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/comentarios"
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <FontAwesomeIcon icon={faEye} className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Revisar Comentarios
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.rol === 'admin'
                    ? 'Modera los comentarios del sistema'
                    : 'Gestiona comentarios pendientes'}
                </p>
                {stats.comentariosPendientes > 0 && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-medium rounded">
                    {stats.comentariosPendientes} pendientes
                  </span>
                )}
              </div>
            </div>
          </Link>

          {user?.rol === 'admin' && (
            <Link
              href="/admin/usuarios"
              className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md transition-all"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <FontAwesomeIcon icon={faUsers} className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Gestionar Usuarios
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Administra usuarios del sistema
                  </p>
                </div>
              </div>
            </Link>
          )}

          <Link
            href="/admin/keywords"
            className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <FontAwesomeIcon icon={faTags} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Keywords SEO
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Gestiona palabras clave para SEO
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}