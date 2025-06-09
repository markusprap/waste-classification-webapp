'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '@/models/auth-context';
import { Button } from '@/components/ui/button';
import testMidtransIntegration from '@/utils/test-midtrans';

export default function TestMidtransPage() {
  const { data: session } = useSession();
  const { user, upgradePlan } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  const handleRunTest = () => {
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      setLogs(prev => [...prev, { type: 'log', message: args.join(' ') }]);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      setLogs(prev => [...prev, { type: 'error', message: args.join(' ') }]);
      originalError(...args);
    };
    
    console.warn = (...args) => {
      setLogs(prev => [...prev, { type: 'warning', message: args.join(' ') }]);
      originalWarn(...args);
    };
    
    try {
      testMidtransIntegration();
    } finally {
      // Restore console functions
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    }
  };

  const handleTestPayment = async () => {
    if (!session || !user) {
      setResult({ success: false, error: 'You must be logged in to test payment' });
      return;
    }
    
    setLoading(true);
    setResult(null);
    
    try {
      const result = await upgradePlan('premium');
      setResult(result);
    } catch (error) {
      setResult({ success: false, error: error.message || 'Payment test failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Midtrans Payment Integration Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment Check</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Session Status</h3>
            <div className="text-sm">
              {session ? (
                <div className="text-green-600">✅ Logged in as {session.user.email}</div>
              ) : (
                <div className="text-red-600">❌ Not logged in</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium mb-2">User Plan</h3>
            <div className="text-sm">
              {user ? (
                <div className="text-green-600">✅ Current plan: {user.plan}</div>
              ) : (
                <div className="text-red-600">❌ User data not available</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Client Key</h3>
            <div className="text-sm">
              {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? (
                <div className="text-green-600">✅ Client key is set</div>
              ) : (
                <div className="text-red-600">❌ Client key is not set</div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Midtrans Script</h3>
            <div className="text-sm">
              {typeof window !== 'undefined' && window.snap ? (
                <div className="text-green-600">✅ Midtrans script is loaded</div>
              ) : (
                <div className="text-yellow-600">⚠️ Midtrans script not detected</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <Button onClick={handleRunTest} variant="outline">
          Run Integration Test
        </Button>
        
        <Button 
          onClick={handleTestPayment} 
          disabled={loading || !session}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {loading ? 'Processing...' : 'Test Real Payment Flow'}
        </Button>
      </div>
      
      {result && (
        <div className={`p-4 rounded-lg mb-8 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
          <h2 className="text-xl font-semibold mb-2">Test Result</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
          <h2 className="text-xl font-semibold mb-2">Test Logs</h2>
          <div className="font-mono text-sm">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'warning' ? 'text-yellow-400' : 'text-green-400'
                }`}
              >
                {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
