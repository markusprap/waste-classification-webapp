'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function AuthTestContent() {
  const searchParams = useSearchParams();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <p>This is a test page for authentication.</p>
    </div>
  );
}

export default function AuthTestPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthTestContent />
    </Suspense>
  );
}