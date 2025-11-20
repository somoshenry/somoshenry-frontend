import { useEffect, useState } from 'react';
import ClaseCard, { CardMensajeProps } from './ClaseCard';
import ClassProgramar, { cardDataProps, UserInfo } from './ClassProgramar';
import { getUserProfile, User } from '@/services/userService';
import { getClassesByCohorte, createClass, CreateClassDto } from '@/services/cohorteService';

interface ClaseHangProps {
  theme: 'hang' | 'sub';
  cohorteId: string;
}
type PublishedCard = CardMensajeProps;

const ClassSub: React.FC<ClaseHangProps> = ({ theme, cohorteId }) => {
  const [backendClasses, setBackendClasses] = useState<PublishedCard[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [savingClass, setSavingClass] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [publishedCards, setPublishedCards] = useState<PublishedCard[]>([]);

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

  // Cargar clases desde el backend
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const classes = await getClassesByCohorte(cohorteId);

        // Convertir CohorteClass a CardMensajeProps
        const mappedClasses: PublishedCard[] = classes.map((cls) => ({
          name: cls.teacher?.name || 'Instructor',
          rol: 'TEACHER',
          picture: cls.teacher?.profilePicture || undefined,
          date: new Date(cls.scheduledDate || cls.createdAt).toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          }),
          time: new Date(cls.scheduledDate || cls.createdAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          title: cls.name, // Backend usa 'name'
          datePublished: new Date(cls.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          description: cls.description || '',
          linkConectate: cls.meetingUrl || '',
          theme: theme,
        }));

        setBackendClasses(mappedClasses);
        console.log(`✅ Cargadas ${classes.length} clases SUP desde el backend`);
      } catch (err: any) {
        // Si es 404, tratar como "sin clases" en lugar de error
        if (err.response?.status === 404) {
          console.warn('⚠️ No se encontraron clases SUP para este cohorte (404)');
          setBackendClasses([]);
        } else {
          console.error('❌ Error al cargar clases:', err);
        }
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [cohorteId, theme]);

  const currentUserRole = user?.role;
  const isUploader = currentUserRole === 'ADMIN' || currentUserRole === 'TA' || currentUserRole === 'TEACHER';
  const formatFullDate = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
      const dateObj = new Date(isoDate + 'T00:00:00');
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      };
      let formatted = new Intl.DateTimeFormat('es-ES', options).format(dateObj);
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
      return formatted;
    } catch (e) {
      console.error('Error al formatear fecha completa:', e);
      return isoDate;
    }
  };
  const currentUserInfo: UserInfo | null = user ? { loggedName: user.name || 'Desconocido', loggedRol: user.role || 'Desconocido' } : null;

  const handleDataUpdate = async (data: cardDataProps & UserInfo) => {
    try {
      setSavingClass(true);

      // 1. Construir DTO para backend
      const classDto: CreateClassDto = {
        cohorteId: cohorteId,
        name: data.title, // Backend usa 'name'
        description: data.description,
        scheduledDate: `${data.date}T${data.time}:00`, // Backend usa 'scheduledDate'
      };

      console.log('💾 Guardando clase SUP en backend:', classDto);

      // 2. Guardar en backend
      const savedClass = await createClass(classDto);

      console.log('✅ Clase SUP guardada:', savedClass);

      // 3. Recargar clases desde backend para mantener sincronización
      const updatedClasses = await getClassesByCohorte(cohorteId);
      const mappedClasses: PublishedCard[] = updatedClasses.map((cls) => ({
        name: cls.teacher?.name || 'Instructor',
        rol: 'TEACHER',
        picture: cls.teacher?.profilePicture || undefined,
        date: new Date(cls.scheduledDate || cls.createdAt).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
        }),
        time: new Date(cls.scheduledDate || cls.createdAt).toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        title: cls.name,
        datePublished: new Date(cls.createdAt).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        description: cls.description || '',
        linkConectate: cls.meetingUrl || '',
        theme: theme,
      }));

      setBackendClasses(mappedClasses);
      alert('✅ Clase agendada exitosamente');
    } catch (error: any) {
      console.error('❌ Error al guardar clase:', error);
      alert(`Error al agendar clase: ${error.response?.data?.message || error.message}`);
    } finally {
      setSavingClass(false);
    }
  };

  return (
    <>
      <div className="bg-linear-to-r to-green-400 from-[#ffff00] rounded-lg p-3 text-black border-0">
        <div className="pt-1">
          <h2 className="mb-2 font font-extrabold">Mis clases</h2>
          <p className="font-medium">Accede a todas tus sesiones y clases programadas</p>
        </div>
      </div>
      <div className=" md:flex md:flex-row flex flex-col items-center md:items-start">
        {isUploader && currentUserInfo && <ClassProgramar onDataUpdate={handleDataUpdate} sectionTheme={theme} currentUser={currentUserInfo} isLoading={savingClass} />}
        <div className="ml-3 p-3 w-full">
          {loadingClasses ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando clases...</p>
            </div>
          ) : publishedCards.length === 0 && backendClasses.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">📅 No hay clases programadas</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Las clases agendadas aparecerán aquí</p>
            </div>
          ) : (
            <>
              {publishedCards.map((card) => (
                <ClaseCard key={`pub-${card.title}-${card.datePublished}`} {...card} theme={theme} />
              ))}
              {backendClasses.map((post) => (
                <ClaseCard key={`backend-${post.title}-${post.date}`} {...post} theme={theme} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};
export default ClassSub;
