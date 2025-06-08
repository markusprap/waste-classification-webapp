import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // In a real application, you would check for admin privileges here
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    
    // Simple admin key check (in production, use proper admin authentication)
    if (adminKey !== 'admin123') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        usageCount: true,
        usageLimit: true,
        lastUsageReset: true,
        createdAt: true,
        _count: {
          select: {
            classifications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const stats = await prisma.classification.groupBy({
      by: ['userId'],
      _count: {
        userId: true
      }
    });

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        totalClassifications: user._count.classifications
      })),
      totalUsers: users.length,
      planDistribution: {
        free: users.filter(u => u.plan === 'free').length,
        premium: users.filter(u => u.plan === 'premium').length,
        corporate: users.filter(u => u.plan === 'corporate').length
      }
    });

  } catch (error) {
    console.error('Admin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
