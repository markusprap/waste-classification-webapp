'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function PaymentDashboard() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.user) return;
    
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/payment/transactions');
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [session]);

  const getStatusBadge = (status) => {
    const variants = {
      'success': 'success',
      'settlement': 'success',
      'capture': 'success',
      'pending': 'warning',
      'deny': 'destructive',
      'cancel': 'destructive',
      'expire': 'destructive',
      'failure': 'destructive',
      'failed': 'destructive'
    };
    
    const variant = variants[status?.toLowerCase()] || 'secondary';
    
    return (
      <Badge variant={variant}>
        {status || 'Unknown'}
      </Badge>
    );
  };

  if (!session?.user) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view your payment history
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <a href="/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
          <CardDescription>
            View your payment history and subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              <h2 className="font-bold mb-2">Error Loading Transactions</h2>
              <p>{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h2 className="text-xl font-semibold mb-2">No Transactions Found</h2>
              <p className="text-gray-600 mb-4">You haven't made any payments yet.</p>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Return to Home
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Order ID</th>
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Amount</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">User</th>
                    <th className="border p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="border p-2 font-mono text-xs">{transaction.orderId?.substring(0, 15)}...</td>
                      <td className="border p-2">{new Date(transaction.createdAt).toLocaleString()}</td>
                      <td className="border p-2">Rp {transaction.amount?.toLocaleString()}</td>
                      <td className="border p-2">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="border p-2">{transaction.userEmail}</td>
                      <td className="border p-2">                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/payment/receipt/${transaction.id}`}
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
