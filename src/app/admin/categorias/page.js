'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/admin/Pagination';
import { authFetch } from '@/lib/authUtils';

export default function CategoriasAdmin() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const res = await authFetch('/api/categorias');
      const data = await res.json();
      setCategorias(data.categorias || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        // Actualizar estado inmediatamente con la nueva categoría
        setCategorias(prev => [...prev, data.categoria]);
        setFormData({ nombre: '', descripcion: '' });
        setShowModal(false);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`/api/categorias/${editingCategoria.id_categoria}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Actualizar estado inmediatamente
        setCategorias(prev => 
          prev.map(cat => 
            cat.id_categoria === editingCategoria.id_categoria 
              ? { ...cat, ...formData }
              : cat
          )
        );
        setFormData({ nombre: '', descripcion: '' });
        setShowModal(false);
        setEditingCategoria(null);
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const res = await authFetch(`/api/categorias/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Actualizar estado inmediatamente eliminando la categoría
        setCategorias(prev => prev.filter(cat => cat.id_categoria !== id));
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  // Cálculo de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categorias.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categorias.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Categorías
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#257CD0] text-white rounded-md hover:bg-[#1e6bb8]"
        >
          + Nueva Categoría
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay categorías para mostrar
                </td>
              </tr>
            ) : (
              currentItems.map((categoria) => (
              <tr key={categoria.id_categoria}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {categoria.nombre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {categoria.descripcion || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id_categoria)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400"
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
            itemsPerPage={itemsPerPage}
            totalItems={categorias.length}
          />
        )}
      </div>

      {/* Modal para crear/editar categoría */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={editingCategoria ? handleUpdate : handleCreate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#257CD0] text-white rounded-md hover:bg-[#1e6bb8]"
                >
                  {editingCategoria ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
