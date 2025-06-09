import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return user data from session
    // Since we've moved the database to backend, we'll just use session data
    const user = {
      id: session.user.id || 'user-id',
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      plan: session.user.plan || 'free',
      usageCount: session.user.usageCount || 0,
      usageLimit: session.user.usageLimit || 100,
      lastUsageReset: session.user.lastUsageReset || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
