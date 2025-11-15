// En: /components/cohorte/AvisoPage.tsx (INTEGRADO CON BACKEND)

import { useEffect, useState } from 'react';
import { getCohorteAnnouncements, createCohorteAnnouncement, deleteCohorteAnnouncement, togglePinAnnouncement, CohorteAnnouncement } from '@/services/cohorteService';
import ProfesorCard, { CardMensajeProps } from './ProfesorCard';
import AvisoForm from './AvisoForm';
import { useAuth } from '@/hook/useAuth';
import { useCohorteAnnouncements } from '@/hook/useCohorteAnnouncements';
import { tokenStore } from '@/services/tokenStore';

// Mock inicial de avisos (solo para cohorte mock)
const mockedPosts: CardMensajeProps[] = [
  {
    nombre: 'Dr. Ana López',
    rol: 'Decana de Ingeniería',
    fecha: '16:45 · 2 Nov', // 🚨 CASO 1: Prueba de imagen faltante (Mostrará las iniciales "DA")
    titulo: 'Recordatorio: ¡Semana de Proyectos Finales!',
    mensaje: 'Estimados alumnos, les recuerdo que esta semana es crucial para sus proyectos y entregas finales. Revisen el cronograma.',
  },
  {
    nombre: 'Ing. Juan Pérez',
    rol: 'Profesor de Sistemas',
    fecha: '10:00 · 1 Nov', // 🚨 CASO 2: Prueba de imagen existente (Mostrará esta imagen)
    picture: 'https://th.bing.com/th/id/R.9365c9400cdc996af65266103d3edd47?rik=%2f%2bVmtH7YKdbqFQ&pid=ImgRaw&r=0',
    titulo: 'Tutorías de Algoritmos',
    mensaje: 'La sesión de tutoría se llevará a cabo por Google Meet. Favor de unirse puntualmente para revisar dudas del último parcial.',
    linkConectate: 'https://meet.google.com/abc-xyz', // Prueba de link
  },
  {
    nombre: 'Lic. María G.',
    rol: 'Coordinadora Académica',
    fecha: '08:30 · 29 Oct', // 🚨 CASO 3: Prueba de mensaje largo con saltos de línea y link
    titulo: 'Aviso Importante: Plazo de Becas',
    mensaje:
      'Les recordamos de la manera más atenta y urgente que el plazo límite e improrrogable para la entrega y carga de la documentación requerida para las becas finaliza el próximo viernes a las [Añadir una hora específica si la hay, por ejemplo: 23:59 horas (GMT-5)].\n\n Es fundamental que se aseguren de que todos los archivos (incluyendo formularios, comprobantes académicos, cartas de recomendación y cualquier otro requisito detallado en la convocatoria) sean subidos correctamente al portal oficial antes de que concluya esta fecha. Les instamos a no dejar este proceso para el último momento, ya que el sistema podría presentar saturación o inconvenientes técnicos de último minuto que no serán considerados como excusa válida. .',
    linkConectate: 'https://www.ucm.es/becas-ayudas',
  },
  {
    nombre: 'Dr. Carlos Ruiz',
    rol: 'Decano de Arquitectura',
    fecha: '12:00 · 28 Oct', // 🚨 CASO 4: Prueba de imagen faltante (Mostrará las iniciales "DC")
    titulo: 'Horarios de Exámenes Finales',
    mensaje: 'Los horarios de los exámenes finales ya están disponibles en el sistema. Planifiquen sus estudios con anticipación.',
  },
];

interface AvisoPageProps {
  readonly cohorteId?: string; // Opcional: si no existe, usa mocks
}

