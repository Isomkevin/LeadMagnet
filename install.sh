#!/bin/bash

echo "=================================================="
echo "🚀 Lead Generator - Complete Installation"
echo "=================================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo "📝 Creating .env template..."
    echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
    echo "✅ .env file created. Please add your API key!"
    echo "   Get your key from: https://aistudio.google.com/app/apikey"
    echo ""
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend

if [ -f package.json ]; then
    npm install
    
    if [ $? -eq 0 ]; then
        echo "✅ Frontend dependencies installed"
    else
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "❌ package.json not found in frontend directory"
    exit 1
fi

cd ..

echo ""
echo "=================================================="
echo "✅ Installation Complete!"
echo "=================================================="
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Add your GEMINI_API_KEY to the .env file"
echo "   nano .env"
echo ""
echo "2. Start the backend API (in terminal 1):"
echo "   python api.py"
echo ""
echo "3. Start the frontend (in terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open your browser:"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "=================================================="
echo "🎉 Happy Lead Generating!"
echo "=================================================="

