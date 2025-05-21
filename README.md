# 🕒 Time Tracker App

A lightweight, desktop time-tracking application built with **Electron** and **React**. Designed for developers and productivity-focused users to track daily work hours across multiple projects with support for tracking sessions, calculating work debt/advance, and archiving completed tasks.

---

## 🚀 Features

- ⏱️ Track time with start/stop sessions
- 📊 Compute daily work debt and advance
- 📁 Archive completed trackers
- 💾 Persistent storage on separate backend server
- 📉 Statistics view for daily performance ( coming in next version)
- 🎯 Set target daily hours per tracker

---

## 🛠 Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Prisma + MySql (Separate Backend)
- **Runtime**: Electron for cross-platform desktop support

---

## 📂 Project Structure

```
├── main/                   # Electron main process
│   └── db.ts               # SQLite DB layer
│   └── controllers/        # Express controllers
├── renderer/               # React app
│   └── components/         # UI Components
│   └── hooks/              # Custom React hooks (e.g., useApi)
│   └── lib/                # Shared types
├── public/                 # Static assets
├── preload.ts              # Electron preload bridge
├── main.ts                 # Electron bootstrap
└── package.json            # Project metadata
```

---

## ⚙️ Setup & Run

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run in development**:

   ```bash
   npm run dev
   ```

3. **Build for production**:

   ```bash
   npm run build
   npm run start
   ```

---

## 💡 Future Improvements

- Task tagging and filtering
- Weekly/monthly reports
- Cloud sync or export to CSV/JSON
- Notifications and reminders

---

## 📜 License

MIT License. Built with ❤️ by Sam.

