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
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }

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
  const iconPath = join(process.cwd(), "app-icon.png");
  tray = new Tray(nativeImage.createFromPath(iconPath));
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

  // Double click on tray icon shows the window
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
