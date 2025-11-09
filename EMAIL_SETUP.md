# 📧 Email Setup Guide - Sending From User's Email

## The Problem You Identified

❌ **Before:** Email was always sent FROM the configured EMAIL_USER account  
✅ **Now:** Email can be sent FROM the user's own email address

---

## 🎯 Two Solutions

### **Option 1: SendGrid (RECOMMENDED for Production)**

**How it works:**
- ✅ Emails sent FROM user's actual email address
- ✅ Professional email delivery
- ✅ No "on behalf of" messages
- ✅ Better deliverability
- ✅ Supports multiple verified senders

**Setup:**

1. **Sign up for SendGrid:**
   - Go to https://sendgrid.com
   - Free tier: 100 emails/day
   - Paid plans for more volume

2. **Get API Key:**
   ```
   SendGrid Dashboard → Settings → API Keys → Create API Key
   ```

3. **Verify Sender Emails:**
   ```
   SendGrid → Settings → Sender Authentication
   → Verify a Single Sender → Add each user's email
   ```

4. **Add to `.env`:**
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

5. **Install SendGrid:**
   ```bash
   pip install sendgrid
   ```

**Result:**
```
From: user@company.com  ← User's actual email!
To: lead@targetcompany.com
```

---

### **Option 2: Yagmail with Reply-To (Good for Testing)**

**How it works:**
- ✅ Quick to set up
- ✅ Uses your Gmail account
- ⚠️ Email FROM your account, but replies go to user
- ⚠️ Shows "sent on behalf of" banner

**Setup:**

1. **Enable 2FA on Gmail:**
   - Go to Google Account → Security
   - Turn on 2-Step Verification

2. **Generate App Password:**
   ```
   Google Account → Security → App Passwords
   → Select "Mail" → Generate
   ```

3. **Add to `.env`:**
   ```bash
   EMAIL_USER=your.gmail@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

4. **Already installed:**
   ```bash
   # yagmail is in requirements.txt
   ```

**Result:**
```
From: your.gmail@gmail.com  ← Your configured account
Reply-To: user@company.com  ← User's email (for replies)

[Banner]: "Sent on behalf of user@company.com"
```

---

## 📊 Comparison

| Feature | SendGrid | Yagmail |
|---------|----------|---------|
| **Sender Email** | User's actual email | Your Gmail account |
| **Replies Go To** | User's email | User's email (via Reply-To) |
| **Recipient Sees** | Clean, professional | "Sent on behalf of" banner |
| **Setup Time** | 10 minutes | 5 minutes |
| **Cost** | Free (100/day) | Free |
| **Best For** | Production | Testing |
| **Deliverability** | Excellent | Good |
| **Email Verification** | Required per sender | Not required |

---

## 🚀 Quick Start

### Method 1: SendGrid (Production)

```bash
# 1. Install
pip install sendgrid

# 2. Add to .env
echo "SENDGRID_API_KEY=SG.your_key_here" >> .env

# 3. Verify sender emails in SendGrid dashboard

# 4. Restart API
python api.py

# ✅ You'll see: "Email Service: SendGrid"
```

### Method 2: Yagmail (Testing)

```bash
# 1. Add to .env
echo "EMAIL_USER=your.gmail@gmail.com" >> .env
echo "EMAIL_PASSWORD=your_app_password" >> .env

# 2. Restart API
python api.py

