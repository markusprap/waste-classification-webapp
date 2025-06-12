'use client';

import React from 'react';

export default function AuthError({ error }) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
      <p>There was an error during authentication: {error?.message || 'Unknown error'}</p>
      <p>Please try again or contact support if the problem persists.</p>
    </div>
  );
}
