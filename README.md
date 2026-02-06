# 🎯 ADMIN PANEL - GRUPO VISUAL

Panel de administración para la gestión de contenidos del sitio web de Grupo Visual.

## 📁 Estructura del Proyecto

```
grupovisualcont-admin/
├── src/
│   ├── app/
│   │   ├── admin/                  # Rutas del administrador
│   │   │   ├── page.js            # Login
│   │   │   ├── layout.js          # Layout del admin
│   │   │   ├── dashboard/
│   │   │   ├── noticias/
│   │   │   ├── categorias/
│   │   │   ├── keywords/
│   │   │   ├── page-keywords/
│   │   │   ├── comentarios/
│   │   │   └── usuarios/
│   │   ├── layout.js              # Layout raíz
│   │   ├── page.js                # Página de inicio
│   │   └── globals.css            # Estilos globales
│   ├── components/
│   │   └── admin/                 # Componentes del admin
│   ├── lib/
│   │   └── authUtils.js           # Utilidades de autenticación
│   └── utils/
│       └── htmlUtils.js           # Utilidades HTML
├── public/
│   └── images/
├── .env.local                     # Variables de entorno
├── next.config.mjs
├── tailwind.config.js
├── package.json
└── jsconfig.json
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Edita el archivo `.env.local` con tus valores:

```env
# Base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=visual_erp
DB_PORT=3306

# JWT para autenticación
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion_minimo_32_caracteres

# URL del backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Entorno
NODE_ENV=development

# TinyMCE API Key (opcional)
NEXT_PUBLIC_TINYMCE_API_KEY=tu_api_key_de_tinymce
```

### 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

El servidor estará disponible en: http://localhost:3002

### 4. Compilar para producción

```bash
npm run build
npm start
```

## 📦 Dependencias Principales

- **Next.js 16.1.4** - Framework React con SSR
- **React 19** - Biblioteca UI
- **TailwindCSS 3.4.1** - Framework CSS
- **TinyMCE** - Editor WYSIWYG
- **MySQL2** - Cliente de base de datos
- **bcryptjs** - Hash de contraseñas
- **jsonwebtoken** - Autenticación JWT
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas
- **Lucide React** - Iconos

## 🔐 Características de Seguridad

- Autenticación basada en JWT
- Tokens almacenados en localStorage
- Redirección automática en caso de token expirado
- Middleware de autenticación en todas las peticiones API

## 🛠️ Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo (puerto 3002)
- `npm run build` - Compilar para producción
- `npm start` - Ejecutar versión de producción (puerto 3002)
- `npm run lint` - Ejecutar linter ESLint

## 📝 Notas Importantes

1. Este proyecto **NO usa `output: 'export'`** porque necesita Server-Side Rendering (SSR)
2. El puerto por defecto es **3002** para no conflictar con otros servicios
3. El backend API debe estar corriendo en el puerto configurado en `NEXT_PUBLIC_API_URL`
4. Asegúrate de tener Node.js 18+ instalado

## 🔧 Configuración Adicional

### Alias de importación

El proyecto está configurado con el alias `@/` para importar desde `src/`:

```javascript
import { authFetch } from '@/lib/authUtils';
import { decodeHTMLEntities } from '@/utils/htmlUtils';
```

### TailwindCSS

El color primario está configurado como `#257CD0`. Puedes usarlo así:

```jsx
<div className="bg-primary text-white">...</div>
```

## 📞 Soporte

Para problemas o dudas, contacta al equipo de desarrollo.

---

**Versión:** 0.1.0  
**Última actualización:** Febrero 2026
