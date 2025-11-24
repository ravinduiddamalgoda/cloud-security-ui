#!/bin/bash

# Configuration Status Checker
# Verifies frontend-backend integration setup

echo "🔍 SIEM Dashboard Configuration Status Check"
echo "=============================================="
echo ""

# Check if .env file exists
echo "📝 Environment Configuration:"
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    
    # Check mock data setting
    if grep -q "REACT_APP_USE_MOCK_DATA=true" .env; then
        echo "   📊 Mode: MOCK DATA (Development)"
        echo "   ℹ️  No backend required"
    elif grep -q "REACT_APP_USE_MOCK_DATA=false" .env; then
        echo "   🔌 Mode: API (Production)"
        echo "   ⚠️  Backend required"
    else
        echo "   ⚠️  REACT_APP_USE_MOCK_DATA not set"
    fi
    
    # Check API URL
    API_URL=$(grep "REACT_APP_API_URL=" .env | cut -d '=' -f2)
    if [ ! -z "$API_URL" ]; then
        echo "   🌐 API URL: $API_URL"
    else
        echo "   ⚠️  REACT_APP_API_URL not set"
    fi
else
    echo "   ❌ .env file not found"
    echo "   💡 Run: cp .env.example .env"
fi

echo ""
echo "📦 Dependencies:"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules installed"
else
    echo "   ❌ node_modules not found"
    echo "   💡 Run: npm install"
fi

echo ""
echo "🔧 Backend Status:"

# Check if using API mode
if grep -q "REACT_APP_USE_MOCK_DATA=false" .env 2>/dev/null; then
    API_URL=$(grep "REACT_APP_API_URL=" .env | cut -d '=' -f2)
    
    # Try to reach backend health endpoint
    if command -v curl &> /dev/null; then
        if curl -s --max-time 3 "$API_URL/api/health" > /dev/null 2>&1; then
            echo "   ✅ Backend is reachable at $API_URL"
            
            # Get health status
            HEALTH=$(curl -s "$API_URL/api/health" 2>/dev/null)
            if [ ! -z "$HEALTH" ]; then
                echo "   📡 Backend Response: $HEALTH"
            fi
        else
            echo "   ❌ Backend not reachable at $API_URL"
            echo "   💡 Start backend: cd ../SIEM_Tool_AWS && python app.py"
            echo "   💡 Or switch to mock mode: echo 'REACT_APP_USE_MOCK_DATA=true' > .env"
        fi
    else
        echo "   ⚠️  curl not available, cannot check backend"
    fi
else
    echo "   ℹ️  Using mock data mode - backend not required"
fi

echo ""
echo "📁 Project Structure:"

# Check for key files
FILES=(
    "src/AdvancedDashboard.jsx"
    "src/axiosConfig.js"
    "package.json"
    "INTEGRATION_GUIDE.md"
    "QUICK_START.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file"
    fi
done

echo ""
echo "🚀 Quick Commands:"
echo "   Development (mock data):  npm run start:mock"
echo "   Development (with API):   npm run start:api"
echo "   Standard start:           npm start"
echo "   Production build:         npm run build:production"

echo ""
echo "📚 Documentation:"
echo "   Quick Start:    cat QUICK_START.md"
echo "   Full Guide:     cat INTEGRATION_GUIDE.md"
echo "   Main README:    cat README.md"

echo ""
echo "=============================================="

# Exit with appropriate code
if [ -f ".env" ] && [ -d "node_modules" ]; then
    echo "✅ Setup looks good! Ready to run."
    exit 0
else
    echo "⚠️  Setup incomplete. Review the checks above."
    exit 1
fi
