# 🎯 Panel de Administración - Grupo Visual

> **Sistema web de gestión de contenidos** para el sitio institucional de Grupo Visual. Construido con Next.js 16, React 19 y desplegado en Vercel.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

---

## 📚 Documentación Completa

Este proyecto cuenta con documentación exhaustiva en el directorio [`/docs`](./docs):

| Documento | Descripción |
|-----------|-------------|
| 📖 [**README.md**](./docs/README.md) | Índice general y guía de inicio |
| 🏗️ [**ARQUITECTURA.md**](./docs/ARQUITECTURA.md) | Estructura del proyecto, tecnologías y patrones |
| 🌐 [**APIS.md**](./docs/APIS.md) | Documentación completa de endpoints y consumo |
| 🔐 [**AUTENTICACION.md**](./docs/AUTENTICACION.md) | Sistema JWT, roles y seguridad |
| 🧩 [**COMPONENTES.md**](./docs/COMPONENTES.md) | Componentes reutilizables |
| ⚙️ [**FEATURES.md**](./docs/FEATURES.md) | Funcionalidades detalladas de cada módulo |
| 🚀 [**DEPLOYMENT.md**](./docs/DEPLOYMENT.md) | Configuración y despliegue en Vercel |
| 💻 [**DESARROLLO.md**](./docs/DESARROLLO.md) | Guía para desarrolladores |
| 📊 [**RESUMEN-VISUAL.md**](./docs/RESUMEN-VISUAL.md) | Diagramas y resumen ejecutivo |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+
- **npm** o **yarn**
- **Backend API** corriendo (visualcont-backend)

### Instalación

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd grupovisualcont-admin

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración

# 4. Iniciar servidor de desarrollo
npm run dev
```

El panel estará disponible en **http://localhost:3000**

### Variables de Entorno

Crear archivo `.env.local` con:

```env
# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Credenciales de Prueba

```
Email: admin@visualcont.com
Password: [consultar con el equipo]
```

---

## 🏗️ Tecnologías Principales

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 16.1.4 | Framework React con App Router |
| **React** | 19.2.3 | Librería UI |
| **TailwindCSS** | 3.4.17 | Framework CSS utility-first |
| **TinyMCE** | 6.3.0 | Editor WYSIWYG para contenido |
| **FontAwesome** | 7.1.0 | Iconografía |
| **jose** | 6.1.3 | Manejo de JWT |
| **React Hook Form** | 7.71.1 | Gestión de formularios |
| **Zod** | 4.1.8 | Validación de esquemas |

---

## 📱 Módulos del Sistema

- **🏠 Dashboard** - Vista general con estadísticas
- **📰 Noticias** - CRUD completo con editor rich text
- **💬 Comentarios** - Sistema de moderación
- **📁 Categorías** - Gestión de categorías
- **🔑 Keywords** - Keywords SEO
- **📄 Page Keywords** - Asignación de keywords por página
- **👥 Usuarios** - Gestión de usuarios (solo admin)

Cada módulo está documentado en detalle en [FEATURES.md](./docs/FEATURES.md).

---

## 🌐 URLs del Sistema

### Producción
- **Frontend**: https://admin.visualcont.com
- **Backend API**: https://api.visualcont.com

### Desarrollo
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

---

## 📁 Estructura del Proyecto

```
grupovisualcont-admin/
├── docs/                  # 📚 Documentación completa
├── public/                # Archivos estáticos
├── src/
│   ├── app/              # App Router de Next.js
│   │   ├── admin/        # Rutas del panel admin
│   │   │   ├── page.js   # Login
│   │   │   ├── layout.js # Layout con sidebar
│   │   │   ├── dashboard/
│   │   │   ├── noticias/
│   │   │   ├── comentarios/
│   │   │   ├── categorias/
│   │   │   ├── keywords/
│   │   │   ├── page-keywords/
│   │   │   └── usuarios/
│   │   ├── layout.js     # Layout raíz
│   │   └── page.js       # Redirect a /admin
│   ├── components/       # Componentes reutilizables
│   │   └── admin/
│   ├── lib/              # Utilidades
│   │   └── authUtils.js  # Auth helpers
│   └── utils/            # Helpers generales
├── .env.local            # Variables de entorno
├── next.config.mjs       # Config Next.js
├── tailwind.config.js    # Config Tailwind
└── package.json
```

