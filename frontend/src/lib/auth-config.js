import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions = {
  // Note: Using database: false for now since we moved DB to backend
  // In production, you might want to configure a remote database adapter
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  providers: [
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
  callbacks: {
    async session({ session, token }) {
      // Add user info from token to session
      if (token) {
        session.user.id = token.sub;
        session.user.plan = 'free'; // Default plan
        session.user.usageCount = 0;
        session.user.usageLimit = 100;
      }
      
      return session;
    },
    async signIn({ user, account, profile }) {
      // Simple validation without database queries
      if (account.provider === 'google' || account.provider === 'github') {
        try {
          console.log('User signing in:', user.email);
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    }
  },
  // No database events needed for JWT strategy
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user.email);
    }
  },
  // Remove signIn page redirection to allow direct auth provider selection
  pages: {
    error: '/auth/error'
  }
}
