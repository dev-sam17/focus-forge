import { app, BrowserWindow } from 'electron';
import { isDev } from './util.js';
import { pollResources } from './resourceManager.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';


app.on('ready', async () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });
  // Pass server port to the renderer
  // This line is crucial for communicating the port!
  // (global as any).serverPort = serverPort;

  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }

  pollResources(mainWindow);

});

app.on('will-quit', () => {
  console.log("Quitting..... ")
});