export default function AvisoPage({ cohorteId }: Readonly<AvisoPageProps>) {
  // 1. Estados
  const [posts, setPosts] = useState<CardMensajeProps[]>([]);
  const [announcements, setAnnouncements] = useState<CohorteAnnouncement[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // WebSocket para announcements en tiempo real
  const token = tokenStore.getAccess();
  const { isConnected, onNewAnnouncement } = useCohorteAnnouncements({
    cohorteId: cohorteId || null,
    token,
    enabled: !!cohorteId,
  });

  // Escuchar nuevos anuncios por WebSocket
  useEffect(() => {
    if (!cohorteId) return;

    const unsubscribe = onNewAnnouncement((newAnnouncement) => {
      // Verificar que no esté ya en la lista (evitar duplicados)
      setAnnouncements((prev) => {
        const exists = prev.some((a) => a.id === newAnnouncement.id);
        if (exists) return prev;

        return [newAnnouncement, ...prev];
      });
    });

    return unsubscribe;
  }, [cohorteId, onNewAnnouncement]);

  // 2. Cargar anuncios desde API o usar mocks
  useEffect(() => {
    const loadAnnouncements = async () => {
      if (cohorteId) {
        // Cargar desde API
        try {
          setLoading(true);
          const data = await getCohorteAnnouncements(cohorteId);
          setAnnouncements(data);
        } catch (error) {
          console.error('Error al cargar anuncios:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Usar mocks para cohorte mock
        setPosts(mockedPosts);
      }
    };
    loadAnnouncements();
  }, [cohorteId]);

  // 3. Lógica de Rol
  const currentUserRole = user?.role;
  // isUploader es true si el usuario es TEACHER o ADMIN
  const isUploader = currentUserRole === 'TEACHER' || currentUserRole === 'ADMIN';

  // 4. Función de posteo
  const handleNewPost = async (formData: { titulo: string; mensaje: string }) => {
    if (cohorteId) {
      // Usar API real
      try {
        const newAnnouncement = await createCohorteAnnouncement(cohorteId, {
          title: formData.titulo,
          content: formData.mensaje,
        });
        setAnnouncements((prev) => [newAnnouncement, ...prev]);
      } catch (error) {
        console.error('Error al crear anuncio:', error);
        alert('Error al crear el anuncio. Por favor intenta de nuevo.');
      }
    } else {
      // Usar lógica mock
      const nombrePost = `${user?.name || ''} ${user?.lastName || 'Docente'}`.trim() || 'Usuario Desconocido';
      const rolPost = currentUserRole === 'TEACHER' ? '📚 Docente' : 'Colaborador';
      const picture = user?.profilePicture || './user.png';

      const formattedDate =
        new Date().toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }) +
        ' · ' +
        new Date().toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        });

      const newPost: CardMensajeProps = {
        ...formData,
        nombre: nombrePost,
        picture: picture,
        rol: rolPost,
        fecha: formattedDate,
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
  };

  // 5. Función para fijar/desfijar anuncio
  const handlePinAnnouncement = async (announcementId: string) => {
    if (!cohorteId) return;

    try {
      const updated = await togglePinAnnouncement(cohorteId, announcementId);
      setAnnouncements((prev) => prev.map((a) => (a.id === announcementId ? { ...a, pinned: updated.pinned } : a)));
    } catch (error) {
      console.error('Error al fijar/desfijar anuncio:', error);
      alert('Error al fijar el anuncio. Por favor intenta de nuevo.');
    }
  };

  // 6. Función para eliminar anuncio
  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!cohorteId) return;

    try {
      await deleteCohorteAnnouncement(cohorteId, announcementId);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      alert('Error al eliminar el anuncio. Por favor intenta de nuevo.');
    }
  };

  // Convertir announcements a CardMensajeProps
  const announcementsToPosts = (announcements: CohorteAnnouncement[]): CardMensajeProps[] => {
    return announcements.map((a) => {
      const formattedDate =
        new Date(a.createdAt).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }) +
        ' · ' +
        new Date(a.createdAt).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        });

      return {
        nombre: `${a.author.name} ${a.author.lastName}`,
        rol: a.author.role === 'TEACHER' ? '📚 Docente' : 'Administrador',
        picture: a.author.profilePicture,
        fecha: formattedDate,
        titulo: a.title,
        mensaje: a.content,
      };
    });
  };

  const displayPosts = cohorteId ? announcementsToPosts(announcements) : posts;

  return (
    <>
      {/* 1. RENDERIZADO CONDICIONAL: Solo si es TEACHER o ADMIN */}
      {isUploader && (
        <div className="mb-8 flex flex-col w-full ">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Publicar Nuevo Aviso</h3>
          <AvisoForm onPost={handleNewPost} />
        </div>
      )}

      {/* Separador */}
      {isUploader && <hr className="my-6 border-gray-300 dark:border-gray-600" />}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 2. LISTA DE AVISOS */}
      {!loading && displayPosts.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No hay avisos publicados en este momento.</p>
      ) : (
        <div className="w-full">
          {cohorteId
            ? announcements.map((announcement) => {
                const formattedDate =
                  new Date(announcement.createdAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }) +
                  ' · ' +
                  new Date(announcement.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  });

                return (
                  <ProfesorCard
                    key={announcement.id}
                    nombre={`${announcement.author.name} ${announcement.author.lastName}`}
                    rol={announcement.author.role === 'TEACHER' ? '📚 Docente' : 'Administrador'}
                    picture={announcement.author.profilePicture}
                    fecha={formattedDate}
                    titulo={announcement.title}
                    mensaje={announcement.content}
                    pinned={announcement.pinned}
                    announcementId={announcement.id}
                    authorId={announcement.author.id}
                    currentUserId={user?.id}
                    isAdmin={currentUserRole === 'ADMIN'}
                    onPin={handlePinAnnouncement}
                    onDelete={handleDeleteAnnouncement}
                  />
                );
              })
            : posts.map((postItem) => <ProfesorCard key={`${postItem.nombre}-${postItem.titulo}-${postItem.fecha}`} {...postItem} />)}
        </div>
      )}
    </>
  );
}
