import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For admin users, fetch all transactions
    // For regular users, fetch only their own transactions
    const isAdmin = session.user.role === 'admin';
    
    let transactions = [];
    
    if (isAdmin) {
      // Admin can see all transactions
      const subscriptions = await prisma.subscription.findMany({
        orderBy: { 
          createdAt: 'desc' 
        },
        include: {
          user: {
            select: {
              email: true,
              name: true
            }
          }
        }
      });
      
      transactions = subscriptions.map(sub => ({
        id: sub.id,
        orderId: sub.paymentId,
        amount: sub.amount,
        currency: sub.currency,
        status: sub.paymentStatus,
        createdAt: sub.createdAt,
        userEmail: sub.user?.email,
        userName: sub.user?.name
      }));
    } else {
      // Regular user can only see their own transactions
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          subscriptions: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
      
      if (user) {
        transactions = user.subscriptions.map(sub => ({
          id: sub.id,
          orderId: sub.paymentId,
          amount: sub.amount,
          currency: sub.currency,
          status: sub.paymentStatus,
          createdAt: sub.createdAt,
          userEmail: user.email,
          userName: user.name
        }));
      }
    }
    
    return NextResponse.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
