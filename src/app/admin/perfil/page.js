'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faCamera, faEdit, faSave, faTimes, faNewspaper, faChartLine, faFileAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [noticias, setNoticias] = useState([]);
  const [estadisticas, setEstadisticas] = useState({ total: 0, publicadas: 0, borradores: 0 });
  const [loadingNoticias, setLoadingNoticias] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    foto: '',
    descripcion: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserNoticias = async (userId) => {
    try {
      setLoadingNoticias(true);
      const res = await authFetch(`/api/noticias?autor=${userId}&limit=5&orderBy=fecha_publicacion`);
      if (res.ok) {
        const data = await res.json();
        setNoticias(data.noticias || []);
        setEstadisticas({
          total: data.total || 0,
          publicadas: data.publicadas || 0,
          borradores: data.borradores || 0,
        });
      }
    } catch (error) {
      console.error('Error al cargar noticias:', error);
    } finally {
      setLoadingNoticias(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const res = await authFetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        console.log('📝 Datos del usuario desde backend:', data.user);
        setUser(data.user);
        setFormData({
          nombre: data.user.nombre || '',
          email: data.user.email || '',
          password: '',
          confirmPassword: '',
          foto: data.user.foto || '',
          descripcion: data.user.descripcion || '',
        });
        // Cargar noticias del usuario
        await loadUserNoticias(data.user.id_usuario);
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validar contraseñas si se está cambiando
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
        return;
      }
      if (formData.password.length < 6) {
        setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
        return;
      }
    }

    setSaving(true);

    try {
      const updateData = {
        nombre: formData.nombre,
        email: formData.email,
        rol: user.rol,
        foto: formData.foto,
        descripcion: formData.descripcion,
      };

      // Solo incluir password si se ingresó uno nuevo
      if (formData.password) {
        updateData.password = formData.password;
      }

      const res = await authFetch(`/api/usuarios/${user.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        setEditing(false);
        // Recargar el perfil
        await loadUserProfile();
        // Limpiar campos de contraseña
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: '',
        }));
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Error al actualizar perfil' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setMessage({ type: '', text: '' });
    // Restaurar datos originales
    setFormData({
      nombre: user.nombre || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      foto: user.foto || '',
      descripcion: user.descripcion || '',
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </h1>
        {!editing && (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-[#257CD0] text-white rounded-lg hover:bg-[#1e6bb8] flex items-center gap-2 shadow-sm"
            >
              <FontAwesomeIcon icon={faEdit} />
              Editar Perfil
            </button>
          </div>
        )}
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de perfil - Columna izquierda */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#257CD0] to-[#1e6bb8] h-24"></div>
            
            <div className="px-6 pb-6 -mt-12">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-xl">
                  {formData.foto ? (
                    <img
                      src={formData.foto}
                      alt={formData.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect fill="%23ddd" width="96" height="96"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="40" font-family="Arial"%3E' + (formData.nombre?.[0] || '?') + '%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FontAwesomeIcon icon={faUser} className="text-4xl" />
                    </div>
                  )}
                </div>
                {editing && (
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 bg-[#257CD0] text-white p-2 rounded-full shadow-lg hover:bg-[#1e6bb8] w-8 h-8 flex items-center justify-center"
                    title="Cambiar foto"
                  >
                    <FontAwesomeIcon icon={faCamera} className="text-sm" />
                  </button>
                )}
              </div>
              
              <div className="mt-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user?.nombre}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user?.rol === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user?.rol?.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user?.estado === 1
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.estado === 1 ? 'Activo' : 'Suspendido'}
                  </span>
                </div>
              </div>

              {/* Información de la cuenta */}
              <div className="mt-6 space-y-3">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Información de Cuenta</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID de Usuario</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">#{user?.id_usuario}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de Registro</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatFecha(user?.creado_en)}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Último Acceso</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatFecha(user?.ultimo_login)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {user?.descripcion && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Sobre mí</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {user?.descripcion || 'No hay descripción disponible'}
                  </p>
                </div>
              )}

              {/* Estadísticas */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Noticias</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estadisticas.total}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{estadisticas.publicadas}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Publicadas</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{estadisticas.borradores}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Borradores</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información detallada - Columna derecha */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Información General
                </h3>
                {editing && (
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                  </button>
                )}
              </div>
              
              <div className="space-y-6">{editing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-[#257CD0] focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-[#257CD0] focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FontAwesomeIcon icon={faCamera} className="mr-2 text-gray-400" />
                        Foto de Perfil (URL)
                      </label>
                      <input
                        type="url"
                        value={formData.foto}
                        onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-[#257CD0] focus:border-transparent"
                        placeholder="https://example.com/photo.jpg"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        URL de Google Drive o imagen externa
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-[#257CD0] focus:border-transparent"
                        rows="4"
                        placeholder="Breve descripción sobre ti..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">                            
                            <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                            Nombre Completo
                        </label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.nombre}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-400" />
                            Email
                        </label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        <FontAwesomeIcon icon={faCamera} className="mr-2 text-gray-400" />
                        Foto de Perfil
                      </label>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {user?.foto || 'No se ha especificado'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Descripción
                      </label>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {user?.descripcion || 'No se ha especificado'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Cambiar contraseña */}
            {editing && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                  Cambiar Contraseña
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-[#257CD0] focus:border-transparent"
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-[#257CD0] focus:border-transparent"
                      placeholder="Confirmar nueva contraseña"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  * La contraseña debe tener al menos 6 caracteres
                </p>
              </div>
            )}

            {/* Botones de acción */}
            {editing && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 font-medium"
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faTimes} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#257CD0] text-white rounded-lg hover:bg-[#1e6bb8] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} />
                          Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Últimas Noticias - Solo se muestra cuando NO está editando */}
          {!editing && (
            <div className="mt-6">
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FontAwesomeIcon icon={faNewspaper} className="text-[#257CD0]" />
                  Mis Últimas Noticias
                </h3>
                <Link
                  href="/admin/noticias"
                  className="text-sm text-[#257CD0] hover:text-[#1e6bb8] font-medium flex items-center gap-1"
                >
                  Ver todas
                  <FontAwesomeIcon icon={faEye} className="text-xs" />
                </Link>
              </div>

              {loadingNoticias ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cargando noticias...</p>
                </div>
              ) : noticias.length === 0 ? (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No has publicado ninguna noticia aún</p>
                  <Link
                    href="/admin/noticias/nueva"
                    className="inline-block mt-4 px-4 py-2 bg-[#257CD0] text-white rounded-lg hover:bg-[#1e6bb8] text-sm font-medium"
                  >
                    Crear primera noticia
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {noticias.map((noticia) => (
                    <Link
                      key={noticia.id_noticia}
                      href={`/admin/noticias/${noticia.id_noticia}`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#257CD0] hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        {noticia.imagen_principal && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                            <img
                              src={noticia.imagen_principal}
                              alt={noticia.titulo}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#257CD0] transition-colors line-clamp-2">
                              {noticia.titulo}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                              noticia.estado === 'publicada'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            }`}>
                              {noticia.estado === 'publicada' ? 'Publicada' : 'Borrador'}
                            </span>
                          </div>
                          {noticia.descripcion_corta && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {noticia.descripcion_corta}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {noticia.fecha_publicacion 
                              ? new Date(noticia.fecha_publicacion).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'Sin fecha'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
