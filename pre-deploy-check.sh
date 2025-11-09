#!/bin/bash

echo "=================================================="
echo "🔍 Pre-Deployment Security & Readiness Check"
echo "=================================================="
echo ""

ERRORS=0
WARNINGS=0

# Check 1: .env file exists
echo "1. Checking .env file..."
if [ -f .env ]; then
    echo "   ✅ .env file exists"
else
    echo "   ❌ ERROR: .env file not found!"
    echo "      Create .env from env.example"
    ERRORS=$((ERRORS+1))
fi
echo ""

# Check 2: .env not in git
echo "2. Checking if .env is tracked by git..."
if git ls-files --error-unmatch .env 2>/dev/null; then
    echo "   ❌ CRITICAL: .env is tracked by git!"
    echo "      Run: git rm --cached .env"
    ERRORS=$((ERRORS+1))
else
    echo "   ✅ .env is not tracked by git"
fi
echo ""

# Check 3: .gitignore contains .env
echo "3. Checking .gitignore..."
if [ -f .gitignore ]; then
    if grep -q "^\.env$" .gitignore; then
        echo "   ✅ .env is in .gitignore"
    else
        echo "   ⚠️  WARNING: .env not found in .gitignore"
        echo "      Adding .env to .gitignore..."
        echo ".env" >> .gitignore
        WARNINGS=$((WARNINGS+1))
    fi
else
    echo "   ❌ ERROR: .gitignore not found"
    ERRORS=$((ERRORS+1))
fi
echo ""

# Check 4: GEMINI_API_KEY is set
echo "4. Checking GEMINI_API_KEY..."
if [ -f .env ]; then
    if grep -q "GEMINI_API_KEY=.*[A-Za-z0-9]" .env; then
        # Check if it's not the placeholder
        if grep -q "GEMINI_API_KEY=your_" .env; then
            echo "   ❌ ERROR: GEMINI_API_KEY is still a placeholder!"
            echo "      Add your real API key"
            ERRORS=$((ERRORS+1))
        else
            echo "   ✅ GEMINI_API_KEY is configured"
        fi
    else
        echo "   ❌ ERROR: GEMINI_API_KEY not set in .env"
        ERRORS=$((ERRORS+1))
    fi
fi
echo ""

# Check 5: Email configuration
echo "5. Checking email configuration..."
EMAIL_CONFIGURED=0
if [ -f .env ]; then
    if grep -q "SENDGRID_API_KEY=SG\." .env; then
        echo "   ✅ SendGrid configured"
        EMAIL_CONFIGURED=1
    elif grep -q "EMAIL_USER=.*@" .env && grep -q "EMAIL_PASSWORD=" .env; then
        echo "   ✅ Yagmail configured"
        EMAIL_CONFIGURED=1
    fi
fi

if [ $EMAIL_CONFIGURED -eq 0 ]; then
    echo "   ⚠️  WARNING: No email service configured"
    echo "      Email features won't work"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# Check 6: Docker
echo "6. Checking Docker..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker is installed: $(docker --version)"
else
    echo "   ⚠️  WARNING: Docker not installed"
    echo "      Install from: https://docs.docker.com/get-docker/"
    WARNINGS=$((WARNINGS+1))
fi
echo ""

# Check 7: Required Python files
echo "7. Checking required files..."
REQUIRED_FILES=("api.py" "generate_health_insurance.py" "web_scraper.py" "email_sender.py" "requirements.txt" "Dockerfile")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ ERROR: $file missing"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

# Check 8: Docker build test
echo "8. Testing Docker build..."
if command -v docker &> /dev/null; then
    echo "   Building Docker image (this may take a minute)..."
    docker build -t leadgen-test . > /tmp/docker-build.log 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Docker image builds successfully"
        docker rmi leadgen-test > /dev/null 2>&1
    else
        echo "   ❌ ERROR: Docker build failed"
        echo "      Check /tmp/docker-build.log for details"
        ERRORS=$((ERRORS+1))
    fi
else
    echo "   ⏭️  Skipped (Docker not installed)"
fi
echo ""

# Check 9: Frontend
echo "9. Checking frontend..."
if [ -d "frontend" ]; then
    if [ -f "frontend/package.json" ]; then
        echo "   ✅ Frontend exists"
        
        if [ -d "frontend/node_modules" ]; then
            echo "   ✅ Dependencies installed"
        else
            echo "   ⚠️  WARNING: Frontend dependencies not installed"
            echo "      Run: cd frontend && npm install"
            WARNINGS=$((WARNINGS+1))
        fi
    fi
else
    echo "   ⚠️  Frontend directory not found"
fi
echo ""

# Check 10: Git status
echo "10. Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ $UNCOMMITTED -gt 0 ]; then
        echo "   ⚠️  WARNING: You have $UNCOMMITTED uncommitted changes"
        echo "      Commit or stash before deploying"
        WARNINGS=$((WARNINGS+1))
    else
        echo "   ✅ Working directory is clean"
    fi
    
    # Check for .env in git
    if git ls-files --error-unmatch .env 2>/dev/null; then
        echo "   ❌ CRITICAL: .env is committed to git!"
        echo "      This is a SECURITY RISK!"
        ERRORS=$((ERRORS+1))
    fi
else
    echo "   ℹ️  Not a git repository"
fi
echo ""

# Summary
echo "=================================================="
echo "📊 Pre-Deployment Check Summary"
echo "=================================================="
echo ""
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ DEPLOYMENT BLOCKED"
    echo ""
    echo "You have $ERRORS critical error(s) that must be fixed before deploying."
    echo "Review the errors above and fix them."
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  WARNINGS FOUND"
    echo ""
    echo "You have $WARNINGS warning(s)."
    echo "Review them, but deployment can proceed."
    echo ""
    read -p "Continue with deployment? [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled"
        exit 1
    fi
else
    echo "✅ ALL CHECKS PASSED"
    echo ""
    echo "Your application is ready for deployment!"
    echo ""
fi

echo "=================================================="
echo "🚀 Ready to Deploy!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Quick Deploy (Local Docker):"
echo "   ./deploy.sh"
echo ""
echo "2. Deploy to Railway:"
echo "   railway up"
echo ""
echo "3. Deploy to Render:"
echo "   git push origin main"
echo ""
echo "4. Manual Docker:"
echo "   docker-compose up -d --build"
echo ""
echo "=================================================="

