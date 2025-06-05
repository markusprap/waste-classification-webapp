import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    // Get session instead of token verification
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();    // Validate plan
    if (!['premium', 'corporate'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose premium or corporate' },
        { status: 400 }
      );
    }

    // Get current user using session email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.plan === plan) {
      return NextResponse.json(
        { error: `You are already on the ${plan} plan` },
        { status: 400 }
      );
    }

    // Update user plan and reset daily usage
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        plan,
        usageCount: 0,
        lastUsageReset: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        usageCount: true,
        usageLimit: true,
        lastUsageReset: true,
        createdAt: true
      }
    });

    // In a real app, you would integrate with a payment processor here
    // For now, we'll just simulate successful upgrade
    await prisma.subscription.create({
      data: {
        userId: decoded.userId,
        plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentId: `sim_${Date.now()}` // Simulated payment ID
      }
    });

    return NextResponse.json({
      message: `Successfully upgraded to ${plan} plan`,
      user: updatedUser,
      benefits: plan === 'premium' ? {
        classifications: '50 per day',
        features: ['Priority support', 'Advanced analytics', 'Export data']
      } : {
        classifications: 'Unlimited',
        features: ['Priority support', 'Advanced analytics', 'Export data', 'Custom integrations', 'Team management']
      }
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
