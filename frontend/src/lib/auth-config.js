import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  providers: [
    // Add a credentials provider as a fallback
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        // For now, this is a dummy authorize function that will allow testing
        // without actually authenticating anyone
        if (!credentials) return null;
        
        try {
          // In a real app, you would verify credentials against your database
          // or an external API
          return {
            id: 'guest-user',
            name: 'Guest User',
            email: credentials.email || 'guest@example.com',
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
    // Only include Google provider if credentials are properly configured
    ...(process.env.GOOGLE_CLIENT_ID && 
        process.env.GOOGLE_CLIENT_SECRET && 
        process.env.GOOGLE_CLIENT_ID !== "your-google-client-id-here" 
        ? [GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "select_account", // Always show the account selection screen
                access_type: "offline",
                response_type: "code"
              }
            }
          })]
        : []
    ),
    // Only include GitHub provider if credentials are properly configured
    ...(process.env.GITHUB_CLIENT_ID && 
        process.env.GITHUB_CLIENT_SECRET && 
        process.env.GITHUB_CLIENT_ID !== "your-github-client-id-here" 
        ? [GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          })]
        : []
    )
  ],
  callbacks: {    async session({ session, token }) {
      try {
        if (!token || !session?.user?.email) {
          console.error('No token or email available in session callback');
          return session;
        }

        // Use our frontend API to get latest user data
        const frontendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const response = await fetch(`${frontendUrl}/api/auth/user/${token.sub}`, {
          headers: { 'Content-Type': 'application/json' }
        });        if (response.ok) {
          const userData = await response.json();
          if (userData.success && userData.user) {
            // Update session with latest user data
            session.user.id = userData.user.id;
            session.user.plan = userData.user.plan || 'free';
            session.user.usageCount = userData.user.usageCount || 0;
            session.user.usageLimit = userData.user.usageLimit || 100;
            
            console.log('Session updated with user data:', {
              plan: session.user.plan,
              usageCount: session.user.usageCount
            });
          }
        } else {
          console.error('Failed to fetch user data in session callback');
          // Set default values
          session.user.id = token.sub;
          session.user.plan = 'free';
          session.user.usageCount = 0;
          session.user.usageLimit = 100;
        }
        
        return session;
      } catch (error) {
        console.error('Error in session callback:', error);
        // Return session with default values if anything fails
        session.user.id = token.sub;
        session.user.plan = 'free';
        session.user.usageCount = 0;
        session.user.usageLimit = 100;
        return session;
      }
    },async signIn({ user, account, profile }) {
      if (account.provider === 'google' || account.provider === 'github') {
        try {
          console.log('User signing in:', user.email);
          
          // Create or update user in backend
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
          const response = await fetch(`${backendUrl}/api/users/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              name: user.name,
              provider: account.provider
            })
          });

          if (!response.ok) {
            console.error('Failed to sync user with backend:', await response.text());
            return false;
          }

          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    }
  },  // No database events needed for JWT strategy
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email);
    }
  },
  // Use default signin page provided by NextAuth.js
  pages: {}
}
