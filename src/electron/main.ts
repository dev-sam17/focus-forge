import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import { isDev } from './util.js';
import { pollResources } from './resourceManager.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';
import { startIdleMonitoring } from './activityMonitor.js';
import { join } from 'path';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let forceQuit = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Time Tracker',
    width: 800,
    height: 600,
    frame: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1d293d',
      symbolColor: '#ffffff',
      height: 30
    },
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: true,
      spellcheck: true
    },
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }

  // Create context menu
  mainWindow.webContents.on('context-menu', () => {
    const contextMenu = Menu.buildFromTemplate([
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { type: 'separator' },
      { role: 'selectAll' },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'toggleDevTools' }
    ]);
    contextMenu.popup();
  });

  // Prevent window from being closed
  mainWindow.on('close', (event) => {
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
    iconPath = join(process.resourcesPath, 'app-icon.ico');
  }
  
  const icon = nativeImage.createFromPath(iconPath);
  if (icon.isEmpty()) {
    console.error('Failed to load tray icon:', iconPath);
  }
  tray = new Tray(icon);
  tray.setToolTip('Time Tracker');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow?.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        forceQuit = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
  });
}

app.on('will-quit', () => {
  console.log("Quitting..... ")
});

app.whenReady().then(() => {
  mainWindow = createWindow();
  createTray();
  startIdleMonitoring(app, mainWindow);
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});
