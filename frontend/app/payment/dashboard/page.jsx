'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'success':
      case 'settlement':
      case 'capture':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'deny':
      case 'cancel':
      case 'expire':
      case 'failure':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You must be logged in to view this page.</p>
          <Button 
            onClick={() => window.location.href = '/signin'}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Payment Transactions Dashboard</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Error Loading Transactions</h2>
          <p>{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">No Transactions Found</h2>
          <p className="text-gray-600 mb-4">There are no payment transactions recorded yet.</p>
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
                <th className="border p-2 text-left">Payment Method</th>
                <th className="border p-2 text-left">User</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="border p-2">{transaction.orderId}</td>
                  <td className="border p-2">{new Date(transaction.createdAt).toLocaleString()}</td>
                  <td className="border p-2">Rp {transaction.amount?.toLocaleString()}</td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="border p-2">{transaction.paymentMethod || '-'}</td>
                  <td className="border p-2">{transaction.userEmail}</td>
                  <td className="border p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/payment/receipt/${transaction.id}`, '_blank')}
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
    </div>
  );
}
