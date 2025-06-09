'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Github, Chrome } from 'lucide-react';

export default function LoginTest() {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  const handleSignIn = async (providerId) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Testing OAuth sign-in with provider:', providerId);
      
      const result = await signIn(providerId, { 
        callbackUrl: window.location.origin + '/login-test',
        redirect: false
      });
      
      console.log('Sign-in result:', result);
      
      if (result?.error) {
        setError(`Sign-in failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      setError(`Sign-in error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut({ 
        callbackUrl: window.location.origin + '/login-test',
        redirect: false 
      });
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (providerId) => {
    switch (providerId) {
      case 'google':
        return <Chrome className="w-5 h-5" />;
      case 'github':
        return <Github className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Pure OAuth Login Test
          </h1>
          <p className="text-gray-600">
            Test Google and GitHub OAuth integration independently
          </p>
        </div>

        {/* Current Session Status */}
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Signed In</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
                    <p><strong>Image:</strong> {session.user?.image ? 'Yes' : 'No'}</p>
                    {session.user?.image && (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                  </div>
                </div>
                <Button 
                  onClick={handleSignOut}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">❌ Not signed in</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OAuth Providers */}
        <Card>
          <CardHeader>
            <CardTitle>OAuth Providers</CardTitle>
            <CardDescription>Available authentication providers</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {providers ? (
              <div className="space-y-4">
                {Object.values(providers).map((provider) => (
                  <div key={provider.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getProviderIcon(provider.id)}
                        <div>
                          <h3 className="font-semibold">{provider.name}</h3>
                          <p className="text-sm text-gray-600">ID: {provider.id}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSignIn(provider.id)}
                        disabled={loading || !!session}
                        variant="outline"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Test {provider.name}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading providers...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>OAuth configuration status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>NEXTAUTH_URL:</span>
                <span className="font-mono text-green-600">
                  {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>NEXTAUTH_SECRET:</span>
                <span className="font-mono text-green-600">
                  {process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Google OAuth:</span>
                <span className="font-mono">
                  {providers?.google ? '✅ Configured' : '❌ Not configured'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GitHub OAuth:</span>
                <span className="font-mono">
                  {providers?.github ? '✅ Configured' : '❌ Not configured'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            After testing login, you can go back to the main app
          </p>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              🏠 Home Page
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/classify'}>
              🔬 Test Classification (No Auth)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
