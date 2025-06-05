import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get session instead of token verification
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user data using session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }    // Check if user has premium or corporate plan
    if (user.plan === 'free') {
      return NextResponse.json(
        { error: 'Premium feature - upgrade your plan to access analytics' },
        { status: 403 }
      );
    }

    // Get analytics data
    const [
      totalClassifications,
      classificationsByType,
      recentActivity,
      monthlyStats
    ] = await Promise.all([
      // Total classifications
      prisma.classification.count({
        where: { userId: user.id }
      }),

      // Classifications by waste type
      prisma.classification.groupBy({
        by: ['result'],
        where: { userId: user.id },
        _count: {
          result: true
        }
      }),

      // Recent activity (last 10 classifications)
      prisma.classification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          result: true,
          confidence: true,
          createdAt: true
        }
      }),

      // Monthly stats (last 6 months)
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', createdAt) as month,
          COUNT(*) as count
        FROM Classification
        WHERE userId = ${user.id}
          AND createdAt >= datetime('now', '-6 months')
        GROUP BY strftime('%Y-%m', createdAt)
        ORDER BY month DESC
      `
    ]);

    // Calculate accuracy (confidence > 80% is considered accurate)
    const accurateClassifications = recentActivity.filter(c => c.confidence > 0.8).length;
    const accuracy = recentActivity.length > 0 ? (accurateClassifications / recentActivity.length) * 100 : 0;

    return NextResponse.json({
      totalClassifications,
      accuracy: Math.round(accuracy),
      classificationsByType: classificationsByType.map(item => ({
        type: item.result,
        count: item._count.result
      })),
      recentActivity,
      monthlyStats: monthlyStats.map(stat => ({
        month: stat.month,
        count: Number(stat.count)
      }))
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
