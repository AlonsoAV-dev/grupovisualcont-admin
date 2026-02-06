'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/admin/Pagination';
import { authFetch } from '@/lib/authUtils';

export default function KeywordsAdmin() {
  const router = useRouter();
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadKeywords();
  }, [currentPage]);

  const loadKeywords = async () => {
    try {
      const res = await authFetch(`/api/keywords?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await res.json();
      setKeywords(data.keywords || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newKeyword }),
      });

      if (res.ok) {
       const data = await res.json();
        // Recargar lista completa desde el backend
        await loadKeywords();
        setNewKeyword('');
        setShowModal(false);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta keyword?')) return;

    try {
      const res = await authFetch(`/api/keywords/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        // Recargar lista completa desde el backend
        await loadKeywords();
        alert(data.message || 'Keyword eliminada correctamente');
      } else {
        // Traducir errores comunes de base de datos
        let errorMessage = data.error || 'Error al eliminar la keyword';
        
        // Detectar error de foreign key
        if (errorMessage.includes('foreign key constraint fails') || errorMessage.includes('page_keywords')) {
          errorMessage = 'No se puede eliminar esta keyword porque está siendo usada en una o más páginas. Primero debes removerla de las páginas donde está asignada';
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al eliminar la keyword');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Keywords (SEO)
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#257CD0] text-white rounded-md hover:bg-[#1e6bb8]"
        >
          + Nueva Keyword
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {keywords.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay keywords para mostrar
                </td>
              </tr>
            ) : (
              keywords.map((keyword) => (
              <tr key={keyword.id_keyword}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {keyword.id_keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {keyword.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(keyword.id_keyword)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
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

      {/* Modal para crear keyword */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Nueva Keyword
            </h2>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#257CD0] text-white rounded-md hover:bg-[#1e6bb8]"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
