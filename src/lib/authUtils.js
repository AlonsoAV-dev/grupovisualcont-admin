/**
 * authFetch - Wrapper para fetch con autenticación automática
 * Añade el token JWT automáticamente a las peticiones
 */
export async function authFetch(url, options = {}) {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth_token') 
    : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    // Si el token expiró (401), redirigir a login
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      window.location.href = '/admin';
    }

    return response;
  } catch (error) {
    console.warn('⚠️ Backend no disponible:', error.message);
    // Retornar un response falso para no romper el flujo
    return {
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ error: 'Backend no disponible', message: error.message }),
      text: async () => 'Backend no disponible',
    };
  }
}

/**
 * Verificar si el usuario está autenticado
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}

/**
 * Obtener el token actual
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Guardar el token
 */
export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

/**
 * Eliminar el token (logout)
 */
export function removeToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

/**
 * Decodificar JWT (solo en el cliente)
 */
export function decodeToken() {
  if (typeof window === 'undefined') return null;
  const token = getToken();
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
}

/**
 * Obtener información del usuario actual desde el token
 */
export function getCurrentUser() {
  const decoded = decodeToken();
  if (!decoded) return null;
  
  // Normalizar id_usuario (puede venir como "id" o "id_usuario")
  const id_usuario = decoded.id_usuario || decoded.id;
  
  return {
    id_usuario: id_usuario,
    id: id_usuario, // Incluir ambos para compatibilidad
    rol: decoded.rol,
    email: decoded.email,
    nombre: decoded.nombre,
  };
}

/**
 * Verificar si el usuario tiene permiso para editar una noticia
 * 
 * IMPORTANTE: La API debe devolver el id_usuario del autor para que funcione correctamente.
 * La API debe incluir en las respuestas: autor_id_usuario o id_usuario (del autor)
 */
export function canEditNoticia(noticia, user) {
  if (!user || !noticia) {
    console.log('❌ canEditNoticia: user o noticia es null', { user, noticia });
    return false;
  }
  
  // Admin puede editar cualquier noticia
  if (user.rol === 'admin') {
    console.log('✅ canEditNoticia: Usuario es admin');
    return true;
  }
  
  // Editor: verificar si es el autor de la noticia
  if (user.rol === 'editor') {
    // Buscar el id_usuario del autor en diferentes campos posibles
    const autorIdUsuario = 
      noticia.autor?.id_usuario ||      // Si la API devuelve objeto autor completo
      noticia.autor_id_usuario ||        // Si la API devuelve autor_id_usuario directamente
      noticia.id_usuario;                // Si la API devuelve id_usuario directamente
    
    console.log('🔍 canEditNoticia DEBUG:', {
      'user.id_usuario': user.id_usuario,
      'user.id_usuario (type)': typeof user.id_usuario,
      'noticia.autor_id_usuario': noticia.autor_id_usuario,
      'noticia.autor_id_usuario (type)': typeof noticia.autor_id_usuario,
      'autorIdUsuario': autorIdUsuario,
      'autorIdUsuario (type)': typeof autorIdUsuario,
      'comparacion ==': autorIdUsuario == user.id_usuario,
      'comparacion ===': autorIdUsuario === user.id_usuario,
      'noticia completa': noticia
    });
    
    if (autorIdUsuario) {
      // Comparar con conversión de tipos para evitar problemas string vs number
      return Number(autorIdUsuario) === Number(user.id_usuario);
    }
    
    // Si no hay información del autor, no puede editar (por seguridad)
    console.warn('⚠️ La noticia no incluye id_usuario del autor. La API debe incluir este campo.');
    return false;
  }
  
  console.log('❌ canEditNoticia: Rol no reconocido', { rol: user.rol });
  return false;
}

/**
 * Verificar si el usuario puede eliminar una noticia
 */
export function canDeleteNoticia(noticia, user) {
  return canEditNoticia(noticia, user);
}

/**
 * Verificar si el usuario puede eliminar un comentario
 * 
 * IMPORTANTE: La API debe devolver el noticia_id_usuario para que funcione correctamente.
 */
export function canDeleteComentario(comentario, user) {
  if (!user || !comentario) return false;
  
  // Admin puede eliminar cualquier comentario
  if (user.rol === 'admin') return true;
  
  // Editor solo puede eliminar comentarios de sus propias noticias
  if (user.rol === 'editor') {
    // Buscar el id_usuario de la noticia en diferentes campos posibles
    const noticiaIdUsuario = 
      comentario.noticia?.id_usuario ||      // Si la API devuelve objeto noticia completo
      comentario.noticia_id_usuario;         // Si la API devuelve noticia_id_usuario directamente
    
    if (noticiaIdUsuario) {
      // Comparar con conversión de tipos
      return Number(noticiaIdUsuario) === Number(user.id_usuario);
    }
    
    // Si no hay información, no puede eliminar (por seguridad)
    console.warn('⚠️ El comentario no incluye noticia_id_usuario. La API debe incluir este campo.');
    return false;
  }
  
  return false;
}

/**
 * Verificar si el usuario puede moderar un comentario (aprobar/rechazar/spam)
 * Mismos permisos que eliminar
 */
export function canModerateComentario(comentario, user) {
  return canDeleteComentario(comentario, user);
}

/**
 * Verificar si el usuario es admin
 */
export function isAdmin(user) {
  return user && user.rol === 'admin';
}

/**
 * Manejar errores de permisos
 */
export function handlePermissionError(response, fallbackMessage = 'No tienes permisos para realizar esta acción.') {
  if (response.status === 403) {
    alert(fallbackMessage);
    return true;
  }
  return false;
}
