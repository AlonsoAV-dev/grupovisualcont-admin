'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/admin/Pagination';
import { authFetch, isAdmin, handlePermissionError } from '@/lib/authUtils';

export default function UsuariosAdmin() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'editor',
  });

  useEffect(() => {
    loadCurrentUser();
    loadUsuarios();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await authFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user || data.usuario || data);
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      // Agregar timestamp para evitar cache del navegador
      const timestamp = new Date().getTime();
      const res = await authFetch(`/api/usuarios?_t=${timestamp}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Solo admin puede crear usuarios (se valida en el backend también)
    if (!isAdmin(currentUser)) {
      alert('No tienes permisos para crear usuarios.');
      return;
    }

    try {
      const res = await authFetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        // Recargar la lista completa para asegurar sincronización
        await loadUsuarios();
        setFormData({ nombre: '', email: '', password: '', rol: 'editor' });
        setShowModal(false);
      } else if (handlePermissionError(res)) {
        // Error 403 manejado
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
    });
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Solo admin puede editar usuarios
    if (!isAdmin(currentUser)) {
      alert('No tienes permisos para editar usuarios.');
      return;
    }

    try {
      const updateData = {
        nombre: formData.nombre,
        email: formData.email,
        rol: formData.rol,
      };
      
      // Solo incluir password si se ingresó uno nuevo
      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await authFetch(`/api/usuarios/${editingUser.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        // Recargar la lista completa para asegurar sincronización
        await loadUsuarios();
        setFormData({ nombre: '', email: '', password: '', rol: 'editor' });
        setShowModal(false);
        setEditingUser(null);
      } else if (handlePermissionError(res)) {
        // Error 403 manejado
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    const accion = estadoActual === 1 ? 'suspender' : 'activar';
    if (!confirm(`¿Estás seguro de ${accion} este usuario?`)) return;

    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;
      const res = await authFetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        // Recargar la lista completa para asegurar sincronización
        await loadUsuarios();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

    // Solo admin puede eliminar usuarios
    if (!isAdmin(currentUser)) {
      alert('No tienes permisos para eliminar usuarios.');
      return;
    }

    try {
      const res = await authFetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Recargar la lista completa para asegurar sincronización
        await loadUsuarios();
      } else if (handlePermissionError(res)) {
        // Error 403 manejado
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'Nunca';
    const date = new Date(fecha);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ nombre: '', email: '', password: '', rol: 'editor' });
  };

  // Cálculo de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = usuarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Usuarios
        </h1>
        {currentUser && isAdmin(currentUser) && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#257CD0] text-white rounded-md hover:bg-[#1e6bb8]"
          >
            + Nuevo Usuario
          </button>
        )}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Último Login
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay usuarios para mostrar
                </td>
              </tr>
            ) : (
              currentItems.map((usuario) => (
              <tr key={usuario.id_usuario}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {usuario.id_usuario}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {usuario.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.rol === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                  >
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      usuario.estado === 1
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {usuario.estado === 1 ? 'Activo' : 'Suspendido'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatFecha(usuario.ultimo_login)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {currentUser && isAdmin(currentUser) && (
                    <>
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id_usuario)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  {currentUser && !isAdmin(currentUser) && (
                    <span className="text-gray-400 text-xs">Solo Admin</span>
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
            totalItems={usuarios.length}
          />
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <form onSubmit={editingUser ? handleUpdate : handleCreate}>
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  required={!editingUser}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) =>
                    setFormData({ ...formData, rol: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                  disabled={!isAdmin(currentUser)}
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                {!isAdmin(currentUser) && (
                  <p className="text-xs text-gray-500 mt-1">Solo los administradores pueden cambiar roles.</p>
                )}
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
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
