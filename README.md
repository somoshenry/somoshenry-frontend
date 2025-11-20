# 🎓 SomosHenry - Frontend

**Plataforma educativa integral para la comunidad Henry** - Red social, gestión de cohortes, sistema de suscripciones y videollamadas en tiempo real.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Client-010101?logo=socket.io)](https://socket.io/)

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Módulos Principales](#-módulos-principales)
- [Deployment](#-deployment)
- [Equipo](#-equipo)

---

## ✨ Características Principales

### 🌐 **Red Social Educativa**

- Sistema de publicaciones (texto, imágenes, videos)
- Interacciones: likes, comentarios, respuestas anidadas
- Sistema de seguimiento entre usuarios
- Feed personalizado en tiempo real

### 👥 **Gestión de Cohortes**

- Asignación automática de estudiantes, profesores y TAs
- Tablero de anuncios por cohorte
- Sistema de materiales educativos (PDFs, videos, enlaces)
- Gestión de clases programadas (Hands On / SUP)
- Lecturas asignadas por módulo

### 💬 **Sistema de Chat en Tiempo Real**

- Chat directo 1:1
- Grupos privados y públicos
- Notificaciones en tiempo real con WebSocket
- Indicadores de mensajes no leídos
- Persistencia de historial de mensajes

### 📹 **Videollamadas Grupales (BETA)**

- Creación de salas de videollamada
- Video/audio en tiempo real con WebRTC
- Chat integrado durante la llamada
- Control de cámara y micrófono
- Compartir pantalla

### 💳 **Sistema de Suscripciones**

- 3 planes: Bronce, Plata, Oro
- Integración con MercadoPago
- Dashboard de métricas para administradores
- Gestión automática de renovaciones

### 🔔 **Notificaciones Inteligentes**

- Notificaciones en tiempo real (likes, comentarios, seguimientos)
- Notificaciones de asignación a cohortes
- Alertas de nuevos materiales y anuncios
- Sistema de badges para notificaciones no leídas

### 🛡️ **Moderación y Seguridad**

- Sistema de reportes de usuarios/contenido
- Dashboard de administración
- Gestión de usuarios (activar/suspender/eliminar)
- Auditoría de acciones administrativas

---

## 🛠️ Tecnologías

### **Core**

- **Next.js 16.0** - Framework React con Server Components y App Router
- **TypeScript 5.0** - Tipado estático para mayor robustez
- **TailwindCSS 3.4** - Utilidades CSS para diseño responsive

### **Estado y Comunicación**

- **React Context API** - Manejo global de estado (Auth, Notificaciones, Posts)
- **Socket.io Client** - Comunicación en tiempo real con WebSocket
- **Axios** - Cliente HTTP para API REST

### **Multimedia y UI**

- **WebRTC (Simple-peer)** - Videollamadas peer-to-peer
- **Cloudinary** - Gestión de imágenes y videos
- **Lucide React** - Sistema de iconos moderno
- **SweetAlert2** - Modales y alertas elegantes

### **Utilidades**

- **ESLint** - Linter con reglas estrictas de Next.js
- **Prettier** - Formateo automático de código
- **Vercel** - Deployment y CI/CD automatizado

---

## 📦 Requisitos Previos

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

---

## 🚀 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/somoshenry/somoshenry-frontend.git

# Navegar al directorio
cd somoshenry-frontend

# Instalar dependencias
npm install
```

---

## ⚙️ Configuración

Crear archivo `.env` en la raíz del proyecto:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# WebSocket Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_public_key

# Google OAuth (opcional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📁 Estructura del Proyecto

```
somoshenry-frontend/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── admin/             # Panel de administración
│   │   ├── chat/              # Mensajería
│   │   ├── cohorte/           # Gestión de cohortes
│   │   ├── home/              # Feed principal
│   │   ├── live/              # Videollamadas
│   │   ├── planes/            # Suscripciones
│   │   └── profile/           # Perfil de usuario
│   │
│   ├── components/            # Componentes reutilizables
│   │   ├── admin/            # Componentes de administración
│   │   ├── chat/             # UI de chat
│   │   ├── cohorte/          # UI de cohortes
│   │   ├── common/           # Componentes compartidos
│   │   ├── home/             # Feed y posts
│   │   ├── LiveClass/        # Videollamadas
│   │   ├── nav/              # Navegación
│   │   └── sidebar/          # Barra lateral
│   │
│   ├── context/              # React Context providers
│   │   ├── AuthContext.tsx   # Autenticación global
│   │   ├── NotificationContext.tsx
│   │   ├── PostContext.tsx
│   │   └── ChatContext.tsx
│   │
│   ├── services/             # Servicios API
│   │   ├── api.ts           # Cliente Axios configurado
│   │   ├── authService.ts   # Autenticación
│   │   ├── chatService.ts   # Mensajería
│   │   ├── cohorteService.ts # Cohortes
│   │   ├── postService.ts   # Publicaciones
│   │   └── ...
│   │
│   ├── hook/                 # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   ├── useWebRTC.ts
│   │   └── ...
│   │
│   ├── interfaces/           # TypeScript interfaces
│   └── utils/               # Utilidades y helpers
│
├── public/                   # Archivos estáticos
├── .env                     # Variables de entorno
├── next.config.ts           # Configuración de Next.js
├── tailwind.config.ts       # Configuración de Tailwind
└── tsconfig.json            # Configuración de TypeScript
```

---

## 📜 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor en http://localhost:3000

# Producción
npm run build           # Compila para producción
npm run start           # Inicia servidor de producción

# Calidad de código
npm run lint            # Ejecuta ESLint
npm run lint:fix        # Corrige errores automáticamente
```

---

## 🎯 Módulos Principales

### **Autenticación**

- Login con email/contraseña
- Registro con validación de campos
- Autenticación con Google OAuth
- Tokens JWT con refresh automático
- Rutas protegidas por rol (ADMIN, TEACHER, TA, MEMBER)

### **Cohortes**

```typescript
// Servicios principales
getMyCohortes(); // Obtener cohortes del usuario
getCohorteById(id); // Detalles de una cohorte
addUserToCohorte(); // Asignar usuario a cohorte
getCohorteAnnouncements(); // Anuncios de la cohorte
createCohorteAnnouncement(); // Crear anuncio
getMaterials(); // Obtener materiales
uploadMaterial(); // Subir material
getClassesByCohorte(); // Clases programadas
```

### **Chat y Notificaciones**

```typescript
// WebSocket Events
socket.on('message:received'); // Nuevo mensaje
socket.on('notification:new'); // Nueva notificación
socket.on('notification:cohorte_assigned'); // Asignación a cohorte
```

### **Videollamadas (WebRTC)**

```typescript
// Hook principal
const { localStream, peers, startCall, leaveCall, toggleAudio, toggleVideo } = useWebRTC(roomId);
```

---

## 🚢 Deployment

### **Vercel (Recomendado)**

```bash
# Deployment automático conectado a GitHub
# Push a rama 'dev' → despliega automáticamente
git push origin dev
```

### **Variables de entorno en Vercel**

Agregar todas las variables del `.env` en el dashboard de Vercel.

---

## 👥 Equipo

Desarrollado por el equipo **SomosHenry** para la comunidad Henry.

**Contributors:**

- Rotceh Figueroa - Full Stack Developer
- Mauro Abel Casado - Full Stack Developer
- Martín Cano - Full Stack Developer

## 📄 Licencia

Este proyecto es privado y pertenece a la organización SomosHenry.

---

## 🔗 Enlaces

- **Backend Repository:** [somoshenry-backend](https://github.com/somoshenry/somoshenry-backend)
- **Deployment:** [somos-henry.com](https://somos-henry.com)
- **Documentación API:** [API Docs](https://api.somos-henry.com/docs)

---

**¡Construido con ❤️ para la comunidad Henry!**
