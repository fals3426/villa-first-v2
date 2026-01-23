import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export const auditService = {
  async logAction(
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    details?: Record<string, unknown>
  ) {
    try {
      const headersList = await headers();
      const ipAddress =
        headersList.get('x-forwarded-for') ||
        headersList.get('x-real-ip') ||
        'unknown';
      const userAgent = headersList.get('user-agent') || 'unknown';

      return prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      // Ne pas faire échouer l'opération principale si l'audit échoue
      console.error('Error creating audit log:', error);
      return null;
    }
  },
};
