// En: /components/cohorte/AvisoPageMock.tsx (CÓDIGO COMPLETO PARA MOCK)

import { useEffect, useState } from 'react';
import { getUserProfile, User } from '@/services/userService';
import ProfesorCard, { CardMensajeProps } from './AvisoCard';
import AvisoForm from './AvisoForm';

// Mock inicial de avisos
const mockedPosts: CardMensajeProps[] = [
  {
    nombre: 'Dr. Ana López',
    rol: 'Decana de Ingeniería',
    fecha: '16:45 · 2 Nov',
    titulo: 'Recordatorio: ¡Semana de Proyectos Finales!',
    mensaje: 'Estimados alumnos, les recuerdo que esta semana es crucial para sus proyectos y entregas finales. Revisen el cronograma.',
  },
  {
    nombre: 'Ing. Juan Pérez',
    rol: 'Profesor de Sistemas',
    fecha: '10:00 · 1 Nov',
    picture: 'https://th.bing.com/th/id/R.9365c9400cdc996af65266103d3edd47?rik=%2f%2bVmtH7YKdbqFQ&pid=ImgRaw&r=0',
    titulo: 'Tutorías de Algoritmos',
    mensaje: 'La sesión de tutoría se llevará a cabo por Google Meet. Favor de unirse puntualmente para revisar dudas del último parcial.',
    linkConectate: 'https://meet.google.com/abc-xyz',
  },
];

export default function AvisoPageMock() {
  const [posts, setPosts] = useState<CardMensajeProps[]>(mockedPosts);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
      } catch (err) {
        console.error('Error al cargar el perfil:', err);
      }
    };
    fetchUserProfile();
  }, []);

  const currentUserRole = user?.role;
  const isUploader = currentUserRole === 'TEACHER';

  const handleNewPost = (formData: { titulo: string; mensaje: string; linkConectate?: string }) => {
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
  };

  return (
    <>
      {isUploader && (
        <div className="mb-8 flex flex-col w-full">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Publicar Nuevo Aviso</h3>
          <AvisoForm onPost={handleNewPost} />
        </div>
      )}

      {isUploader && <hr className="my-6 border-gray-300 dark:border-gray-600" />}

      {posts.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No hay avisos publicados en este momento.</p>
      ) : (
        <div className="w-full">
          {posts.map((postItem, index) => (
            <ProfesorCard key={postItem.id || index} {...postItem} />
          ))}
        </div>
      )}
    </>
  );
}
