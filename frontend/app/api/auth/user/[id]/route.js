import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(request, { params }) {
  console.log('=== Frontend User Route Called ===');  try {
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
        }        // After sync, try to get the profile again
        const retryResponse = await fetch(`${backendUrl}/api/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: userId })
        });

        if (!retryResponse.ok) {          // Check if this is a user not found error (404)
          if (retryResponse.status === 404) {
            // Attempt to get user by email instead of ID
            console.log('User not found by ID, trying to get by email');
            try {
              const emailLookupResponse = await fetch(`${backendUrl}/api/users/lookup`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: session.user.email })
              });
              
              if (emailLookupResponse.ok) {
                userData = await emailLookupResponse.json();
              } else {
                // Capture the response text safely
                const errorText = await emailLookupResponse.text().catch(e => 'Could not read error message');
                throw new Error(`Profile fetch by email failed: ${errorText}`);
              }
            } catch (emailLookupError) {
              console.error('Error during email lookup:', emailLookupError);
              throw new Error(`Failed to find user by email: ${emailLookupError.message}`);
            }
          } else {
            // Capture the response text safely
            const errorText = await retryResponse.text().catch(e => 'Could not read error message');
            throw new Error(`Profile fetch after sync failed: ${errorText}`);
          }
        } else {
          userData = await retryResponse.json();
        }
      }      // Ensure we have valid user data
      if (!userData?.data) {
        // Try one more time with email lookup
        console.log('Invalid user data, trying email lookup');
        try {
          const emailLookupResponse = await fetch(`${backendUrl}/api/users/lookup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: session.user.email })
          });
          
          if (emailLookupResponse.ok) {
            userData = await emailLookupResponse.json();
          } else {
            // Create a fallback response with basic user data from the session
            console.log('Email lookup failed, creating fallback user data from session');
            return NextResponse.json({
              success: true,
              user: {
                id: userId,
                email: session.user.email,
                name: session.user.name,
                plan: 'free', // Default to free plan
                usageCount: 0,
                usageLimit: 30,
                lastUsageReset: new Date().toISOString(),
                isFallback: true // Flag to indicate this is fallback data
              },
              message: 'Using fallback user data. Some features may be limited.'
            });
          }
        } catch (finalLookupError) {
          console.error('Final email lookup failed:', finalLookupError);
          throw new Error('Could not retrieve user data after multiple attempts');
        }
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
      });    } catch (error) {
      console.error('Error processing user data:', error);
      
      // Provide more descriptive error message
      const errorMessage = error.message || 'Unknown error';
      const isEmailLookupError = errorMessage.includes('email');
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch user data',
          message: errorMessage,
          suggestion: isEmailLookupError ? 
            'Please try logging out and logging in again with your primary account' : 
            'Please try again later'
        },
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
