# Arquitectura del Chat - Refactorización

## 📁 Estructura de Archivos

```
src/
├── app/chat/
│   ├── page.tsx                    # Página principal (simplificada - 400 líneas)
│   └── page_old.tsx               # Backup del código original (1034 líneas)
│
├── components/chat/
│   ├── ChatSidebar.tsx            # Barra lateral con lista de conversaciones
│   ├── ChatWindow.tsx             # Ventana de chat con mensajes
│   ├── SearchUserModal.tsx        # Modal para buscar usuarios
│   ├── CreateGroupModal.tsx       # Modal para crear grupos
│   └── GroupInfoModal.tsx         # Modal con info del grupo
│
├── hooks/chat/
│   ├── useChatCache.ts            # Hook para manejar cache localStorage
│   ├── useChatConversations.ts    # Hook para cargar y gestionar conversaciones
│   └── useChatMessages.ts         # Hook para mensajes de grupos
│
├── interfaces/chat/
│   └── index.ts                   # Interfaces TypeScript centralizadas
│
└── utils/chat/
    ├── cacheHelpers.ts            # Funciones de cache localStorage
    └── conversationHelpers.ts     # Conversión de datos backend↔frontend
```

## 🎯 Beneficios de la Refactorización

### ✅ Antes vs Después

| Aspecto                | Antes              | Después               |
| ---------------------- | ------------------ | --------------------- |
| **Líneas en page.tsx** | 1034               | ~400                  |
| **Responsabilidades**  | Todo en un archivo | Separadas por función |
| **Reusabilidad**       | Baja               | Alta                  |
| **Testabilidad**       | Difícil            | Fácil                 |
| **Mantenibilidad**     | Complicada         | Simple                |

### 📦 Separación de Responsabilidades

#### **Interfaces (`interfaces/chat/index.ts`)**

- `Message`: Estructura de un mensaje
- `Participant`: Participante de una conversación
- `Conversation`: Datos de conversación (1:1 o grupo)
- Tipos auxiliares para cache

#### **Utils (`utils/chat/`)**

- **cacheHelpers.ts**: Operaciones localStorage

  - Guardar/obtener usuarios
  - Mapeo conversación→usuario
  - Timestamps de última lectura

- **conversationHelpers.ts**: Conversión de datos
  - `convertMessage()`: Backend→Frontend
  - `convertConversation()`: Backend→Frontend
  - `convertGroupToConversation()`: Grupo→Conversación

#### **Hooks (`hooks/chat/`)**

- **useChatCache**: Encapsula operaciones de cache
- **useChatConversations**: Carga y gestión de conversaciones
- **useChatMessages**: Manejo de mensajes de grupos

#### **Page (`app/chat/page.tsx`)**

- Orquestación de hooks
- Manejo de WebSocket
- Lógica de UI y eventos

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────┐
│           page.tsx (Orquestador)            │
│  - Conecta hooks                            │
│  - Maneja WebSocket                         │
│  - Coordina UI                              │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────────┐
│  useChatCache│ │useChatConversations│
│  - localStorage│ │- Load convos     │
└──────────────┘ │- Create convos   │
                 └──────────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │ useChatMessages  │
                │ - Load messages  │
                │ - Send messages  │
                └──────────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │  conversationHelpers│
                │  - convertMessage   │
                │  - convertConversation│
                └──────────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │  Backend Service │
                │  chatService.ts  │
                └──────────────────┘
```

## 🚀 Uso de los Hooks

### useChatCache

```typescript
const cache = useChatCache();

// Guardar usuario en cache
cache.saveUserToCache(userId, { name: 'Juan', avatar: 'url' });

// Obtener usuario del cache
const user = cache.getUserFromCache(userId);

// Guardar timestamp de lectura
cache.saveLastReadTimestamp(conversationId);
```

### useChatConversations

```typescript
const {
  conversations, // Lista de conversaciones
  setConversations, // Setter para actualizar
  loading, // Estado de carga
  chatAvailable, // Chat disponible en backend
  loadConversations, // Función para recargar
  openConversation, // Crear conversación 1:1
} = useChatConversations({
  userId: user?.id,
  chatEnabled: true,
});
```

### useChatMessages

```typescript
const {
  sendGroupMessage, // Enviar mensaje a grupo
  clearLoadedFlag, // Limpiar flag de carga
} = useChatMessages({
  selectedConversationId,
  userId: user?.id,
  conversations,
  setConversations,
});
```

## 🎨 Ventajas de esta Arquitectura

### 1. **Código más Limpio**

- Cada archivo tiene una responsabilidad clara
- Fácil de navegar y entender

### 2. **Reusabilidad**

- Los hooks pueden usarse en otros componentes
- Las funciones de utils son puras y reutilizables

### 3. **Testabilidad**

- Cada función puede testearse de forma aislada
- Los hooks pueden mockearse fácilmente

### 4. **Mantenibilidad**

- Cambios localizados en archivos específicos
- Menos probabilidad de bugs al modificar

### 5. **Escalabilidad**

- Fácil agregar nuevas funcionalidades
- Estructura preparada para crecer

## 📝 Próximos Pasos (Opcionales)

1. **Tests Unitarios**: Agregar tests para hooks y utils
2. **TypeScript Estricto**: Eliminar `any` types restantes
3. **Optimizaciones**: Memoización con useMemo/useCallback
4. **Error Boundaries**: Manejo de errores más robusto
5. **Logs**: Sistema de logging centralizado

## 🔧 Cómo Revertir (si es necesario)

Si necesitas volver al código original:

```bash
cd src/app/chat
rm page.tsx
mv page_old.tsx page.tsx
```

---

**Nota**: El backup del código original está en `page_old.tsx` por si necesitas consultar algo o revertir cambios.
