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

    // Get user with plan info using session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has corporate plan
    if (user.plan !== 'corporate') {
      return NextResponse.json(
        { error: 'Corporate feature - upgrade to corporate plan to export data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const whereClause = {
      userId: user.id
    };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Get all user's classifications
    const classifications = await prisma.classification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        result: true,
        confidence: true,
        createdAt: true
      }
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,Waste Type,Confidence,Date\n';
      const csvData = classifications.map(c => 
        `${c.id},${c.result},${c.confidence},${c.createdAt.toISOString()}`
      ).join('\n');
      
      const csvContent = csvHeader + csvData;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="waste-classifications-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      exportDate: new Date().toISOString(),
      totalRecords: classifications.length,
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan
      },
      classifications
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
