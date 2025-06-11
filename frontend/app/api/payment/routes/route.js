import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    apiRoutes: {
      createTransaction: '/api/payment/create-transaction',
      clientKey: '/api/payment/client-key',
      serverStatus: '/api/payment/server-status'
    },
    backendRoutes: {
      createTransaction: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/create-transaction`,
      clientKey: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/client-key`,
      serverStatus: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/server-status`
    },
    environment: {
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
      backendUrl: process.env.BACKEND_URL,
      midtransEnv: process.env.MIDTRANS_ENV
    }
  });
}
