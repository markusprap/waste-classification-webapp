import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [    // Only include Google provider if credentials are properly configured
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
    async session({ session, user }) {
      // Add user plan info to session
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          plan: true,
          usageCount: true,
          usageLimit: true,
          lastUsageReset: true
        }
      })
      
      if (dbUser) {        session.user.id = dbUser.id
        session.user.plan = dbUser.plan || 'free'
        session.user.usageCount = dbUser.usageCount || 0
        session.user.usageLimit = dbUser.usageLimit || 100
        session.user.lastUsageReset = dbUser.lastUsageReset
      }
      
      return session
    },
    async signIn({ user, account, profile }) {
      // Set default plan when user signs in for the first time
      if (account.provider === 'google' || account.provider === 'github') {
        try {
          // Check if this is first time signing in
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          
          if (!existingUser) {
            // User will be created by PrismaAdapter, but we need to set default values
            // This will be handled in the user creation process
            console.log('New user signing in:', user.email)
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
        }
      }
      return true
    }
  },
  events: {
    async createUser({ user }) {
      // Set default plan for new users
      try {
        await prisma.user.update({
          where: { id: user.id },        data: {
            plan: 'free',
            usageCount: 0,
            usageLimit: 100,
            lastUsageReset: new Date()
          }
        })
        console.log('Set default plan for new user:', user.email)
      } catch (error) {
        console.error('Error setting default plan:', error)
      }
    }
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  }
}
