import {api} from "./api";

// Enums del backend
export enum CohorteStatusEnum {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  UPCOMING = "UPCOMING",
  CANCELLED = "CANCELLED",
}

export enum CohorteModalityEnum {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
}

export enum CohorteRoleEnum {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  TA = "TA",
  STUDENT = "STUDENT",
}

export enum MemberStatusEnum {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  GRADUATED = "GRADUATED",
  DROPPED = "DROPPED",
}

// Interfaces
export interface CohorteMember {
  id: string;
  role: CohorteRoleEnum;
  status: MemberStatusEnum;
  attendance?: number;
  finalGrade?: number;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
    lastName?: string;
    username?: string;
    profilePicture?: string;
  };
}

export interface Cohorte {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: CohorteStatusEnum;
  schedule?: string;
  modality: CohorteModalityEnum;
  maxStudents?: number;
  chatGroupId?: string; // ID del grupo de chat asociado
  members?: CohorteMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCohorteDto {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: CohorteStatusEnum;
  schedule?: string;
  modality?: CohorteModalityEnum;
  maxStudents?: number;
}

export type UpdateCohorteDto = Partial<CreateCohorteDto>;

export interface AddMemberDto {
  userId: string;
  role: CohorteRoleEnum;
}

/**
 * Obtener todas las cohortes
 */
export const getAllCohortes = async (): Promise<Cohorte[]> => {
  const response = await api.get("/cohortes");
  return response.data;
};

/**
 * Obtener una cohorte por ID
 */
export const getCohorteById = async (id: string): Promise<Cohorte> => {
  const response = await api.get(`/cohortes/${id}`);
  return response.data;
};

/**
 * Crear una nueva cohorte
 */
export const createCohorte = async (dto: CreateCohorteDto): Promise<Cohorte> => {
  const response = await api.post("/cohortes", dto);
  return response.data;
};

/**
 * Crear grupo de chat para una cohorte y retornar el grupo creado
 */
export const createCohorteGroupChat = async (cohorteName: string, memberIds: string[]): Promise<string> => {
  const { createGroup } = await import('./chatService');

  const group = await createGroup({
    name: `Chat ${cohorteName}`,
    userIds: memberIds,
    description: `Chat grupal de la cohorte ${cohorteName}`,
  });

  console.log('✅ Grupo de chat creado:', group.id);
  return group.id; // Retornar el ID del grupo
};

/**
 * Guardar la relación cohorte → chatGroup en localStorage (temporal)
 * TODO: Mover al backend agregando campo chatGroupId en Cohorte entity
 */
export const saveCohorteChatGroupId = (cohorteId: string, chatGroupId: string): void => {
  try {
    const mapping = JSON.parse(localStorage.getItem('cohorte_chat_mapping') || '{}');
    mapping[cohorteId] = chatGroupId;
    localStorage.setItem('cohorte_chat_mapping', JSON.stringify(mapping));
  } catch (error) {
    console.error('Error guardando mapping cohorte-chat:', error);
  }
};

/**
 * Obtener el ID del grupo de chat asociado a una cohorte
 */
export const getCohorteChatGroupId = (cohorteId: string): string | null => {
  try {
    const mapping = JSON.parse(localStorage.getItem('cohorte_chat_mapping') || '{}');
    return mapping[cohorteId] || null;
  } catch (error) {
    console.error('Error obteniendo mapping cohorte-chat:', error);
    return null;
  }
};

/**
 * Actualizar una cohorte
 */
export const updateCohorte = async (id: string, dto: UpdateCohorteDto): Promise<Cohorte> => {
  const response = await api.patch(`/cohortes/${id}`, dto);
  return response.data;
};

/**
 * Eliminar una cohorte
 */
export const deleteCohorte = async (id: string): Promise<void> => {
  await api.delete(`/cohortes/${id}`);
};

/**
 * Agregar miembro a una cohorte
 */
export const addMemberToCohorte = async (
  cohorteId: string,
  userId: string,
  role: CohorteRoleEnum
): Promise<CohorteMember> => {
  const response = await api.post(`/cohortes/${cohorteId}/members/${userId}`, {role});
  return response.data;
};

/**
 * Remover miembro de una cohorte
 */
export const removeMemberFromCohorte = async (cohorteId: string, userId: string): Promise<void> => {
  await api.delete(`/cohortes/${cohorteId}/members/${userId}`);
};

/**
 * Obtener cohortes del usuario actual
 * - Si es ADMIN: devuelve TODAS las cohortes (GET /cohortes)
 * - Si es otro rol: devuelve solo sus cohortes (GET /cohortes/me)
 */
export const getMyCohortes = async (userRole?: string): Promise<Cohorte[]> => {
  try {
    // Si es ADMIN, obtener TODAS las cohortes
    if (userRole === 'ADMIN') {
      const response = await api.get('/cohortes');
      return response.data;
    }

    // Si no es ADMIN, obtener solo las cohortes donde es miembro
    const response = await api.get('/cohortes/me');
    // El backend devuelve un array con { cohorte, myRole, myStatus, joinedAt }
    // Mapeamos para extraer solo los cohortes
    return response.data.map((item: any) => ({
      ...item.cohorte,
      // Agregamos el rol del usuario en la cohorte como información adicional
      myRole: item.myRole,
      myStatus: item.myStatus,
      joinedAt: item.joinedAt,
    }));
  } catch (error) {
    console.error("Error al obtener cohortes del usuario:", error);
    return [];
  }
};

/**
 * Helpers para traducción
 */
export const translateStatus = (status: CohorteStatusEnum): string => {
  const translations: Record<CohorteStatusEnum, string> = {
    [CohorteStatusEnum.ACTIVE]: "Activa",
    [CohorteStatusEnum.COMPLETED]: "Completada",
    [CohorteStatusEnum.UPCOMING]: "Próxima",
    [CohorteStatusEnum.CANCELLED]: "Cancelada",
  };
  return translations[status] || status;
};

export const translateModality = (modality: CohorteModalityEnum): string => {
  const translations: Record<CohorteModalityEnum, string> = {
    [CohorteModalityEnum.FULL_TIME]: "Tiempo Completo",
    [CohorteModalityEnum.PART_TIME]: "Medio Tiempo",
  };
  return translations[modality] || modality;
};

export const translateRole = (role: CohorteRoleEnum): string => {
  const translations: Record<CohorteRoleEnum, string> = {
    [CohorteRoleEnum.ADMIN]: "Administrador",
    [CohorteRoleEnum.TEACHER]: "Profesor",
    [CohorteRoleEnum.TA]: "Asistente",
    [CohorteRoleEnum.STUDENT]: "Estudiante",
  };
  return translations[role] || role;
};

export const translateMemberStatus = (status: MemberStatusEnum): string => {
  const translations: Record<MemberStatusEnum, string> = {
    [MemberStatusEnum.ACTIVE]: "Activo",
    [MemberStatusEnum.INACTIVE]: "Inactivo",
    [MemberStatusEnum.GRADUATED]: "Graduado",
    [MemberStatusEnum.DROPPED]: "Retirado",
  };
  return translations[status] || status;
};

/**
 * Helpers para colores de estado
 */
export const getStatusColor = (status: CohorteStatusEnum): string => {
  const colors: Record<CohorteStatusEnum, string> = {
    [CohorteStatusEnum.ACTIVE]: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900",
    [CohorteStatusEnum.COMPLETED]: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900",
    [CohorteStatusEnum.UPCOMING]: "text-yellow-600 dark:text-[#ffff00] bg-yellow-100 dark:bg-yellow-900",
    [CohorteStatusEnum.CANCELLED]: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900",
  };
  return colors[status] || "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900";
};

export const getRoleColor = (role: CohorteRoleEnum): string => {
  const colors: Record<CohorteRoleEnum, string> = {
    [CohorteRoleEnum.ADMIN]: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900",
    [CohorteRoleEnum.TEACHER]: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900",
    [CohorteRoleEnum.TA]: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900",
    [CohorteRoleEnum.STUDENT]: "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900",
  };
  return colors[role] || "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900";
};

// =============================
//    ANNOUNCEMENTS (AVISOS)
// =============================

export interface CohorteAnnouncement {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  author: {
    id: string;
    name: string;
    lastName: string;
    profilePicture?: string;
    role: string;
  };
  cohorte: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
}

/**
 * Obtener todos los anuncios de una cohorte
 */
export const getCohorteAnnouncements = async (cohorteId: string): Promise<CohorteAnnouncement[]> => {
  const response = await api.get(`/cohortes/${cohorteId}/announcements`);
  return response.data;
};

/**
 * Crear un anuncio en una cohorte
 */
export const createCohorteAnnouncement = async (
  cohorteId: string,
  announcement: CreateAnnouncementDto
): Promise<CohorteAnnouncement> => {
  const response = await api.post(`/cohortes/${cohorteId}/announcements`, announcement);
  return response.data;
};

/**
 * Eliminar un anuncio (solo el autor o admin)
 */
export const deleteCohorteAnnouncement = async (cohorteId: string, announcementId: string): Promise<void> => {
  await api.delete(`/cohortes/announcements/${announcementId}`);
};

/**
 * Fijar/Desfijar un anuncio (solo el autor)
 */
export const togglePinAnnouncement = async (
  cohorteId: string,
  announcementId: string
): Promise<CohorteAnnouncement> => {
  const response = await api.patch(`/cohortes/announcements/${announcementId}/pin`);
  return response.data;
};

// =============================
//    CLASSES (CLASES)
// =============================

export interface CohorteClass {
  id: string;
  name: string; // Backend usa 'name'
  description?: string;
  module?: string;
  scheduledDate?: string; // Backend usa 'scheduledDate'
  duration?: number;
  teacher?: {
    id: string;
    name?: string;
    lastName?: string;
    email: string;
    profilePicture?: string;
    role: string;
  };
  meetingUrl?: string;
  recordingUrl?: string;
  materialsUrl?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  cohorte: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassDto {
  cohorteId: string;
  name: string; // Backend usa 'name', no 'title'
  description?: string;
  module?: string;
  scheduledDate?: string; // Backend usa 'scheduledDate', no 'classDate'
  duration?: number;
  teacherId?: string;
  meetingUrl?: string;
  recordingUrl?: string;
  materialsUrl?: string;
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface UpdateClassDto extends Partial<CreateClassDto> {}

export interface AttendanceRecord {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
  student: {
    id: string;
    name: string;
    lastName: string;
    email: string;
  };
  class: {
    id: string;
    title: string;
    classDate: string;
  };
  markedAt: string;
}

/**
 * Obtener todas las clases
 */
export const getAllClasses = async (): Promise<CohorteClass[]> => {
  const response = await api.get('/cohorte-classes');
  return response.data;
};

/**
 * Obtener una clase por ID
 */
export const getClassById = async (id: string): Promise<CohorteClass> => {
  const response = await api.get(`/cohorte-classes/${id}`);
  return response.data;
};

/**
 * Obtener todas las clases de una cohorte específica
 * @param cohorteId ID de la cohorte
 * @returns Array de clases ordenadas por fecha descendente
 */
export const getClassesByCohorte = async (cohorteId: string): Promise<CohorteClass[]> => {
  try {
    const response = await api.get(`/cohorte-classes/by-cohorte/${cohorteId}`);
    return response.data;
  } catch (error: any) {
    // Si es 404, devolver array vacío sin loggear error
    if (error.response?.status === 404) {
      return [];
    }
    // Para otros errores, sí lanzar excepción
    throw error;
  }
};

/**
 * Crear una nueva clase
 */
export const createClass = async (dto: CreateClassDto): Promise<CohorteClass> => {
  const response = await api.post('/cohorte-classes', dto);
  return response.data;
};

/**
 * Actualizar una clase
 */
export const updateClass = async (id: string, dto: UpdateClassDto): Promise<CohorteClass> => {
  const response = await api.patch(`/cohorte-classes/${id}`, dto);
  return response.data;
};

/**
 * Eliminar una clase
 */
export const deleteClass = async (id: string): Promise<void> => {
  await api.delete(`/cohorte-classes/${id}`);
};

/**
 * Marcar asistencia de estudiantes
 */
export const markAttendance = async (classId: string, studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', notes?: string): Promise<AttendanceRecord> => {
  const response = await api.post(`/cohorte-classes/${classId}/attendance`, {
    studentId,
    status,
    notes,
  });
  return response.data;
};

/**
 * Obtener asistencia de una clase
 */
export const getClassAttendance = async (classId: string): Promise<AttendanceRecord[]> => {
  const response = await api.get(`/cohorte-classes/${classId}/attendance`);
  return response.data;
};

/**
 * Obtener asistencia de un estudiante en una cohorte
 */
export const getStudentAttendance = async (cohorteId: string, studentId: string): Promise<AttendanceRecord[]> => {
  const response = await api.get(`/cohorte-classes/cohorte/${cohorteId}/student/${studentId}`);
  return response.data;
};
