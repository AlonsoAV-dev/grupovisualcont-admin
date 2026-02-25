'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/admin/Pagination';
import { authFetch, canDeleteComentario, canModerateComentario, handlePermissionError, isAdmin } from '@/lib/authUtils';

export default function ComentariosAdmin() {
  const router = useRouter();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState(''); // '' = Todos
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCurrentUser();
    loadComentarios();
  }, [filtro]);

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
        
        console.log('👤 Usuario cargado (comentarios):', user);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const loadComentarios = async () => {
    try {
      const url = filtro
        ? `/api/comentarios?estado=${filtro}`
        : '/api/comentarios';
      const res = await authFetch(url);
      const data = await res.json();
      const comentariosList = data.comentarios || [];
      
      // Log para debug
      if (comentariosList.length > 0) {
        console.log('💬 Comentarios cargados:', comentariosList.length);
        console.log('💬 Primer comentario (ejemplo):', comentariosList[0]);
      }
      
      setComentarios(comentariosList);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      const res = await authFetch(`/api/comentarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        // Actualizar estado inmediatamente
        setComentarios(prev => 
          prev.map(com => 
            com.id_comentario === id 
              ? { ...com, estado: nuevoEstado }
              : com
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      const res = await authFetch(`/api/comentarios/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Actualizar estado inmediatamente eliminando el comentario
        setComentarios(prev => prev.filter(com => com.id_comentario !== id));
      } else if (handlePermissionError(res)) {
        // Error 403 manejado
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar el comentario');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      1: 'Aprobado',
      2: 'En espera',
      3: 'Spam',
    };
    return labels[estado] || 'Desconocido';
  };

  const getEstadoBadge = (estado) => {
    const colors = {
      1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      3: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  // Cálculo de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = comentarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(comentarios.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Comentarios
        </h1>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-900"
        >
          <option value="">Todos</option>
          <option value="1">Aprobados</option>
          <option value="2">En espera</option>
          <option value="3">Spam</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Autor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Comentario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Noticia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay comentarios para mostrar
                </td>
              </tr>
            ) : (
              currentItems.map((comentario) => (
              <tr key={comentario.id_comentario}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {comentario.autor_nombre}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {comentario.autor_email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white max-w-md truncate">
                    {comentario.comentario}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {comentario.noticia_titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(
                      comentario.estado
                    )}`}
                  >
                    {getEstadoLabel(comentario.estado)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {currentUser && canModerateComentario(comentario, currentUser) && (
                    <>
                      {comentario.estado !== 1 && (
                        <button
                          onClick={() =>
                            handleUpdateEstado(comentario.id_comentario, 1)
                          }
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Aprobar
                        </button>
                      )}
                      {comentario.estado !== 3 && (
                        <button
                          onClick={() =>
                            handleUpdateEstado(comentario.id_comentario, 3)
                          }
                          className="text-orange-600 hover:text-orange-900 mr-3"
                        >
                          Spam
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(comentario.id_comentario)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  {currentUser && !canModerateComentario(comentario, currentUser) && (
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
            itemsPerPage={itemsPerPage}
            totalItems={comentarios.length}
          />
        )}
      </div>
    </div>
  );
}
