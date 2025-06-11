# Development setup script for classification feature (Windows)

Write-Host "🚀 Setting up development environment for classification feature..." -ForegroundColor Green

# Create feature branch
Write-Host "📝 Creating feature branch..." -ForegroundColor Yellow
git checkout develop
git checkout -b feature/classification

# Install dependencies if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..\backend
npm install
Set-Location ..

# Setup development environment
Write-Host "⚙️ Setting up development environment..." -ForegroundColor Yellow
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend will run on: http://localhost:3001" -ForegroundColor Cyan

# Create development env if not exists
if (!(Test-Path "frontend\.env.local")) {
    Write-Host "📝 Creating frontend .env.local template..." -ForegroundColor Yellow
    @"
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
"@ | Out-File -FilePath "frontend\.env.local" -Encoding UTF8
}

Write-Host "✅ Development environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps for classification feature:" -ForegroundColor Magenta
Write-Host "1. Start backend: cd backend && npm start" -ForegroundColor White
Write-Host "2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:3000" -ForegroundColor White
Write-Host "4. Start developing classification features!" -ForegroundColor White
Write-Host ""
Write-Host "📁 Classification feature areas to work on:" -ForegroundColor Magenta
Write-Host "- frontend/src/components/features/classification/" -ForegroundColor White
Write-Host "- frontend/app/classify/" -ForegroundColor White
Write-Host "- backend/src/controllers/ (add classificationController.js)" -ForegroundColor White
Write-Host "- backend/src/routes/ (add classificationRoutes.js)" -ForegroundColor White
