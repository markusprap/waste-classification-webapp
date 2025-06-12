import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request, { params }) {
  console.log('=== Frontend User Route Called ===');
  try {
    // Get session to verify authentication and get user email
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Await params before using
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    console.log('Frontend user route called for:', {
      email: session.user.email,
      name: session.user.name,
      id: userId
    });

    // Get user data from backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    console.log('Fetching user profile from:', `${backendUrl}/api/users/profile`);
    
    let userData;
    
    try {
      // First try to get the user profile
      const response = await fetch(`${backendUrl}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId })
      });

      if (response.ok) {
        userData = await response.json();
      } else {
        // If user not found, try to sync first
        console.log('User profile fetch failed, attempting sync');
        
        const syncResponse = await fetch(`${backendUrl}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,
            email: session.user.email,
            name: session.user.name
          })
        });

        if (!syncResponse.ok) {
          throw new Error(`User sync failed: ${await syncResponse.text()}`);
        }

        // After sync, try to get the profile again
        const retryResponse = await fetch(`${backendUrl}/api/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: userId })
        });

        if (!retryResponse.ok) {
          throw new Error(`Profile fetch after sync failed: ${await retryResponse.text()}`);
        }

        userData = await retryResponse.json();
      }

      // Ensure we have valid user data
      if (!userData?.data) {
        throw new Error('Invalid user data structure received from backend');
      }

      // Return successful response with user data
      return NextResponse.json({
        success: true,
        user: {
          id: userData.data.id,
          email: userData.data.email,
          name: userData.data.name,
          plan: userData.data.plan || 'free',
          usageCount: userData.data.usageCount || 0,
          usageLimit: userData.data.usageLimit || 30,
          lastUsageReset: userData.data.lastUsageReset
        }
      });

    } catch (error) {
      console.error('Error processing user data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Frontend user route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
