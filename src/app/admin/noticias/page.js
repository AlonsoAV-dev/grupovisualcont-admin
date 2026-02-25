'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Pagination from '@/components/admin/Pagination';
import { authFetch, getCurrentUser, canEditNoticia, canDeleteNoticia, handlePermissionError } from '@/lib/authUtils';

export default function NoticiasAdmin() {
  const router = useRouter();
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadNoticias();
  }, [currentPage]);

  const loadCurrentUser = async () => {
    try {
      const res = await authFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const user = data.user || data.usuario || data;
        
        // Normalizar el campo id_usuario (la API puede devolver "id" o "id_usuario")
        if (user && !user.id_usuario && user.id) {
          user.id_usuario = user.id;
        }
        
        console.log('👤 Usuario cargado:', user);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const loadNoticias = async () => {
    try {
      // Agregar timestamp para evitar cache del navegador
      const timestamp = new Date().getTime();
      const res = await authFetch(
        `/api/noticias?page=${currentPage}&limit=${itemsPerPage}&orderBy=creado_en&_t=${timestamp}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      const noticiasList = data.noticias || [];
      
      // Log para debug
      if (noticiasList.length > 0) {
        console.log('📰 Noticias cargadas:', noticiasList.length);
        console.log('📰 Primera noticia (ejemplo):', noticiasList[0]);
      }
      
      setNoticias(noticiasList);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === 'publicada' ? 'borrador' : 'publicada';
    const accion = nuevoEstado === 'publicada' ? 'publicar' : 'pasar a borrador';
    
    if (!confirm(`¿Estás seguro de ${accion} esta noticia?`)) return;

    try {
      const res = await authFetch(`/api/noticias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        // Recargar lista completa para mantener el orden correcto
        await loadNoticias();
      } else if (handlePermissionError(res)) {
        // Error 403 manejado
      } else {
        const data = await res.json();
        alert(data.error || 'Error al cambiar el estado de la noticia');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;

    try {
      const res = await authFetch(`/api/noticias/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Recargar lista completa para mantener el orden correcto
        await loadNoticias();
      } else if (handlePermissionError(res)) {
        // Error 403 manejado
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la noticia');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      publicada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      borrador: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  // Calcular índices para mostrar numeración
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Noticias
        </h1>
        <Link
          href="/admin/noticias/edit"
          className="px-4 py-2 bg-[#257CD0] text-white rounded-md hover:bg-[#1e6bb8]"
        >
          + Nueva Noticia
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/3">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {noticias.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay noticias para mostrar
                </td>
              </tr>
            ) : (
              noticias.map((noticia, index) => (
              <tr key={noticia.id_noticia}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {noticia.id_noticia}
                </td>
                <td className="px-6 py-4 w-1/3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {noticia.titulo}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {noticia.autor_nombre || noticia.nombre_autor || 'Sin autor'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${getEstadoBadge(
                      noticia.estado
                    )} hover:opacity-80`}
                    title={`Click para cambiar a ${noticia.estado === 'publicada' ? 'borrador' : 'publicada'}`}
                  >
                    {noticia.estado}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(noticia.creado_en).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {currentUser && canEditNoticia(noticia, currentUser) && (
                    <>
                      <Link
                        href={`/admin/noticias/edit?id=${noticia.id_noticia}`}
                        className="text-[#257CD0] hover:text-[#1e6bb8]"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(noticia.id_noticia)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  {currentUser && !canEditNoticia(noticia, currentUser) && (
                    <span className="text-gray-400 text-xs">Sin permisos</span>
                  )}
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
