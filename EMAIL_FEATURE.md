# 📧 Email Feature Documentation

## Overview

Beautiful Gmail-inspired email composer with AI-powered suggestions, rich text editing, and direct email sending from the dashboard.

---

## 🎨 UI Features

### AITOPIA-Inspired Design

**Modern Agentic UI with:**
- ✨ Clean modal overlay
- 🎯 AI-powered email suggestions
- 📝 Rich text editor (ReactQuill)
- 🔧 Full formatting toolbar
- 📎 Attachment support
- 🎙️ Voice input button
- 💡 Smart suggestions
- ⚙️ Settings options

---

## 🚀 How It Works

### 1. **Click Email Button**
On any company card with an email address, click the "Email" button

### 2. **Modal Appears**
Beautiful modal slides in with:
- Company information summary
- AI-generated email suggestions
- Rich text composer
- Formatting tools

### 3. **Choose AI Suggestion (Optional)**
Three pre-written email templates:
- 🤝 **Professional** - Formal partnership outreach
- 💡 **Value Proposition** - Focus on benefits
- 🎯 **Direct** - Straight to the point

Click any suggestion to auto-fill the email body

### 4. **Customize & Send**
- Edit the content with rich text editor
- Add formatting (bold, italic, lists)
- Attach files or images
- Click "Send Email"

---

## 🎯 Features

### **Header Bar**
```
┌─────────────────────────────────────────┐
│ ✨ LeadGen AI │ English ▼ │ 🎙️ Voice │
│                    💡 ⚙️ ✕             │
└─────────────────────────────────────────┘
```

### **Recipient Info Card**
Shows company details:
- Company name
- Size and location
- Revenue info
- Number of users

### **AI Suggestions**
Three click-to-use templates:
- Emoji indicators
- Template preview
- One-click insertion

### **Email Form**
- **From:** Your email input
- **To:** Auto-filled from lead data
- **Subject:** Editable subject line
- **Body:** Rich text editor

### **Rich Text Editor (ReactQuill)**
Toolbar options:
- Headers (H1, H2)
- **Bold**, *Italic*, <u>Underline</u>
- Bulleted/numbered lists
- Text alignment
- Links
- Clean formatting

### **Footer Toolbar**
```
[Bold] [Attach] [Image] [Lock] [Pen] [...]  [Send Email →]
```

---

## 🔧 Backend Setup

### 1. **Install yagmail**
```bash
pip install yagmail
```

### 2. **Configure Email Credentials**

Add to `.env` file:
```bash
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password
```

**For Gmail:**
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate App Password
4. Use App Password (not your regular password)

---

## 📡 API Endpoints

### Send Email
```http
POST /api/v1/email/send
```

**Request:**
```json
{
  "from_email": "you@company.com",
  "to_email": "lead@company.com",
  "subject": "Partnership Opportunity",
  "body": "<p>Email content with <strong>HTML</strong></p>",
  "attachments": ["path/to/file.pdf"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "to": "lead@company.com",
  "from": "you@company.com",
  "sent_at": "2024-01-01T12:00:00"
}
```

### Generate Email Content (Future)
```http
POST /api/v1/email/generate-content
```

Generate AI-powered email templates based on company info.

---

## 🎨 UI Components

### EmailModal Component

**Props:**
- `company` - Company data object
- `onClose` - Close modal function

**State:**
- `fromEmail` - User's email
- `subject` - Email subject
- `body` - Email content (HTML)
- `sending` - Loading state
- `showSuggestions` - Toggle suggestions

**Features:**
- Backdrop click to close
- ESC key to close (can be added)
- Prevent body scroll when open
- Smooth animations

---

## 📝 Email Templates

### Template 1: Professional
```
Dear [Company] Team,

I hope this email finds you well. I came across your 
company and was impressed by your work in [industry].

Would you be available for a brief call to discuss 
potential partnerships?
```

### Template 2: Value Proposition
```
Hi [Company],

I noticed your impressive growth serving [users]. 
We specialize in helping companies like yours expand.

I'd love to share how we can add value to your business.
```

### Template 3: Direct
```
Hello,

I'm reaching out because I believe our services could 
benefit [Company].

Would next week work for a brief discussion?
```

---

## 🎯 Usage Flow

```
User clicks "Email" button
         ↓
Modal opens with company info
         ↓
User sees AI suggestions
         ↓
Click suggestion or write custom
         ↓
Format text with toolbar
         ↓
Add from email
         ↓
Click "Send Email"
         ↓
API call to /api/v1/email/send
         ↓
Yagmail sends email
         ↓
Success message & close modal
```