# ✅ You'll see: "Email Service: Yagmail (uses Reply-To)"
```

---

## 🎯 Which Should You Use?

### Use SendGrid if:
- ✅ Sending to clients/leads (professional)
- ✅ Multiple users sending emails
- ✅ Want clean, branded emails
- ✅ Need high deliverability
- ✅ Production environment

### Use Yagmail if:
- ✅ Testing the feature
- ✅ Personal use only
- ✅ Don't want to set up SendGrid
- ✅ Low volume emails
- ✅ Development environment

---

## 💡 How It Works Now

### User Flow:

1. **User enters their email** in "From" field
2. **Clicks "Send Email"**
3. **System checks:**
   - If `SENDGRID_API_KEY` exists → Use SendGrid
   - Else if `EMAIL_USER` exists → Use Yagmail
   - Else → Show error

### SendGrid Method:
```
Frontend → API → SendGrid → Recipient
Email shows: From: user@company.com
```

### Yagmail Method:
```
Frontend → API → Yagmail → Gmail → Recipient
Email shows: From: your.gmail@gmail.com
              Reply-To: user@company.com
              [Banner explaining it's sent on behalf]
```

---

## 🔧 Configuration Examples

### `.env` for SendGrid:
```bash
# Lead Generator
GEMINI_API_KEY=your_gemini_key

# Email (SendGrid - Recommended)
SENDGRID_API_KEY=SG.your_api_key_here
```

### `.env` for Yagmail:
```bash
# Lead Generator
GEMINI_API_KEY=your_gemini_key

# Email (Yagmail - Testing)
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password_16_chars
```

### `.env` for Both (Fallback):
```bash
# Lead Generator
GEMINI_API_KEY=your_gemini_key

# Email (SendGrid primary, Yagmail fallback)
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password_16_chars
```

---

## 📧 What Recipients See

### With SendGrid:
```
From: john@mycompany.com
To: lead@targetcompany.com
Subject: Partnership Opportunity

[Clean email content, no banner]
```

### With Yagmail:
```
From: automated@gmail.com
Reply-To: john@mycompany.com
To: lead@targetcompany.com
Subject: Partnership Opportunity

┌─────────────────────────────────────┐
│ 📧 Sent via LeadGen AI              │
│ From: john@mycompany.com            │
│ 💬 Click Reply to respond           │
└─────────────────────────────────────┘

[Email content]

────────────────────────────────────────
This email was sent on behalf of
john@mycompany.com using LeadGen AI.
Reply to contact sender directly.
```

---

## 🎓 SendGrid Setup Tutorial

### Step-by-Step:

**1. Create Account:**
- Go to https://sendgrid.com/pricing
- Choose Free plan (100 emails/day)
- Sign up with your email

**2. Verify Your Email:**
- Check your inbox
- Click verification link

**3. Create API Key:**
```
Dashboard → Settings → API Keys
→ Create API Key
→ Name: "LeadGen API"
→ Permissions: Full Access
→ Copy the API key (starts with SG.)
```

**4. Verify Sender Identity:**
```
Settings → Sender Authentication
→ Verify a Single Sender
→ Enter user's email (e.g., you@company.com)
→ User receives verification email
→ Click verify link
```

**5. Add Multiple Senders (if needed):**
- Repeat step 4 for each team member
- Or use Domain Authentication for entire domain

**6. Test:**
```bash
# Add to .env
SENDGRID_API_KEY=SG.your_copied_key

# Restart
python api.py

# Send test email from frontend
```

---

## 🐛 Troubleshooting

### "No email service configured"
```
Solution: Add either SENDGRID_API_KEY or EMAIL_USER to .env
```

### "SendGrid authentication failed"
```
Solution: 
1. Check API key in .env
2. Verify key in SendGrid dashboard
3. Make sure no extra spaces
```

### "Sender email not verified" (SendGrid)
```
Solution:
1. Go to SendGrid → Sender Authentication
2. Add and verify the sender's email
3. Wait for verification email and click link
```

### "Yagmail authentication failed"
```
Solution:
1. Use App Password (not regular password)
2. Enable 2FA on Gmail first
3. Generate new App Password
4. Copy all 16 characters
```

### "Emails going to spam"
```
Solution (SendGrid):
1. Complete Domain Authentication
2. Set up SPF, DKIM records
3. Warm up IP gradually

Solution (Yagmail):
1. Use SendGrid instead for better deliverability
```

---

## 🎯 Best Practices

### For SendGrid:
1. ✅ Verify all sender emails before use
2. ✅ Use domain authentication for better deliverability
3. ✅ Monitor your SendGrid dashboard
4. ✅ Stay within free tier limits (100/day)
5. ✅ Add unsubscribe links (for marketing emails)

### For Yagmail:
1. ✅ Use only for testing
2. ✅ Don't send high volumes
3. ✅ Keep App Password secure
4. ✅ Clear banner explains "on behalf of"
5. ✅ Switch to SendGrid for production

---

## 📊 Free Tier Limits

### SendGrid Free:
- 100 emails/day forever
- All features included
- Good deliverability
- Upgrade: $19.95/month (50K emails)

### Gmail/Yagmail Free:
- 500 emails/day (Gmail limit)
- May trigger spam filters
- Not meant for bulk sending

---

## 🚀 Migration Path

### Start with Yagmail (Testing):
```bash
# .env
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=app_password
```

### Move to SendGrid (Production):
```bash
# .env (just add SendGrid, keep Yagmail as backup)
SENDGRID_API_KEY=SG.your_key
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=app_password
```

System automatically uses SendGrid first!

---

## ✅ Success Checklist

- [ ] Choose email method (SendGrid or Yagmail)
- [ ] Add credentials to `.env`
- [ ] Install required packages
- [ ] Restart API server
- [ ] Check startup message for active method
- [ ] Send test email from frontend
- [ ] Verify recipient receives email
- [ ] Check "From" address is correct
- [ ] Test "Reply" goes to right person

---

## 🎉 Result

**Now your users can send emails FROM their own email addresses!**

✅ Professional appearance  
✅ Replies go to user  
✅ No confusion about sender  
✅ Multiple sending options  
✅ Production-ready  

---

**Questions? Check the API docs at http://localhost:8000/docs**

