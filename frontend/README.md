# Lead Generator Frontend

Modern, beautiful AI Agent Dashboard for lead generation.

## 🎨 Features

- ✨ **Miro-inspired canvas design** with clean, modern UI
- 🎭 **AI Agent Playground** showing real-time process flow
- 📊 **Interactive node visualization** for each stage
- 🎬 **Smooth animations** with Framer Motion
- 📱 **Responsive design** for all screen sizes
- 🔄 **Real-time updates** with polling
- 💾 **Export functionality** for JSON data

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start the API Backend

Make sure the API server is running:

```bash
# In the parent directory
python api.py
```

### 3. Start Frontend

```bash
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── InputForm.jsx           # Initial input form
│   │   ├── AgentPlayground.jsx     # Main playground view
│   │   ├── Sidebar.jsx             # Miro-style sidebar
│   │   ├── ProcessCanvas.jsx       # Canvas with nodes
│   │   ├── ProcessNode.jsx         # Individual process node
│   │   └── ResultsPanel.jsx        # Results display panel
│   ├── App.jsx                     # Main app component
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 User Flow

1. **Input Form** → User enters industry, number, country
2. **Agent Playground** → Canvas shows process nodes
3. **Real-time Processing** → Nodes animate through stages:
   - Initializing
   - AI Generation
   - Web Scraping (if enabled)
   - Data Consolidation
   - Completed
4. **Results Panel** → Slides in from right with lead data
5. **Export** → Download results as JSON

## 🎨 Design Inspiration

- **Miro** - Clean canvas, grid pattern, minimal sidebar
- **AI Agent Dashboard** - Node visualization, metrics, modern cards
- **Modern UI/UX** - Smooth animations, intuitive interactions

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - API calls

## 🔧 Configuration

The frontend connects to the API at `http://localhost:8000` (configured in `vite.config.js`).

To change the API URL:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://your-api-url:8000',
      changeOrigin: true,
    }
  }
}
```

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

Preview production build:

```bash
npm run preview
```

## 🎬 Features in Action

### Input Form
- Beautiful gradient cards
- Smooth animations on load
- Real-time validation
- Toggle for web scraping

### Agent Playground
- Miro-style canvas with grid pattern
- Animated process nodes
- Progress indicators
- Real-time status updates

### Process Nodes
- Icon-based visualization
- Active state animations
- Progress bars
- Checkmarks on completion
- Glow effects for active nodes

### Results Panel
- Slide-in animation
- Expandable company cards
- Social media links
- Export functionality
- Detailed company information

## 🎨 Customization

### Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#3b82f6',  // Main brand color
        ...
      }
    }
  }
}
```

### Animations

Edit `src/index.css` for custom animations.

## 📱 Responsive Design

- Desktop: Full canvas with sidebar and results panel
- Tablet: Adapted layout
- Mobile: Stack layout

## 🐛 Troubleshooting

**Port 3000 already in use:**
```bash
# Change port in vite.config.js
server: {
  port: 3001
}
```

**API connection error:**
- Ensure API server is running on port 8000
- Check CORS settings in API

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Performance

- Lazy loading for components
- Optimized animations
- Minimal re-renders
- Efficient polling strategy

## 📄 License

Same as parent project - for business and educational use.

---

**Enjoy your modern AI Lead Generator! 🎉**

