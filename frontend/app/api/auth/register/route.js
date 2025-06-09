import { NextResponse } from 'next/server';

// This route is not used as authentication is handled by NextAuth
// Registration is handled automatically when users sign in with OAuth providers
export async function POST() {
  return NextResponse.json(
    { error: 'Registration handled by NextAuth. Please use /api/auth/signin' },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Registration handled by NextAuth. Please use /api/auth/signin' },
    { status: 404 }
  );
}