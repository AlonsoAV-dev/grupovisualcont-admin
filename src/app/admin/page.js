'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log(' Verificando auth, token:', token ? 'Existe' : 'No existe');
    if (token) {
      router.push('/admin/dashboard');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgba(30,77,142,1)] dark:bg-[rgba(20,55,100,1)]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-white text-lg font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      console.log(' Intentando login con:', { email, apiUrl: apiUrl + '/api/auth/login' });

      const response = await fetch(apiUrl + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log(' Respuesta del servidor:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      const data = await response.json();
      console.log(' Datos recibidos:', data);

      if (response.ok && data.token) {
        console.log(' Login exitoso, guardando token y redirigiendo...');
        localStorage.setItem('auth_token', data.token);
        router.push('/admin/dashboard');
      } else {
        console.log(' Login fallido:', data.message);
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error(' Error de login:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(30,77,142,1)] dark:bg-[rgba(20,55,100,1)] px-4 py-8">
<div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch overflow-hidden rounded-3xl shadow-2xl">
<div className="flex-1 bg-white/5 backdrop-blur-sm border-r-0 lg:border-r-2 border-white/20 p-8 lg:p-12 text-center flex flex-col justify-center items-center">
          <div className="space-y-6">
            <div className="inline-block lg:block">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 inline-flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <img
                    src="/favicon.ico"
                    alt="favicon"
                    className="w-5 h-5"
                  />
                </div>
                <span className="text-white font-semibold text-sm">Grupo VisualCont</span>
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">Bienvenido!
            </h1>
            <div className="space-y-2">
              <p className="text-xl text-white/90 font-medium">Ingresa</p>
              <p className="text-white/70 text-base max-w-md mx-auto lg:mx-0">Estás a solo un paso del panel.</p>
            </div>
            <div className="pt-8">
              <p className="text-white/60 text-sm mb-4">¿No tienes una cuenta?</p>
              <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full hover:bg-white/10 transition-all duration-300 font-medium">Regístrate</button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-auto lg:min-w-[480px] bg-white p-8 lg:p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="block w-full px-4 py-3.5 border-b-2 border-gray-200 focus:border-[rgba(30,77,142,1)] focus:outline-none bg-transparent text-gray-900 transition-colors placeholder:text-gray-400" placeholder="kabbolliate@gmail.com" disabled={loading} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">Contraseña</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="block w-full px-4 py-3.5 border-b-2 border-gray-200 focus:border-[rgba(30,77,142,1)] focus:outline-none bg-transparent text-gray-900 transition-colors placeholder:text-gray-400 pr-12" placeholder="" disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors" disabled={loading}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[rgba(30,77,142,1)] focus:ring-[rgba(30,77,142,1)]" />
                <span className="text-gray-600">Mantener sesión iniciada</span>
              </label>
              <a href="#" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">¿Olvidaste tu contraseña?</a>
            </div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm">
                <p className="font-medium">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-[rgba(30,77,142,1)] hover:bg-[rgba(25,65,120,1)] text-white font-semibold py-4 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl mt-8">
              {loading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Iniciando sesión...</>) : ('Iniciar Sesión')}
            </button>
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">O, usa redes sociales para iniciar sesión</span></div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-md hover:shadow-lg" disabled={loading}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></button>
                <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full bg-sky-500 hover:bg-sky-600 text-white transition-colors shadow-md hover:shadow-lg" disabled={loading}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg></button>
                <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors shadow-md hover:shadow-lg" disabled={loading}><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
