import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { plan } = await request.json();
    
    // Validate plan - only premium is available now
    if (plan !== 'premium') {
      return NextResponse.json(
        { error: 'Invalid plan. Only premium plan is available' },
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

    // Update user plan with standardized usage limit (10,000 for premium)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: plan,
        usageLimit: 10000, // Standardize with backend
        usageCount: 0,
        lastUsageReset: new Date()
      }
    });

    // Record subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${plan} plan`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        image: updatedUser.image,
        plan: updatedUser.plan,
        usageCount: updatedUser.usageCount,
        usageLimit: updatedUser.usageLimit,
        lastUsageReset: updatedUser.lastUsageReset,
        subscription: {
          status: subscription.status,
          endDate: subscription.endDate
        }
      }
    });

  } catch (error) {
    console.error('Upgrade error:', error);
    return NextResponse.json(
      { error: 'Failed to upgrade plan' },
      { status: 500 }
    );
  }
}
