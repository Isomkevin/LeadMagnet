# 🚀 Complete Setup Guide - Frontend + Backend

## Quick Start (5 minutes)

### Step 1: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Configure API Key

Create `.env` file in the root directory:

```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

Get your API key from: https://aistudio.google.com/app/apikey

### Step 3: Start Backend API

```bash
python api.py
```

API will start on: http://localhost:8000

### Step 4: Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### Step 5: Start Frontend

```bash
npm run dev
```

Frontend will start on: http://localhost:3000

---

## 🎯 That's it! Open http://localhost:3000 in your browser

---

## 📦 What You'll See

### 1. **Input Form** (First Screen)
- Enter target industry (e.g., "health insurance", "technology")
- Select number of companies (1-50)
- Choose country
- Toggle web scraping on/off
- Click "Generate Leads →"

### 2. **Agent Playground** (Processing Screen)
- Miro-style canvas with grid pattern
- Animated process nodes showing:
  - ✨ Initializing
  - 🧠 AI Generation
  - 🌐 Web Scraping (if enabled)
  - 💾 Data Consolidation
  - ✅ Completed
- Real-time progress indicators
- Glowing active nodes

### 3. **Results Panel** (Right Side)
- Slides in when complete
- Shows all generated leads
- Click companies to expand details
- Export to JSON button

---

## 🎨 UI/UX Features

✅ **Modern Design** - Clean, minimal, professional  
✅ **Smooth Animations** - Framer Motion powered  
✅ **Real-time Updates** - See progress as it happens  
✅ **Interactive Nodes** - Visual process flow  
✅ **Expandable Cards** - Click to see full details  
✅ **Export Function** - Download results instantly  

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: GEMINI_API_KEY not found**
```bash
# Make sure .env file exists with your key
cat .env
# Should show: GEMINI_API_KEY=your_key
```

**Error: Port 8000 already in use**
```bash
# Kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Or change port in api.py:
uvicorn.run("api:app", host="0.0.0.0", port=8001)
```

### Frontend Won't Start

**Error: npm not found**
```bash
# Install Node.js from https://nodejs.org
# Or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

**Error: Port 3000 in use**
```bash
# Frontend will automatically try port 3001
# Or change in vite.config.js
```

**Error: Cannot connect to API**
```bash
# Make sure backend is running on port 8000
curl http://localhost:8000/health

# Check proxy settings in vite.config.js
```

---

## 📊 Testing the System

### Test 1: Quick Generation (No Scraping)
```
Industry: technology
Number: 5
Country: USA
Web Scraping: OFF
Expected time: 10-30 seconds
```

### Test 2: Full Generation (With Scraping)
```
Industry: health insurance
Number: 3
Country: USA
Web Scraping: ON
Expected time: 2-5 minutes
```

---

## 🎯 API Endpoints (For Reference)

```
GET  /health                           - Check API status
POST /api/v1/leads/generate           - Generate leads (sync)
POST /api/v1/leads/generate-async     - Generate leads (async)
GET  /api/v1/leads/status/{job_id}    - Check job status
GET  /api/v1/leads/export/{job_id}    - Export results
```

Test API directly:
```bash
curl http://localhost:8000/health
```

Interactive docs:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🚀 Production Deployment

### Backend (FastAPI)

**Using Docker:**
```bash
docker build -t lead-generator-api .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key lead-generator-api
```

**Using Gunicorn:**
```bash
gunicorn api:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend (React)

**Build:**
```bash
cd frontend
npm run build
```

**Deploy:**
- Upload `dist/` folder to:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - Any static hosting

**Environment Variables:**
- Update API URL in production
- Add `.env.production` if needed

---

## 📁 Project Structure

```
LEAD-generator/
├── api.py                          # FastAPI backend
├── generate_health_insurance.py    # Lead generation logic
├── web_scraper.py                  # Web scraping
├── requirements.txt                # Python dependencies
├── .env                           # API keys (create this)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── InputForm.jsx
    │   │   ├── AgentPlayground.jsx
    │   │   ├── ProcessCanvas.jsx
    │   │   ├── ProcessNode.jsx
    │   │   └── ResultsPanel.jsx
    │   ├── App.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## 🎓 Next Steps

1. ✅ Start both servers
2. ✅ Generate your first leads
3. ✅ Explore the UI
4. ✅ Export results
5. ✅ Customize for your needs

---

## 💡 Tips

- Start with **web scraping OFF** for faster testing
- Use **async endpoint** for large requests
- Export results to integrate with your CRM
- Check console for detailed logs
- Use Chrome DevTools to inspect API calls

---

## 📞 Need Help?

- Check API docs: http://localhost:8000/docs
- Review frontend README: `frontend/README.md`
- Check API logs in terminal
- Check browser console for frontend errors

---

## 🎉 You're Ready!

Your modern AI Lead Generator is now running!

**Frontend:** http://localhost:3000  
**Backend:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs  

Enjoy generating leads! 🚀

