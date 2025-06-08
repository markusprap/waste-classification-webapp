import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignInButton } from '@/components/auth/signin-button';

export const dynamic = 'force-dynamic'

export default async function SignIn() {
  const session = await getServerSession(authOptions);
  
  // Redirect if already signed in
  if (session) {
    redirect('/');
  }

  // Check which providers are configured
  const availableProviders = [];
  
  if (process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET && 
      process.env.GOOGLE_CLIENT_ID !== "your-google-client-id-here") {
    availableProviders.push({ id: 'google', name: 'Google' });
  }
  
  if (process.env.GITHUB_CLIENT_ID && 
      process.env.GITHUB_CLIENT_SECRET && 
      process.env.GITHUB_CLIENT_ID !== "your-github-client-id-here") {
    availableProviders.push({ id: 'github', name: 'GitHub' });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 text-center">
            <span className="text-2xl font-bold text-green-600">🌱</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to WasteWise AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {availableProviders.length > 0 
              ? "Choose your preferred sign-in method"
              : "OAuth providers need to be configured"
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              {availableProviders.length > 0 
                ? "Sign in with your account to continue using WasteWise AI"
                : "OAuth providers (Google/GitHub) need to be configured in environment variables"
              }            </CardDescription>
          </CardHeader><CardContent className="space-y-4">
            {availableProviders.map((provider) => (
              <div key={provider.name}>
                <SignInButton provider={provider} />
              </div>
            ))}
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
