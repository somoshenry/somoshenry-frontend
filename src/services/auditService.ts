import { api } from './api';

// Enums que coinciden con el backend
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  MODERATE = 'MODERATE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  BAN = 'BAN',
  UNBAN = 'UNBAN',
}

// Interfaces
export interface AuditLog {
  id: string;
  adminId: string;
  admin?: {
    id: string;
    email: string;
    name?: string | null;
    lastName?: string | null;
    username?: string | null;
  } | null;
  action: AuditAction;
  targetType: string;
  targetId: string;
  details?: string | null;
  createdAt: string;
}

export interface AuditFilters {
  page?: number;
  limit?: number;
  adminId?: string;
  action?: AuditAction;
  targetType?: string;
  from?: string; // ISO date string
  to?: string; // ISO date string
}

export interface AuditListResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Obtiene la lista de registros de auditoría con filtros opcionales
 */
export const getAuditLogs = async (filters?: AuditFilters): Promise<AuditListResponse> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.adminId) params.append('adminId', filters.adminId);
  if (filters?.action) params.append('action', filters.action);
  if (filters?.targetType) params.append('targetType', filters.targetType);
  if (filters?.from) params.append('from', filters.from);
  if (filters?.to) params.append('to', filters.to);

  const queryString = params.toString();
  const url = `/dashboard/admin/audit${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.data;
};

/**
 * Exporta los registros de auditoría a CSV
 * @returns URL del archivo CSV para descargar
 */
export const exportAuditLogs = async (filters?: Omit<AuditFilters, 'page' | 'limit'>): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters?.adminId) params.append('adminId', filters.adminId);
  if (filters?.action) params.append('action', filters.action);
  if (filters?.targetType) params.append('targetType', filters.targetType);
  if (filters?.from) params.append('from', filters.from);
  if (filters?.to) params.append('to', filters.to);

  const queryString = params.toString();
  const url = `/dashboard/admin/audit/export${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url, {
    responseType: 'blob',
  });

  return response.data;
};

/**
 * Helper para traducir acciones al español
 */
export const translateAction = (action: AuditAction): string => {
  const translations: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'Crear',
    [AuditAction.UPDATE]: 'Actualizar',
    [AuditAction.DELETE]: 'Eliminar',
    [AuditAction.MODERATE]: 'Moderar',
    [AuditAction.APPROVE]: 'Aprobar',
    [AuditAction.REJECT]: 'Rechazar',
    [AuditAction.BAN]: 'Banear',
    [AuditAction.UNBAN]: 'Desbanear',
  };
  return translations[action] || action;
};

/**
 * Helper para obtener color según la acción
 */
export const getActionColor = (action: AuditAction): string => {
  const colors: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
    [AuditAction.UPDATE]: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900',
    [AuditAction.DELETE]: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900',
    [AuditAction.MODERATE]: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900',
    [AuditAction.APPROVE]: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
    [AuditAction.REJECT]: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900',
    [AuditAction.BAN]: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900',
    [AuditAction.UNBAN]: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900',
  };
  return colors[action] || 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
};
