import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  shell,
  ipcMain,
  nativeImage,
} from "electron";
import { join } from "node:path";
import path from "node:path";
import { startIdleMonitoring } from "./activityMonitor.cjs";
import { isDev } from "./util.cjs";
import { pollResources } from "./resourceManager.cjs";
import { getPreloadPath, getUIPath } from "./pathResolver.cjs";

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

// Removed external URL handling - no longer needed for in-app OAuth

// Single instance lock - prevent multiple app instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    mainWindow = createWindow();
    createTray();
    startIdleMonitoring(app, mainWindow);

    // No protocol URL handling needed for in-app OAuth
  });
}

// Handle second instance - just focus the main window
app.on("second-instance", (event, commandLine) => {
  // Someone tried to run a second instance, focus our window instead
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

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
