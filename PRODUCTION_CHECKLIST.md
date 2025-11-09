# ✅ Production Deployment Checklist

## 🚨 CRITICAL - Do Before Pushing

### 1. Security
- [ ] **New Gemini API key generated** (old one was leaked!)
- [ ] `.env` file NOT committed to git
- [ ] Check git history: `git log --all -- .env`
- [ ] `.gitignore` includes `.env`
- [ ] No API keys hardcoded in code
- [ ] Email passwords are App Passwords (not regular passwords)

### 2. Environment Configuration
- [ ] Create production `.env` with new API key
- [ ] Set `ENVIRONMENT=production` in .env
- [ ] Configure `ALLOWED_ORIGINS` with your domain
- [ ] All required env vars set (see `env.example`)

### 3. CORS Configuration
- [ ] Update `ALLOWED_ORIGINS` environment variable
- [ ] Replace `http://localhost:3000` with your production domain
- [ ] Example: `ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`

### 4. Code Review
- [ ] No debug statements in code
- [ ] No `print()` statements with sensitive data
- [ ] Error messages don't expose internal details
- [ ] All endpoints have proper error handling
- [ ] Input validation on all endpoints

### 5. Dependencies
- [ ] `requirements.txt` up to date
- [ ] All packages have version constraints
- [ ] No development-only packages

### 6. Docker
- [ ] Dockerfile tested locally
- [ ] Docker builds successfully: `docker build -t leadgen .`
- [ ] Container runs: `docker run --env-file .env -p 8000:8000 leadgen`
- [ ] Health check passes: `curl http://localhost:8000/health`

### 7. API Testing
- [ ] Health endpoint works
- [ ] Lead generation works
- [ ] Email sending works
- [ ] File attachments work
- [ ] Error handling works
- [ ] Rate limits work

### 8. Frontend
- [ ] Frontend built: `cd frontend && npm run build`
- [ ] API URL updated for production
- [ ] Frontend deployed or ready to deploy
- [ ] Frontend connects to production API

### 9. Documentation
- [ ] README.md up to date
- [ ] API documentation accurate
- [ ] Deployment instructions clear
- [ ] Environment variables documented

### 10. Monitoring & Backup
- [ ] Plan for monitoring (uptime, errors)
- [ ] Plan for backups (if using database)
- [ ] Plan for log management
- [ ] Contact for alerts set up

---

## 🔐 Security Checklist

### API Keys
- [ ] New Gemini API key (not the leaked one!)
- [ ] API key stored in environment variables only
- [ ] Different keys for dev/staging/prod
- [ ] Keys not in git history
- [ ] `.env` in `.gitignore`

### CORS
- [ ] Not using `allow_origins=["*"]`
- [ ] Specific domains whitelisted
- [ ] Credentials enabled only if needed
- [ ] Methods restricted to necessary ones

### Input Validation
- [ ] All inputs validated (Pydantic models)
- [ ] Max limits enforced (50 companies max)
- [ ] Email validation
- [ ] File size limits (10MB per file)
- [ ] SQL injection protection (not applicable here)

### Error Handling
- [ ] No stack traces exposed to users
- [ ] Generic error messages
- [ ] Detailed errors only in logs
- [ ] Proper HTTP status codes

---

## 🚀 Deployment Steps

### Step 1: Prepare Code
```bash
# Make sure you have latest code
git pull origin main

# Verify .env exists (but is NOT in git)
ls -la .env
git status | grep .env  # Should NOT appear

# Copy env.example to .env if needed
cp env.example .env
nano .env  # Add your NEW API keys
```

### Step 2: Test Locally with Docker
```bash
# Build
docker build -t leadgen .

# Run
docker run -d -p 8000:8000 --env-file .env --name leadgen-test leadgen

# Test
curl http://localhost:8000/health
curl -X POST http://localhost:8000/api/v1/leads/generate \
  -H "Content-Type: application/json" \
  -d '{"industry":"technology","number":3,"country":"USA","enable_web_scraping":false}'

# Check logs
docker logs leadgen-test

# Stop
docker stop leadgen-test && docker rm leadgen-test
```

