import React from 'react';

export const dynamic = 'force-dynamic'

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Business Model Features Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Authentication */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">🔐 Authentication</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ User Registration & Login</li>
            <li>✅ JWT Token Authentication</li>
            <li>✅ Password Hashing (bcrypt)</li>
            <li>✅ Forgot Password Flow</li>
            <li>✅ User Profile Management</li>
          </ul>
        </div>

        {/* Freemium Model */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">💰 Freemium Model</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Free Plan (5 classifications/day)</li>
            <li>✅ Premium Plan (50 classifications/day)</li>
            <li>✅ Corporate Plan (unlimited)</li>
            <li>✅ Usage Tracking & Limits</li>
            <li>✅ Plan Upgrade System</li>
          </ul>
        </div>

        {/* REST API */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">🔌 REST API</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ /api/auth/register</li>
            <li>✅ /api/auth/login</li>
            <li>✅ /api/auth/profile</li>
            <li>✅ /api/classify</li>
            <li>✅ /api/classify/history</li>
            <li>✅ /api/upgrade</li>
          </ul>
        </div>

        {/* Premium Features */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">⭐ Premium Features</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Analytics Dashboard</li>
            <li>✅ Classification History</li>
            <li>✅ Usage Statistics</li>
            <li>✅ Data Visualization</li>
            <li>✅ Export Data (Corporate)</li>
          </ul>
        </div>

        {/* Security */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">🔒 Security</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Rate Limiting</li>
            <li>✅ Input Validation</li>
            <li>✅ SQL Injection Protection</li>
            <li>✅ Token Expiration</li>
            <li>✅ Error Handling</li>
          </ul>
        </div>

        {/* UI/UX */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4">🎨 UI/UX</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Responsive Design</li>
            <li>✅ Bilingual Support (ID/EN)</li>
            <li>✅ Loading States</li>
            <li>✅ Error Messages</li>
            <li>✅ Success Feedback</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-xl font-semibold mb-4 text-green-800">🎯 Test Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
          <li>Click the "Login" button in the navbar to test authentication</li>
          <li>Register a new account or login with existing credentials</li>
          <li>Try uploading an image to test classification with usage limits</li>
          <li>Check the user dashboard for usage statistics</li>
          <li>Test plan upgrades from free to premium/corporate</li>
          <li>Access analytics dashboard (premium+ only)</li>
          <li>Try data export (corporate only)</li>
          <li>Test forgot password functionality</li>
        </ol>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">📊 Business Model Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Free Tier</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• 5 classifications/day</li>
              <li>• Basic waste classification</li>
              <li>• No analytics</li>
              <li>• Limited support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Premium Tier</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• 50 classifications/day</li>
              <li>• Analytics dashboard</li>
              <li>• Classification history</li>
              <li>• Priority support</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Corporate Tier</h3>
            <ul className="space-y-1 text-blue-700">
              <li>• Unlimited classifications</li>
              <li>• Advanced analytics</li>
              <li>• Data export (CSV/JSON)</li>
              <li>• Dedicated support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
