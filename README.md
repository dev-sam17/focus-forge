# ⚡ Focus Forge

A lightweight, desktop time-tracking application built with **Electron** and **React**. Designed for developers and productivity-focused users to forge better focus and track daily work hours across multiple projects with support for tracking sessions, calculating work debt/advance, and archiving completed tasks.

---

## 🚀 Features

- ⏱️ Track time with start/stop sessions
- 📊 Compute daily work debt and advance
- 🕒 Inactivity detection and auto-stop
- 📁 Archive completed trackers
- 💾 Persistent storage on separate backend server
- 📉 Statistics view for daily performance ( coming in next version)
- 🎯 Set target daily hours per tracker

---

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + TailwindCSS 4.1.3
- **Authentication**: Supabase Auth with Google & Facebook OAuth
- **Backend**: Centralized backend service (API calls)
- **Runtime**: Electron 35.1.4 for cross-platform desktop support
- **Build System**: Vite 6.2.0 + PNPM 10.7.1

---

## 📂 Project Structure

```
├── src/
│   ├── electron/           # Electron main process
│   │   ├── main.ts         # Main process entry point
│   │   ├── activityMonitor.ts # User idle detection
│   │   └── resourceManager.ts # System monitoring
│   ├── renderer/           # React app
│   │   └── App.tsx         # Main React component
│   ├── components/         # UI Components
│   │   ├── auth/           # Authentication components
│   │   ├── ui/             # Reusable UI components
│   │   └── Dashboard.tsx   # Main dashboard
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Supabase auth state
│   │   └── ThemeContext.tsx # Dark/light theme
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utilities and configs
├── public/                 # Static assets
└── package.json            # Project metadata
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+ 
- PNPM 10.7.1+
- Supabase project with Google & Facebook OAuth configured

### Environment Setup
1. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

2. **Configure Supabase**:
   - Set `VITE_SUPABASE_URL` to your Supabase project URL
   - Set `VITE_SUPABASE_ANON_KEY` to your Supabase anon public key
   - Set `VITE_API_URL` to your backend API endpoint

### Installation & Development
1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run in development**:
   ```bash
   pnpm dev
   ```

3. **Build for production**:
   ```bash
   pnpm build
   pnpm start
   ```

---

## 🔐 Authentication

Focus Forge uses **Supabase Auth** for secure user authentication:

- **Google OAuth**: Sign in with your Google account
- **Facebook OAuth**: Sign in with your Facebook account  
- **Session Management**: Automatic token refresh and persistence
- **Protected Routes**: Dashboard access requires authentication

## 🎨 Features

- **Anime-Style UI**: Modern glass morphism design with vibrant gradients
- **Dark Mode**: Eye-friendly dark theme with toggle support
- **Real-time Tracking**: Live timer with activity monitoring
- **Responsive Design**: Optimized for desktop with up to 5-column grid
- **System Integration**: Tray icon, window controls, and idle detection

## 💡 Future Improvements

- Task tagging and filtering
- Weekly/monthly reports
- Additional OAuth providers (GitHub, Discord)
- Export to CSV/JSON
- Notifications and reminders
- Team collaboration features

---

## 📜 License

MIT License. Built with ❤️ by Sam.