### Step 3: Update Production Settings
```bash
# In your .env file:
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com
GEMINI_API_KEY=your_NEW_key_here
```

### Step 4: Deploy

**Option A: Docker Compose**
```bash
docker-compose up -d --build
docker-compose logs -f
```

**Option B: Railway**
```bash
railway up
railway variables set GEMINI_API_KEY="your_NEW_key"
railway variables set ALLOWED_ORIGINS="https://yourdomain.com"
railway variables set ENVIRONMENT="production"
```

**Option C: Render**
```bash
# Push to GitHub
git push origin main

# Render auto-deploys
# Add env vars in Render dashboard
```

### Step 5: Verify Deployment
```bash
# Test health
curl https://your-domain.com/health

# Test lead generation
# Use API docs or Postman

# Check logs
# Via platform dashboard or docker logs
```

---

## ⚠️ Common Production Issues

### Issue: "CORS error"
```
Solution: Add your frontend domain to ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Issue: "API key not configured"
```
Solution: Set environment variable in deployment platform
Railway: railway variables set GEMINI_API_KEY="key"
Render: Add in Environment section
Docker: Update .env file
```

### Issue: "Email not sending"
```
Solution: Configure email credentials
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=app_password
Or use SendGrid for better deliverability
```

### Issue: "Container restarts continuously"
```
Solution: Check logs for errors
docker logs container_name
Common: Missing API key or dependency issue
```

---

## 🎯 Production Environment Variables

### Minimum Required:
```bash
GEMINI_API_KEY=your_key_here
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com
```

### Recommended:
```bash
# Core
GEMINI_API_KEY=your_key_here
ENVIRONMENT=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (choose one)
SENDGRID_API_KEY=SG.your_key  # Recommended
# OR
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=app_password

# Optional
PORT=8000
LOG_LEVEL=info
```

---

## 📊 Post-Deployment Monitoring

### Week 1:
- [ ] Check logs daily
- [ ] Monitor API usage
- [ ] Test all features
- [ ] Watch for errors
- [ ] Check email deliverability

### Ongoing:
- [ ] Weekly log review
- [ ] Monthly API key rotation
- [ ] Update dependencies quarterly
- [ ] Backup data regularly
- [ ] Monitor costs

---

## 🔧 Rollback Plan

If deployment fails:

**Docker:**
```bash
docker stop leadgen-api
docker run -d -p 8000:8000 --env-file .env leadgen:previous-tag
```

**Railway/Render:**
- Use platform's rollback feature
- Revert to previous deployment

**Git:**
```bash
git revert HEAD
git push origin main
```

---

## 🎉 Final Check

Before going live:

```bash
# 1. Build Docker image
docker build -t leadgen .

# 2. Run locally with production settings
docker run -d -p 8000:8000 --env-file .env leadgen

# 3. Test all endpoints
curl http://localhost:8000/health
# Test lead generation
# Test email sending

# 4. Check logs for errors
docker logs leadgen

# 5. If all good, deploy to production!
```

---

## ✅ You're Ready When:

- ✅ NEW API key configured (not the leaked one!)
- ✅ `.env` NOT in git
- ✅ CORS configured for your domain
- ✅ Docker builds successfully
- ✅ Health check passes
- ✅ All tests pass
- ✅ Error handling tested
- ✅ Monitoring plan ready

---

## 🚀 Deploy Command

When all checks pass:

```bash
# Local production test
./deploy.sh

# Or cloud deploy
railway up
# or
git push origin main  # If using Render/Heroku
```

---

## 🆘 Emergency Contacts

**If something breaks:**
1. Check logs immediately
2. Verify environment variables
3. Test health endpoint
4. Roll back if necessary
5. Fix issue, test locally, re-deploy

---

**Good luck with your deployment!** 🚀

**Remember: Test thoroughly before going live!**

