import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // Use JWT strategy instead of database
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== "your-google-client-id-here" 
        ? [GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "select_account",
                access_type: "offline",
                response_type: "code"
              }
            }
          })]
        : []
    ),
    ...(process.env.GITHUB_CLIENT_ID && 
        process.env.GITHUB_CLIENT_SECRET && 
        process.env.GITHUB_CLIENT_ID !== "your-github-client-id-here" 
        ? [GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          })]
        : []
    )
  ],  callbacks: {    async session({ session, token }) {
      // Add user info from token to session
      if (token) {
        session.user.id = token.sub;
        
        // Fetch latest user data from API to get current plan
        try {
          const userResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/user/${token.sub}`, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
            if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.user) {
              session.user.plan = userData.user.plan || 'free';
              session.user.usageCount = userData.user.usageCount || 0;
              session.user.usageLimit = userData.user.usageLimit || 100;
            } else {
              // User not found in backend, create via sync API
              try {
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
                const syncResponse = await fetch(`${backendUrl}/api/users/sync`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    id: token.sub,
                    email: session.user.email,
                    name: session.user.name,
                    provider: 'google'
                  })
                });
                
                if (syncResponse.ok) {
                  console.log('User synced to backend from session callback');
                }
              } catch (syncError) {              console.error('Error syncing user from session callback:', syncError);
              }
              
              // Fallback to defaults
              session.user.plan = 'free';
              session.user.usageCount = 0;
              session.user.usageLimit = 30;
            }
          } else {            // Fallback to defaults if API call fails
            session.user.plan = 'free';
            session.user.usageCount = 0;
            session.user.usageLimit = 30;
          }        } catch (error) {
          console.error('Error fetching user data in session callback:', error);
          // Fallback to defaults
          session.user.plan = 'free';
          session.user.usageCount = 0;
          session.user.usageLimit = 30;
        }
      }
      
      return session;
    },async signIn({ user, account, profile }) {
      // Simple validation without database queries
      if (account.provider === 'google' || account.provider === 'github') {
        try {
          console.log('User signing in:', user.email);
          
          // Sync user with backend
          try {
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
            const syncResponse = await fetch(`${backendUrl}/api/users/sync`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
                provider: account.provider
              })
            });
            
            if (!syncResponse.ok) {
              console.error('Failed to sync user with backend:', await syncResponse.text());
            } else {
              console.log('User synced with backend successfully');
            }
          } catch (syncError) {
            console.error('Error syncing user with backend:', syncError);
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    }
  },
  // Simple event logging without database operations
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email);
    }
  },  // Use default signin page provided by NextAuth.js
  pages: {} // Removed custom page config to use NextAuth.js defaults
}
