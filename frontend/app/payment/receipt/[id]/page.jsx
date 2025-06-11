'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Printer, Download, ArrowLeft } from 'lucide-react';

export default function ReceiptPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const [resolvedParams, setResolvedParams] = useState(null);
  
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);
  
  useEffect(() => {
    if (!resolvedParams?.id) return;
    
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/payment/receipt/${resolvedParams.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch receipt');
        }
        
        const data = await response.json();
        setReceipt(data.receipt);
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setError(err.message);
      } finally {
        setLoading(false);      }
    };
    
    fetchReceipt();
  }, [resolvedParams]);
  
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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleBack = () => {
    router.push('/payment/dashboard');
  };
  
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem retrieving the receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
              {error}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!receipt) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Receipt Not Found</CardTitle>
            <CardDescription>
              The requested receipt could not be found
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="space-x-2">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
      
      <Card className="shadow-md print:shadow-none" id="receipt">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Payment Receipt</CardTitle>
              <CardDescription>
                Order ID: <span className="font-mono">{receipt.orderId}</span>
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Date</div>
              <div>{formatDate(receipt.transactionDate)}</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Customer</h3>
              <div className="font-medium">{receipt.customer.name}</div>
              <div>{receipt.customer.email}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <div>{getStatusBadge(receipt.status)}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Details</h3>
            <div className="border rounded-md">
              <div className="grid grid-cols-3 p-3 border-b">
                <div className="font-medium">Item</div>
                <div className="font-medium text-center">Plan</div>
                <div className="font-medium text-right">Amount</div>
              </div>
              
              <div className="grid grid-cols-3 p-3">
                <div>Subscription</div>
                <div className="text-center">{receipt.plan}</div>
                <div className="text-right">
                  {receipt.currency} {receipt.amount?.toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-3 p-3 border-t bg-gray-50">
                <div className="col-span-2 font-medium">Total</div>
                <div className="font-medium text-right">
                  {receipt.currency} {receipt.amount?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          
          {receipt.endDate && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Subscription Period</h3>
              <div>
                <span>{formatDate(receipt.startDate)}</span> to <span>{formatDate(receipt.endDate)}</span>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t text-center text-sm text-gray-500 pt-6">
          <div className="w-full">
            <p>Thank you for your purchase!</p>
            <p>WasteWise AI - Waste Classification Service</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
