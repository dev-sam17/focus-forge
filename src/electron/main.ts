import { app, BrowserWindow } from 'electron';
import { isDev } from './util.js';
import { pollResources } from './resourceManager.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';
import { startIdleMonitoring } from './activityMonitor.js';

function createWindow() {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }

  pollResources(mainWindow);

  return mainWindow;
}

app.on('will-quit', () => {
  console.log("Quitting..... ")
});

app.whenReady().then(() => {
  const mainWindow = createWindow();
  startIdleMonitoring(app, mainWindow);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



