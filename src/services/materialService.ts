import { api } from './api';

// =============================
//    ENUMS
// =============================

export enum FileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  SPREADSHEET = 'SPREADSHEET',
  PRESENTATION = 'PRESENTATION',
  AUDIO = 'AUDIO',
  COMPRESSED = 'COMPRESSED',
  OTHER = 'OTHER',
}

export enum MaterialCategory {
  GENERAL = 'GENERAL',
  MODULE_1 = 'MODULE_1',
  MODULE_2 = 'MODULE_2',
  MODULE_3 = 'MODULE_3',
  MODULE_4 = 'MODULE_4',
  CHECKPOINT = 'CHECKPOINT',
  PROYECTO = 'PROYECTO',
  RECURSOS = 'RECURSOS',
  EVALUACIONES = 'EVALUACIONES',
}

// =============================
//    INTERFACES
// =============================

export interface CohorteMaterial {
  id: string;
  cohorteId: string;
  uploadedBy: string;
  uploader: {
    id: string;
    name?: string;
    lastName?: string;
    email: string;
  };
  fileName: string;
  fileUrl: string; // Backend usa fileUrl, no fileId
  fileType: FileType;
  fileSize?: number;
  mimeType?: string;
  category: MaterialCategory;
  title?: string;
  description?: string;
  isVisible: boolean;
  downloadCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialDto {
  // Solo campos básicos - el backend actualiza fileName, fileId, fileSize, mimeType al subir archivo
  fileType?: FileType;
  category?: MaterialCategory;
  title?: string;
  description?: string;
  isVisible?: boolean;
  tags?: string[];
  module?: string;
}

export interface UpdateMaterialDto extends Partial<CreateMaterialDto> {}

export interface QueryMaterialsDto {
  category?: MaterialCategory;
  fileType?: FileType;
  isVisible?: boolean;
  search?: string;
}

export interface MaterialStats {
  totalMaterials: number;
  byCategory: Record<MaterialCategory, number>;
  byType: Record<FileType, number>;
  totalDownloads: number;
  recentUploads: number;
}

/**
 * Subir archivo automáticamente a un material (el backend extrae metadatos automáticamente)
 */
export const uploadMaterialFile = async (materialId: string, file: File): Promise<CohorteMaterial> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await api.put(`/files/uploadCohortMaterialFile/${materialId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
};

/**
 * Eliminar archivo de un material
 */
export const deleteMaterialFile = async (materialId: string): Promise<void> => {
  await api.delete(`/files/deleteCohortMaterialFile/${materialId}`);
};

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Obtener todos los materiales de una cohorte
 */
export const getMaterials = async (cohorteId: string, query?: QueryMaterialsDto): Promise<CohorteMaterial[]> => {
  const response = await api.get(`/cohorte/${cohorteId}/materials`, { params: query });
  return response.data;
};

/**
 * Obtener un material específico
 */
export const getMaterialById = async (cohorteId: string, materialId: string): Promise<CohorteMaterial> => {
  const response = await api.get(`/cohorte/${cohorteId}/materials/${materialId}`);
  return response.data;
};

/**
 * Crear un nuevo material (solo profesores/admin)
 */
export const createMaterial = async (cohorteId: string, dto: CreateMaterialDto): Promise<CohorteMaterial> => {
  const response = await api.post(`/cohorte/${cohorteId}/materials`, dto);
  return response.data;
};

/**
 * Actualizar un material
 */
export const updateMaterial = async (cohorteId: string, materialId: string, dto: UpdateMaterialDto): Promise<CohorteMaterial> => {
  const response = await api.put(`/cohorte/${cohorteId}/materials/${materialId}`, dto);
  return response.data;
};

/**
 * Eliminar un material
 */
export const deleteMaterial = async (cohorteId: string, materialId: string): Promise<void> => {
  await api.delete(`/cohorte/${cohorteId}/materials/${materialId}`);
};

/**
 * Registrar descarga de un material
 */
export const registerDownload = async (cohorteId: string, materialId: string): Promise<void> => {
  await api.post(`/cohorte/${cohorteId}/materials/${materialId}/download`);
};

/**
 * Cambiar visibilidad de un material
 */
export const toggleVisibility = async (cohorteId: string, materialId: string): Promise<CohorteMaterial> => {
  const response = await api.patch(`/cohorte/${cohorteId}/materials/${materialId}/visibility`);
  return response.data;
};

/**
 * Obtener materiales por categoría
 */
export const getMaterialsByCategory = async (cohorteId: string, category: MaterialCategory): Promise<CohorteMaterial[]> => {
  const response = await api.get(`/cohorte/${cohorteId}/materials/category/${category}`);
  return response.data;
};

/**
 * Obtener materiales por tipo de archivo
 */
export const getMaterialsByType = async (cohorteId: string, fileType: FileType): Promise<CohorteMaterial[]> => {
  const response = await api.get(`/cohorte/${cohorteId}/materials/type/${fileType}`);
  return response.data;
};

/**
 * Buscar materiales por tag
 */
export const getMaterialsByTag = async (cohorteId: string, tag: string): Promise<CohorteMaterial[]> => {
  const response = await api.get(`/cohorte/${cohorteId}/materials/tag/${tag}`);
  return response.data;
};

/**
 * Obtener estadísticas de materiales
 */
export const getMaterialStats = async (cohorteId: string): Promise<MaterialStats> => {
  const response = await api.get(`/cohorte/${cohorteId}/materials/stats/overview`);
  return response.data;
};

/**
 * Obtener materiales recientes
 */
export const getRecentMaterials = async (cohorteId: string, limit: number = 10): Promise<CohorteMaterial[]> => {
  const response = await api.get(`/cohorte/${cohorteId}/materials/recent/list`, { params: { limit } });
  return response.data;
};

/**
 * Actualizar tags de un material
 */
export const updateMaterialTags = async (cohorteId: string, materialId: string, tags: string[]): Promise<CohorteMaterial> => {
  const response = await api.patch(`/cohorte/${cohorteId}/materials/${materialId}/tags`, { tags });
  return response.data;
};

// =============================
//    HELPERS
// =============================

/**
 * Traducir categoría al español
 */
export const translateCategory = (category: MaterialCategory): string => {
  const translations: Record<MaterialCategory, string> = {
    [MaterialCategory.GENERAL]: 'General',
    [MaterialCategory.MODULE_1]: 'Módulo 1',
    [MaterialCategory.MODULE_2]: 'Módulo 2',
    [MaterialCategory.MODULE_3]: 'Módulo 3',
    [MaterialCategory.MODULE_4]: 'Módulo 4',
    [MaterialCategory.CHECKPOINT]: 'Checkpoint',
    [MaterialCategory.PROYECTO]: 'Proyecto',
    [MaterialCategory.RECURSOS]: 'Recursos',
    [MaterialCategory.EVALUACIONES]: 'Evaluaciones',
  };
  return translations[category] || category;
};

/**
 * Traducir tipo de archivo al español
 */
export const translateFileType = (fileType: FileType): string => {
  const translations: Record<FileType, string> = {
    [FileType.PDF]: 'PDF',
    [FileType.IMAGE]: 'Imagen',
    [FileType.VIDEO]: 'Video',
    [FileType.DOCUMENT]: 'Documento',
    [FileType.SPREADSHEET]: 'Hoja de Cálculo',
    [FileType.PRESENTATION]: 'Presentación',
    [FileType.AUDIO]: 'Audio',
    [FileType.COMPRESSED]: 'Archivo Comprimido',
    [FileType.OTHER]: 'Otro',
  };
  return translations[fileType] || fileType;
};

/**
 * Obtener color por categoría
 */
export const getCategoryColor = (category: MaterialCategory): string => {
  const colors: Record<MaterialCategory, string> = {
    [MaterialCategory.GENERAL]: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    [MaterialCategory.MODULE_1]: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    [MaterialCategory.MODULE_2]: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    [MaterialCategory.MODULE_3]: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    [MaterialCategory.MODULE_4]: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    [MaterialCategory.CHECKPOINT]: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    [MaterialCategory.PROYECTO]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    [MaterialCategory.RECURSOS]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
    [MaterialCategory.EVALUACIONES]: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  };
  return colors[category] || colors[MaterialCategory.GENERAL];
};

/**
 * Obtener ícono por tipo de archivo
 */
export const getFileTypeIcon = (fileType: FileType): string => {
  const icons: Record<FileType, string> = {
    [FileType.PDF]: '📄',
    [FileType.IMAGE]: '🖼️',
    [FileType.VIDEO]: '🎥',
    [FileType.DOCUMENT]: '📝',
    [FileType.SPREADSHEET]: '📊',
    [FileType.PRESENTATION]: '📊',
    [FileType.AUDIO]: '🎵',
    [FileType.COMPRESSED]: '🗜️',
    [FileType.OTHER]: '📎',
  };
  return icons[fileType] || '📎';
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Tamaño desconocido';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Detectar tipo de archivo por extensión
 */
export const detectFileType = (fileName: string): FileType => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (['pdf'].includes(ext || '')) return FileType.PDF;
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return FileType.IMAGE;
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(ext || '')) return FileType.VIDEO;
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext || '')) return FileType.DOCUMENT;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext || '')) return FileType.SPREADSHEET;
  if (['ppt', 'pptx', 'odp'].includes(ext || '')) return FileType.PRESENTATION;
  if (['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext || '')) return FileType.AUDIO;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) return FileType.COMPRESSED;

  return FileType.OTHER;
};
