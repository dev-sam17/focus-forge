import { app, BrowserWindow, Menu, Tray, nativeImage, shell } from "electron";
import { join } from "node:path";
import { startIdleMonitoring } from "./activityMonitor.cjs";
import { isDev } from "./util.cjs";
import { pollResources } from "./resourceManager.cjs";
import { getPreloadPath, getUIPath } from "./pathResolver.cjs";
import { setupAutoUpdater } from "./updater.cjs";

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let forceQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Focus Forge",
    width: 800,
    height: 600,
    frame: true,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#ffffff00",
      symbolColor: "#ffffff",
      height: 30,
    },
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(getUIPath());
  }

  // Create context menu
  mainWindow.webContents.on("context-menu", () => {
    const contextMenu = Menu.buildFromTemplate([
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { type: "separator" },
      { role: "selectAll" },
      { type: "separator" },
      { role: "reload" },
      { role: "toggleDevTools" },
    ]);
    contextMenu.popup();
  });

  // Prevent window from being closed
  mainWindow.on("close", (event) => {
    if (!forceQuit) {
      event.preventDefault();
      mainWindow?.hide();
      return false;
    }
  });

  pollResources(mainWindow);

  return mainWindow;
}

function createTray() {
  let iconPath;
  if (isDev()) {
    iconPath = join(process.cwd(), "app-icon.png");
  } else {
    // iconPath = join(app.getAppPath(), "..", 'app-icon.png');
    iconPath = join(process.resourcesPath, "app-icon.ico");
  }

  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    console.error("Failed to load tray icon:", iconPath);
  }
  tray = new Tray(icon);
  tray.setToolTip("Focus Forge");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show App",
      click: () => {
        mainWindow?.show();
      },
    },
    {
      label: "Quit",
      click: () => {
        forceQuit = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    mainWindow?.show();
  });
}

app.on("will-quit", () => {
  // App is quitting
});

// Handle OAuth redirects for production
app.setAsDefaultProtocolClient('focus-forge');

// Handle deep links for OAuth callbacks
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleOAuthCallback(url);
});

// Handle protocol on Windows/Linux
app.on('second-instance', (event, commandLine) => {
  // Handle OAuth callback from second instance
  const url = commandLine.find(arg => arg.startsWith('focus-forge://'));
  if (url) {
    handleOAuthCallback(url);
  }
  
  // Focus main window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function handleOAuthCallback(url: string) {
  console.log('Received OAuth callback URL:', url);
  if (mainWindow && (url.includes('access_token') || url.includes('code') || url.includes('auth/callback'))) {
    // Send the callback URL to the renderer process
    mainWindow.webContents.send('oauth-callback', url);
    mainWindow.show();
    mainWindow.focus();
    
    // Also navigate to the callback page if it's a code-based flow
    if (url.includes('code=')) {
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      if (code) {
        // Navigate to the auth callback page with the code
        mainWindow.loadURL(`file://${getUIPath()}#/auth/callback?code=${code}`);
      }
    }
  }
}

// Handle external links
app.on('web-contents-created', (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Handle OAuth URLs in external browser for better compatibility
    if (url.includes('accounts.google.com') || url.includes('facebook.com/login')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
});

// Single instance lock - prevent multiple app instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    mainWindow = createWindow();
    createTray();
    if (app.isPackaged) {
      setupAutoUpdater();
    }
    startIdleMonitoring(app, mainWindow);
  });
}


// Quit when all windows are closed, except on macOS
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on("activate", function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});
