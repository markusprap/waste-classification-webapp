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
    const response = await fetch(`${backendUrl}/api/users/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        id: userId
      })
    });

    if (!response.ok) {
      // Try to sync user if not found
      if (response.status === 404) {
        console.log('User not found in backend, attempting sync with details:', {
          email: session.user.email,
          name: session.user.name,
          id: userId
        });
        
        const syncResponse = await fetch(`${backendUrl}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name,
            provider: 'google',
            id: userId
          })
        });

        const syncData = await syncResponse.json();
        console.log('User sync response:', syncData);

        // Accept { success: true, data: {...} } or { status: 'success', data/user: {...} }
        const syncOk = (syncResponse.ok && (syncData.success === true || syncData.status === 'success'));
        const userObj = syncData.data || syncData.user;
        if (syncOk && userObj) {
          return NextResponse.json({
            success: true,
            user: {
              id: userObj.id,
              email: userObj.email,
              name: userObj.name || session.user.name,
              plan: userObj.plan || 'free',
              usageCount: userObj.usageCount || 0,
              usageLimit: userObj.usageLimit || 30
            }
          });
        }

        // If sync failed, return error
        console.error('User sync failed:', syncData);
        return NextResponse.json(
          { 
            success: false, 
            error: 'User sync failed',
            details: syncData.message || 'Failed to sync user with backend'
          },
          { status: 404 }
        );
      }

      const errorData = await response.json();
      console.error('Backend API error:', errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch user data',
          details: errorData.message || 'Backend API error'
        },
        { status: response.status }
      );
    }

    const userData = await response.json();
    if (!userData.success || !userData.data) {
      console.error('Invalid user data from backend:', userData);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid user data from backend',
          details: 'The backend returned invalid user data'
        },
        { status: 500 }
      );
    }

    // Use the data directly from successful profile fetch
    return NextResponse.json({
      success: true,
      user: {
        id: userData.data.id,
        email: userData.data.email,
        name: userData.data.name || session.user.name,
        plan: userData.data.plan || 'free',
        usageCount: userData.data.usageCount || 0,
        usageLimit: userData.data.usageLimit || 30
      }
    });

  } catch (error) {
    console.error('=== Frontend User Route Error ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        details: error.message,
        action: 'Please try logging out and back in'
      },
      { status: 500 }
    );
  }
}
