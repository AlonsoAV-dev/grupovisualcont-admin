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
