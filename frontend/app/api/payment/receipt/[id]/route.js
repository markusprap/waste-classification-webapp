import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const subscriptionId = resolvedParams.id;
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }
    
    // Find the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is authorized to view this receipt
    const isAdmin = session.user.role === 'admin';
    const isOwner = subscription.user?.email === session.user.email;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'You are not authorized to view this receipt' },
        { status: 403 }
      );
    }
    
    // Format the receipt data
    const receipt = {
      id: subscription.id,
      orderId: subscription.paymentId,
      transactionDate: subscription.createdAt,
      plan: subscription.plan,
      amount: subscription.amount,
      currency: subscription.currency,
      status: subscription.paymentStatus,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      customer: {
        name: subscription.user?.name || 'N/A',
        email: subscription.user?.email || 'N/A'
      }
    };
    
    // Return receipt data
    return NextResponse.json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error('Fetch receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}