---

## 🎨 Design System

### Colors
- **Primary:** Blue (#3b82f6)
- **Success:** Green (#22c55e)
- **Gray Scale:** 50-900
- **Gradient:** Primary 600 → 700

### Spacing
- Modal: 2xl rounded (1.5rem)
- Padding: 1.5rem (24px)
- Gaps: 1rem (16px)

### Typography
- Headers: Bold, large
- Body: Regular, 14px
- Labels: Semibold, 12px

### Animations
- Modal: Scale + fade
- Buttons: Hover scale 1.05
- Loading: Spin animation

---

## 🔒 Security

### Best Practices
✅ Use App Passwords (not regular passwords)
✅ Store credentials in .env
✅ Never commit .env to git
✅ Validate email addresses
✅ Sanitize HTML content
✅ Rate limiting on API

### Gmail App Password Setup
1. Enable 2FA on your Google Account
2. Go to Security → App Passwords
3. Generate password for "Mail"
4. Use this 16-character password

---

## 📊 Features Breakdown

| Feature | Status | Description |
|---------|--------|-------------|
| Modal UI | ✅ | Gmail-inspired design |
| AI Suggestions | ✅ | 3 pre-written templates |
| Rich Text Editor | ✅ | ReactQuill integration |
| Email Sending | ✅ | Yagmail backend |
| Attachments UI | ✅ | Button present |
| Attachments Backend | 🔄 | Needs file upload |
| Voice Input | 🔄 | Button present |
| Multi-recipient | 🔄 | Single recipient only |

---

## 🚀 Future Enhancements

### Phase 2
- [ ] File upload for attachments
- [ ] Image inline insertion
- [ ] Email templates library
- [ ] Save drafts
- [ ] Schedule emails

### Phase 3
- [ ] AI content generation
- [ ] Email tracking (opens, clicks)
- [ ] Follow-up reminders
- [ ] Bulk email sending
- [ ] A/B testing

### Phase 4
- [ ] Email sequences
- [ ] CRM integration
- [ ] Analytics dashboard
- [ ] Team collaboration
- [ ] Email signatures

---

## 📱 Responsive Design

### Desktop (1024px+)
- Full modal width (max-w-4xl)
- Side-by-side layout
- All features visible

### Tablet (768px-1023px)
- Adjusted modal width
- Stacked suggestions
- Simplified toolbar

### Mobile (<768px)
- Full screen modal
- Collapsed suggestions
- Essential tools only

---

## 🐛 Troubleshooting

### Email not sending

**Check:**
1. EMAIL_USER and EMAIL_PASSWORD in .env
2. Using App Password (not regular password)
3. 2FA enabled on Gmail
4. Internet connection
5. API logs for errors

**Common Issues:**
- "Authentication failed" → Wrong password
- "SMTP error" → Check Gmail settings
- "Network error" → Check connectivity

### Modal not opening

**Check:**
1. Company has email address
2. Console for errors
3. EmailModal component imported
4. State updated correctly

---

## 💡 Tips

### For Best Results
1. **Personalize:** Edit AI suggestions with company-specific details
2. **Keep it short:** 2-3 paragraphs max
3. **Clear CTA:** Always include next steps
4. **Professional tone:** Match company culture
5. **Follow up:** Schedule reminder if no response

### Email Best Practices
- Subject line: Clear, relevant, under 50 chars
- Opening: Personalized greeting
- Body: Value proposition + proof
- Closing: Clear call-to-action
- Signature: Professional contact info

---

## ✅ Checklist

Before sending emails:

- [ ] .env configured with credentials
- [ ] API server running
- [ ] Frontend npm packages installed
- [ ] Yagmail installed (`pip install yagmail`)
- [ ] Email address entered in "From" field
- [ ] Subject line is clear
- [ ] Email body is proofread
- [ ] CTA is included

---

## 🎉 Result

**Beautiful, functional email composer that:**

✅ Looks professional (Gmail-inspired)
✅ Works perfectly (sends real emails)
✅ Has AI assistance (smart suggestions)
✅ Rich text editing (formatting toolbar)
✅ Modern animations (smooth, polished)
✅ Easy to use (intuitive flow)

**Ready to send emails to your leads!** 📧✨

---

**Questions? Check the main README or API docs at http://localhost:8000/docs**

