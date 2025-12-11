import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  nativeImage,
  shell,
  ipcMain,
} from "electron";
import { join } from "node:path";
import { startIdleMonitoring, type MonitorConfig } from "./activityMonitor.cjs";
import { isDev } from "./util.cjs";
import { pollResources } from "./resourceManager.cjs";
import { getPreloadPath, getUIPath } from "./pathResolver.cjs";
import { setupAutoUpdater } from "./updater.cjs";

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let forceQuit = false;
let activityMonitor: ReturnType<typeof startIdleMonitoring> | null = null;

function createWindow() {
  // Configure title bar based on platform
  const titleBarConfig =
    process.platform === "darwin"
      ? {
          // macOS: Use hidden-inset to show traffic lights on the left
          frame: false,
          titleBarStyle: "hiddenInset" as const,
          titleBarOverlay: false,
        }
      : {
          // Windows/Linux: Use custom title bar overlay
          frame: true,
          titleBarStyle: "hidden" as const,
          titleBarOverlay: {
            color: "#ffffff00",
            symbolColor: "#ffffff",
            height: 30,
          },
        };

  mainWindow = new BrowserWindow({
    title: "Focus Forge",
    width: 850,
    height: 600,
    ...titleBarConfig,
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
  if (process.platform === "win32") {
    mainWindow.on("close", (event) => {
      if (!forceQuit) {
        event.preventDefault();
        mainWindow?.hide();
        return false;
      }
    });
  }

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

// Protocol client registration moved to app.whenReady()

// Handle deep links for OAuth callbacks
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleOAuthCallback(url);
});

// Handle protocol on Windows/Linux
app.on("second-instance", (event, commandLine) => {
  // Handle OAuth callback from second instance
  const url = commandLine.find((arg) => arg.startsWith("focus-forge://"));
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
  console.log("Received OAuth callback URL:", url);
  if (
    mainWindow &&
    (url.includes("access_token") ||
      url.includes("code") ||
      url.includes("auth/callback"))
  ) {
    // Ensure the main window is ready
    if (mainWindow.webContents.isLoading()) {
      mainWindow.webContents.once("did-finish-load", () => {
        mainWindow!.webContents.send("oauth-callback", url);
      });
    } else {
      // Send the callback URL to the renderer process
      mainWindow.webContents.send("oauth-callback", url);
    }

    mainWindow.show();
    mainWindow.focus();

    // Don't navigate to a different URL - let the renderer handle the callback
    // The renderer process will handle the code exchange and session management
  }
}

// Handle external links
app.on("web-contents-created", (event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    // Handle OAuth URLs in external browser for better compatibility
    if (
      url.includes("accounts.google.com") ||
      url.includes("facebook.com/login")
    ) {
      shell.openExternal(url);
      return { action: "deny" };
    }

    // Handle OAuth callback URLs
    if (url.includes("focus-forge://")) {
      handleOAuthCallback(url);
      return { action: "deny" };
    }

    return { action: "allow" };
  });

  // Also handle navigation events
  contents.on("will-navigate", (event, url) => {
    if (url.includes("focus-forge://")) {
      event.preventDefault();
      handleOAuthCallback(url);
    }
  });
});

// IPC: open external URLs from renderer (used for OAuth flows)
ipcMain.handle("open-external", async (_event, url: string) => {
  try {
    await shell.openExternal(url);
  } catch (err) {
    console.error("Failed to open external URL:", url, err);
  }
});

// IPC: Activity monitor controls
ipcMain.handle("activity-monitor-start", async () => {
  if (activityMonitor) {
    activityMonitor.start();
    return { success: true };
  }
  return { success: false, error: "Activity monitor not initialized" };
});

ipcMain.handle("activity-monitor-stop", async () => {
  if (activityMonitor) {
    activityMonitor.stop();
    return { success: true };
  }
  return { success: false, error: "Activity monitor not initialized" };
});

ipcMain.handle(
  "activity-monitor-update-config",
  async (_event, config: Partial<MonitorConfig>) => {
    if (activityMonitor) {
      activityMonitor.updateConfig(config);
      return { success: true };
    }
    return { success: false, error: "Activity monitor not initialized" };
  }
);

ipcMain.handle("activity-monitor-is-running", async () => {
  if (activityMonitor) {
    return { running: activityMonitor.isRunning() };
  }
  return { running: false };
});

// Single instance lock - prevent multiple app instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    mainWindow = createWindow();
    if (process.platform === "win32") {
      createTray();
    }

    // Register as protocol client after app is ready
    // On Linux, this needs to be done with proper path handling
    if (process.platform === "linux") {
      // For Linux, we need to ensure the protocol is registered with the correct executable path
      if (app.isPackaged) {
        const success = app.setAsDefaultProtocolClient(
          "focus-forge",
          process.execPath
        );
        console.log(
          `Linux protocol registration (packaged): ${
            success ? "SUCCESS" : "FAILED"
          }`
        );
        console.log(`Executable path: ${process.execPath}`);
      } else {
        // In development, use the electron executable
        const success = app.setAsDefaultProtocolClient(
          "focus-forge",
          process.execPath,
          [process.cwd()]
        );
        console.log(
          `Linux protocol registration (dev): ${success ? "SUCCESS" : "FAILED"}`
        );
        console.log(`Executable path: ${process.execPath}`);
        console.log(`Working directory: ${process.cwd()}`);
      }
    } else {
      // For Windows and macOS, the simple registration works
      const success = app.setAsDefaultProtocolClient("focus-forge");
      console.log(
        `Protocol registration (${process.platform}): ${
          success ? "SUCCESS" : "FAILED"
        }`
      );
    }

    // Handle deep link if app launched via protocol (Windows/Linux first instance)
    const deeplink = process.argv.find((arg) =>
      arg.startsWith("focus-forge://")
    );
    if (deeplink) {
      handleOAuthCallback(deeplink);
    }
    if (app.isPackaged) {
      setupAutoUpdater();
    }
    activityMonitor = startIdleMonitoring(app, mainWindow);
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
