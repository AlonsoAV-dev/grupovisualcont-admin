'use client';
import { useEffect } from 'react';

export default function AdminLogin() {
  useEffect(() => {
    // Redirigir INMEDIATAMENTE a noticias (sin login disponible)
    window.location.href = '/noticias';
  }, []);

  return null;
}

