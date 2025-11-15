import { api } from './api';
import { ReportReason, Report } from './adminService';

/**
 * Crea un reporte de post
 */
export async function reportPost(postId: string, reason: ReportReason, description?: string): Promise<Report> {
  const { data } = await api.post<{ message: string; report: Report }>('/reports', {
    postId,
    reason,
    description,
  });
  return data.report;
}

/**
 * Crea un reporte de comentario
 */
export async function reportComment(commentId: string, reason: ReportReason, description?: string): Promise<Report> {
  const { data } = await api.post<{ message: string; report: Report }>('/reports', {
    commentId,
    reason,
    description,
  });
  return data.report;
}

/**
 * Crea un reporte de usuario
 */
export async function reportUser(userId: string, reason: ReportReason, description?: string): Promise<Report> {
  const { data } = await api.post<{ message: string; report: Report }>('/reports', {
    reportedUserId: userId,
    reason,
    description,
  });
  return data.report;
}

/**
 * Obtiene los motivos de reporte disponibles
 */
export function getReportReasons(): Array<{ value: ReportReason; label: string; description: string }> {
  return [
    {
      value: ReportReason.SPAM,
      label: 'Spam',
      description: 'Contenido repetitivo, publicidad no deseada o irrelevante',
    },
    {
      value: ReportReason.HARASSMENT,
      label: 'Acoso',
      description: 'Bullying, amenazas o comportamiento intimidante',
    },
    {
      value: ReportReason.INAPPROPRIATE,
      label: 'Contenido Inapropiado',
      description: 'Contenido ofensivo, violento o inadecuado',
    },
    {
      value: ReportReason.MISINFORMATION,
      label: 'Desinformación',
      description: 'Información falsa o engañosa',
    },
    {
      value: ReportReason.OTHER,
      label: 'Otro',
      description: 'Otro motivo no listado anteriormente',
    },
  ];
}