Ver [ARQUITECTURA.md](./docs/ARQUITECTURA.md) para más detalles.

---

## 🛠️ Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Compilar para producción
npm run start    # Ejecutar versión compilada
npm run lint     # Linter ESLint
```

---

## 🔐 Autenticación

El sistema usa **JWT (JSON Web Tokens)** almacenados en `localStorage`:

1. Usuario ingresa credenciales en `/admin`
2. Backend valida y retorna token JWT
3. Token se guarda en `localStorage`
4. Todas las peticiones incluyen token en headers
5. Token expira en 20 horas

Ver [AUTENTICACION.md](./docs/AUTENTICACION.md) para flujos completos.

---

## 🌐 Consumo de APIs

Todas las peticiones usan el helper `authFetch`:

```javascript
import { authFetch } from '@/lib/authUtils';

// GET request
const res = await authFetch('/api/noticias');
const data = await res.json();

// POST request
const res = await authFetch('/api/noticias', {
  method: 'POST',
  body: JSON.stringify({ titulo: '...' })
});
```

Ver [APIS.md](./docs/APIS.md) para documentación completa de endpoints.

---

## 🚀 Deploy en Vercel

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar variable de entorno:
   - `NEXT_PUBLIC_API_URL` = URL del backend
3. Deploy automático en cada push a `main`

Ver [DEPLOYMENT.md](./docs/DEPLOYMENT.md) para guía completa.

---

## 👥 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total + gestión de usuarios |
| **editor** | CRUD noticias, categorías, keywords, comentarios |

---

## 🧩 Componentes Principales

### Pagination
```javascript
import Pagination from '@/components/admin/Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
```

### TinyMCE Editor
```javascript
import dynamic from 'next/dynamic';

const TinyMCEEditor = dynamic(
  () => import('@/components/admin/TinyMCEEditor'),
  { ssr: false }
);

<TinyMCEEditor
  value={contenido}
  onChange={setContenido}
  height={500}
/>
```

Ver [COMPONENTES.md](./docs/COMPONENTES.md) para más detalles.

---

## 🔧 Desarrollo

### Agregar Nueva Página

1. Crear archivo en `src/app/admin/nueva-seccion/page.js`
2. Agregar ruta al sidebar en `src/app/admin/layout.js`
3. Implementar CRUD usando `authFetch`

Ver [DESARROLLO.md](./docs/DESARROLLO.md) para guía completa.

---

## 📊 Características Destacadas

- ✅ **Editor WYSIWYG** completo con TinyMCE
- ✅ **Generación de Keywords con IA** (Gemini)
- ✅ **Búsqueda en tiempo real** con autocompletado
- ✅ **Paginación avanzada** responsive
- ✅ **Dark mode ready** (preparado para implementar)
- ✅ **Actualización optimista** de estado
- ✅ **Sidebar colapsable** y responsive

---

## 🐛 Troubleshooting

### Build falla
```bash
rm -rf .next node_modules
npm install
npm run build
```

### APIs no responden
- Verificar `NEXT_PUBLIC_API_URL` en `.env.local`
- Verificar que backend esté corriendo
- Verificar CORS en backend

### Token expirado
- El token dura 20 horas
- Volver a iniciar sesión
- Se redirige automáticamente al login

---

## 📞 Soporte

- **Documentación**: Ver carpeta `/docs`
- **Issues**: Crear issue en el repositorio
- **Email**: desarrollo@visualcont.com

---

## 📄 Licencia

© 2024 Grupo Visual. Todos los derechos reservados.  
Sistema de uso interno.

---

**Versión**: 1.0.0  
**Última actualización**: Febrero 2026  
**Mantenido por**: Equipo de Desarrollo Visual

---

## 📖 Siguientes Pasos

1. **Nuevos desarrolladores**: Leer [docs/README.md](./docs/README.md)
2. **Arquitectura técnica**: Ver [docs/ARQUITECTURA.md](./docs/ARQUITECTURA.md)
3. **APIs**: Consultar [docs/APIS.md](./docs/APIS.md)
4. **Deploy**: Seguir [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
