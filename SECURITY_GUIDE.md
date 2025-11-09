# 🔒 Security Guide - API Key Protection

## 🚨 Your API Key Was Leaked

### What Happened:
Your Gemini API key was exposed publicly and Google automatically disabled it for security.

### Common Causes:
- ❌ Committed `.env` file to GitHub
- ❌ Shared code with API key hardcoded
- ❌ Posted code screenshot with key visible
- ❌ Uploaded to public repository

---

## ✅ Immediate Fix

### 1. Get New API Key

Visit: https://aistudio.google.com/app/apikey

```
1. Find your current key (marked as "leaked" or "compromised")
2. Click "Delete" on the old key
3. Click "Create API Key"
4. Copy the new key immediately
```

### 2. Update `.env` File

```bash
cd /Users/danielsamuel/PycharmProjects/LEAD-generator
nano .env
```

Replace with NEW key:
```bash
GEMINI_API_KEY=AIza...your_NEW_key_here
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Restart API

```bash
# Press Ctrl+C to stop current API
python api.py
```

### 4. Test

```bash
# Should work now
curl http://localhost:8000/health
```

---

## 🛡️ Prevent Future Leaks

### ✅ Step 1: Verify `.gitignore` Exists

I've created a `.gitignore` file that protects:
- `.env` files
- API keys
- Secrets
- Output files

**Verify:**
```bash
cat .gitignore | grep .env
```

Should show:
```
.env
.env.local
.env.*.local
```

### ✅ Step 2: Never Hardcode API Keys

**❌ BAD:**
```python
api_key = "AIzaSyC..."  # NEVER DO THIS!
```

**✅ GOOD:**
```python
api_key = os.getenv('GEMINI_API_KEY')  # Always use env vars
```

### ✅ Step 3: Check Before Committing

```bash
# Before git commit, check:
git status

# If you see .env listed:
git rm --cached .env
git commit -m "Remove .env from tracking"

# Add to .gitignore if not there
echo ".env" >> .gitignore
```

### ✅ Step 4: Use `.env.example`

Create template without real keys:
```bash
# .env.example (safe to commit)
GEMINI_API_KEY=your_gemini_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### ✅ Step 5: Regular Key Rotation

Rotate API keys every 3-6 months:
1. Create new key
2. Update `.env`
3. Restart services
4. Delete old key

---

## 🔍 Check for Leaks

### If You've Committed to Git:

**Check if `.env` is in your repo:**
```bash
git log --all --full-history -- .env
```

**If found, you need to:**
```bash
# Remove from history (use carefully!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (if already pushed to GitHub)
git push origin --force --all
```

**Better solution:** Use BFG Repo-Cleaner:
```bash
brew install bfg  # on Mac
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 🔐 Best Practices

### ✅ DO:
1. Store keys in `.env` files
2. Add `.env` to `.gitignore`
3. Use environment variables
4. Rotate keys regularly
5. Monitor usage in Google Console
6. Use different keys for dev/prod
7. Limit API key permissions
8. Set usage quotas

### ❌ DON'T:
1. Hardcode keys in code
2. Commit `.env` to git
3. Share keys in chat/email
4. Post screenshots with keys
5. Use same key everywhere
6. Share keys between team members
7. Leave keys in logs
8. Expose keys in URLs

---

## 🚀 Production Security

### For Production Deployment:

**1. Use Secret Management:**
- AWS Secrets Manager
- Google Secret Manager
- HashiCorp Vault
- Azure Key Vault

**2. Environment-Specific Keys:**
```bash
# Development
GEMINI_API_KEY_DEV=key_for_dev

# Production
GEMINI_API_KEY_PROD=key_for_prod
```

**3. API Key Restrictions:**
In Google Console:
- Restrict by IP address
- Restrict by HTTP referrer
- Set usage quotas
- Enable billing alerts

**4. Monitoring:**
- Set up usage alerts
- Monitor API quotas
- Track unusual activity
- Log all API calls

---

## 📊 Security Checklist

- [x] New API key generated
- [x] `.env` file updated
- [x] `.gitignore` created
- [ ] Check git history for `.env`
- [ ] Remove `.env` from git if found
- [ ] Restart API server
- [ ] Test lead generation
- [ ] Monitor API usage
- [ ] Set up usage alerts

---

## 🔍 Monitor Your API Usage

**Google AI Studio Dashboard:**
https://aistudio.google.com/app/apikey

Check:
- Request count
- Token usage
- Error rates
- Unusual patterns

Set alerts for:
- High usage
- Unusual activity
- Multiple failed requests

---

## 🆘 If Key Leaked Again

1. **Immediately disable key** in Google Console
2. **Generate new key**
3. **Update `.env`**
4. **Find and fix leak source**
5. **Review all code/repos**
6. **Check GitHub/GitLab commits**
7. **Rotate all other keys as precaution**

---

## 📧 Email Security

Same principles apply to email credentials:

```bash
# .env
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=app_password_16_chars  # Use App Password, not regular password
```

**Protection:**
- ✅ In `.env` (protected by `.gitignore`)
- ✅ App Password (can be revoked)
- ✅ Not regular Gmail password
- ✅ Limited to mail sending only

---

## 🎯 Quick Recovery Steps

```bash
# 1. Get new API key
open https://aistudio.google.com/app/apikey

# 2. Update .env
echo "GEMINI_API_KEY=your_NEW_key" > .env
echo "EMAIL_USER=your@gmail.com" >> .env
echo "EMAIL_PASSWORD=your_app_pass" >> .env

# 3. Verify .gitignore
cat .gitignore | grep .env

# 4. Restart
python api.py

# 5. Test
curl http://localhost:8000/health
```

---

## ✅ You're Protected Now

With the `.gitignore` I created:
- ✅ `.env` files won't be committed
- ✅ API keys are safe
- ✅ Secrets protected
- ✅ Output files excluded
- ✅ Best practices followed

---

## 🎉 Summary

**Do This Now:**
1. Get new Gemini API key
2. Update `.env` file
3. Restart API server
4. Test that it works

**Your system is now secure!** 🔒

Check if `.env` is in your git history and remove it if needed.

---

**Questions? Read this guide or check Google AI Studio documentation.**

