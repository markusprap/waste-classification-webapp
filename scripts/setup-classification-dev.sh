#!/bin/bash
# Development setup script for classification feature

echo "🚀 Setting up development environment for classification feature..."

# Create feature branch
echo "📝 Creating feature branch..."
git checkout develop
git checkout -b feature/classification

# Install dependencies if needed
echo "📦 Checking dependencies..."
cd frontend && npm install
cd ../backend && npm install
cd ..

# Setup development environment
echo "⚙️ Setting up development environment..."
echo "Frontend will run on: http://localhost:3000"
echo "Backend will run on: http://localhost:3001"

# Create development env if not exists
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend .env.local template..."
    cat > frontend/.env.local << EOF
# Development Environment Variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Midtrans (Sandbox)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-sandbox-client-key
MIDTRANS_SERVER_KEY=your-sandbox-server-key
MIDTRANS_IS_PRODUCTION=false

# Database
DATABASE_URL="file:./dev.db"

# OAuth (optional for development)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF
fi

echo "✅ Development environment ready!"
echo ""
echo "🎯 Next steps for classification feature:"
echo "1. Start backend: cd backend && npm start"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Open http://localhost:3000"
echo "4. Start developing classification features!"
echo ""
echo "📁 Classification feature areas to work on:"
echo "- frontend/src/components/features/classification/"
echo "- frontend/app/classify/"
echo "- backend/src/controllers/ (add classificationController.js)"
echo "- backend/src/routes/ (add classificationRoutes.js)"
