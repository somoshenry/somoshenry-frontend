import { useEffect, useState } from 'react';
import ProfesorCard, { CardMensajeProps } from './AvisoCard';
import AvisoForm from './AvisoForm';
import { getCohorteAnnouncements, createCohorteAnnouncement } from '@/services/cohorteService';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface AvisoPageProps {
  readonly cohorteId: string;
  readonly canPost: boolean; // Si el usuario puede publicar (TEACHER, TA, ADMIN)
  readonly currentUserId: string;
}

export default function AvisoPage({ cohorteId, canPost, currentUserId }: AvisoPageProps) {
  // 1. Estados
  const [posts, setPosts] = useState<CardMensajeProps[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Cargar anuncios
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar anuncios desde el backend
        const announcements = await getCohorteAnnouncements(cohorteId);

        // Convertir announcements a CardMensajeProps
        const mappedPosts: CardMensajeProps[] = announcements.map((ann) => ({
          id: ann.id,
          nombre: `${ann.author.name} ${ann.author.lastName}`,
          rol: getRoleLabel(ann.author.role),
          fecha: formatDate(ann.createdAt),
          titulo: ann.title,
          mensaje: ann.content,
          picture: ann.author.profilePicture || undefined,
          linkConectate: ann.linkUrl || (ann as any).linkConectate,
        }));

        setPosts(mappedPosts);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [cohorteId]);

  // Helpers
  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      TEACHER: '📚 Docente',
      ADMIN: '👑 Admin',
      TA: '🎓 TA',
      STUDENT: '👤 Estudiante',
    };
    return labels[role] || 'Miembro';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const time = date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const day = date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
    return `${time} · ${day}`;
  };

  // 4. Función de posteo
  const handleNewPost = async (formData: { titulo: string; mensaje: string; linkConectate?: string }) => {
    try {
      console.log('📤 Enviando aviso:', {
        title: formData.titulo,
        content: formData.mensaje,
      });

      const announcement = await createCohorteAnnouncement(cohorteId, {
        title: formData.titulo,
        content: formData.mensaje,
      });

      console.log('✅ Aviso creado:', announcement);

      // Agregar el nuevo post a la lista
      const nombrePost = `${announcement.author.name} ${announcement.author.lastName}`;
      const rolPost = getRoleLabel(announcement.author.role);
      const picture = announcement.author.profilePicture || './user.png';
      const fecha = formatDate(announcement.createdAt);

      const newPost: CardMensajeProps = {
        id: announcement.id,
        nombre: nombrePost,
        picture: picture,
        rol: rolPost,
        fecha: fecha,
        titulo: formData.titulo,
        mensaje: formData.mensaje,
        linkConectate: formData.linkConectate,
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } catch (error: any) {
      console.error('❌ Error al publicar aviso:', error);
      console.error('Response:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al publicar el aviso: ${errorMessage}`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando avisos...</span>
      </div>
    );
  }

  return (
    <>
      {/* 1. RENDERIZADO CONDICIONAL: Solo si puede publicar (TEACHER, TA, ADMIN) */}
      {canPost && (
        <div className="mb-8 flex flex-col w-full ">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Publicar Nuevo Aviso</h3>
          {/* El formulario llama a handleNewPost */}
          <AvisoForm onPost={handleNewPost} />
        </div>
      )}

      {/* Separador */}
      {canPost && <hr className="my-6 border-gray-300 dark:border-gray-600" />}

      {/* 2. LISTA DE AVISOS */}
      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No hay avisos publicados en este momento.</p>
      ) : (
        <div className="w-full">
          {posts.map((postItem) => (
            <ProfesorCard key={postItem.id || postItem.titulo} {...postItem} />
          ))}
        </div>
      )}
    </>
  );
}
