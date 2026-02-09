import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/health
 * 
 * Health check endpoint for monitoring (UptimeRobot, Pingdom, etc.)
 * Returns service status and critical dependencies
 */
export async function GET() {
  const health: {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    services: {
      database: { status: 'UP' | 'DOWN' };
    };
  } = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'UP' },
      // Add other services as needed (cache, queue, etc.)
    },
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    health.services.database.status = 'UP';
  } catch (error) {
    health.status = 'unhealthy';
    health.services.database.status = 'DOWN';
    console.error('Database health check failed:', error);
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
