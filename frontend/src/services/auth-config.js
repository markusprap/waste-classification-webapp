import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
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
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user?.email) {
        return false;
      }

      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name
          })
        });

        if (!response.ok) {
          console.error('Failed to sync user with backend:', await response.text());
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error syncing user with backend:', error);
        return false;
      }
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        
        try {
          const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
          const userResponse = await fetch(`${backendUrl}/api/users/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: token.sub })
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.data) {
              session.user = {
                ...session.user,
                ...userData.data,
              };
            }
          } else {
            console.error('Failed to fetch user data:', await userResponse.text());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  }
};
