import { NextResponse } from 'next/server';

// This route is not used as authentication is handled by NextAuth
// Redirecting to NextAuth sign-in page
export async function POST() {
  return NextResponse.json(
    { error: 'Authentication handled by NextAuth. Please use /api/auth/signin' },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Authentication handled by NextAuth. Please use /api/auth/signin' },
    { status: 404 }
  );
}