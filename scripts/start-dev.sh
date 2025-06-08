#!/bin/bash

# Quick script to start all services at once
# Made this because I got tired of opening 3 terminals every time lol

echo "Starting all services..."
echo "=========================="

# Check if stuff is installed (learned this from stackoverflow)
command -v node >/dev/null 2>&1 || { echo "Need Node.js installed!" >&2; exit 1; }
command -v python >/dev/null 2>&1 || { echo "Need Python installed!" >&2; exit 1; }

echo "✅ Prerequisites check passed"

# Function to start a service in background
start_service() {
    local service_name=$1
    local directory=$2
    local command=$3
    
    echo "🔄 Starting $service_name..."
    cd $directory
    $command &
    local pid=$!
    echo "✅ $service_name started (PID: $pid)"
    cd ..
}

# Start ML Service
start_service "ML Service (Flask)" "ml-service" "python app.py"

# Wait a bit for ML service to start
sleep 3

# Start Backend
start_service "Backend (Hapi.js)" "backend" "npm run dev"

# Wait a bit for backend to start
sleep 3

# Start Frontend
start_service "Frontend (Next.js)" "frontend" "npm run dev"

echo "=================================================="
echo "🎉 All services started successfully!"
echo ""
echo "📝 Service URLs:"
echo "   Frontend:   http://localhost:3000"
echo "   Backend:    http://localhost:3001" 
echo "   ML Service: http://localhost:5000"
echo ""
echo "📋 To stop all services: Press Ctrl+C"
echo "=================================================="

# Wait for user interrupt
wait
