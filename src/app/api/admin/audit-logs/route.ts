import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const getAuditLogsSchema = z.object({
  userId: z.string().optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  action: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

/**
 * GET /api/admin/audit-logs
 * 
 * Récupère les logs d'audit (Story 9.4, 9.9)
 */
export async function GET(request: NextRequest) {
  try {
    await requireSupport();

    const searchParams = request.nextUrl.searchParams;
    const validation = getAuditLogsSchema.safeParse({
      userId: searchParams.get('userId') || undefined,
      entityType: searchParams.get('entityType') || undefined,
      entityId: searchParams.get('entityId') || undefined,
      action: searchParams.get('action') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const where: any = {};
    if (validation.data.userId) {
      where.userId = validation.data.userId;
    }
    if (validation.data.entityType) {
      where.entityType = validation.data.entityType;
    }
    if (validation.data.entityId) {
      where.entityId = validation.data.entityId;
    }
    if (validation.data.action) {
      where.action = validation.data.action;
    }
    if (validation.data.startDate || validation.data.endDate) {
      where.createdAt = {};
      if (validation.data.startDate) {
        where.createdAt.gte = new Date(validation.data.startDate);
      }
      if (validation.data.endDate) {
        where.createdAt.lte = new Date(validation.data.endDate);
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: validation.data.limit,
      skip: validation.data.offset,
    });

    // Récupérer les utilisateurs séparément si nécessaire
    const userIds = [...new Set(logs.map((log) => log.userId).filter(Boolean) as string[])];
    const users = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true, userType: true },
        })
      : [];

    const usersMap = new Map(users.map((u) => [u.id, u]));

    const logsWithUsers = logs.map((log) => ({
      ...log,
      user: log.userId ? usersMap.get(log.userId) || null : null,
    }));

    const total = await prisma.auditLog.count({ where });

    return NextResponse.json(
      {
        data: logsWithUsers,
        meta: {
          total,
          limit: validation.data.limit,
          offset: validation.data.offset,
          hasMore: validation.data.offset + validation.data.limit < total,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des logs d\'audit' },
      { status: 500 }
    );
  }
}
