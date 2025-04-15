import { app, BrowserWindow } from 'electron';
import { ipcMainHandle, isDev } from './util.js';
import { pollResources } from './resourceManager.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';
import express from 'express';
import cors from 'cors';
import * as portfinder from 'portfinder';
import { Server } from 'http';
import trackerRoutes from './trackerRoutes.js';

// Store server reference and port globally
let server: Server
let PORT = 0;

async function createServer() {
  // Create Express app
  const expressApp = express();

  // Configure Express middleware
  expressApp.use(cors()); // Allow CORS from renderer
  expressApp.use(express.json()); // Parse JSON request bodies

  // Define your API routes
  expressApp.use('/api', trackerRoutes);
  expressApp.get('ping', (req, res) => {
    res.send('pong');
  });

  // Find an available port (starting from 3000)
  portfinder.setBasePort(3000);
  PORT = await portfinder.getPortPromise();

  // Start the server
  server = expressApp.listen(PORT, () => {
    console.log(`Express server running at http://localhost:${PORT}`);
  });

  // Return the port for the renderer to use
  return PORT;
}


app.on('ready', async () => {
  const serverPort = await createServer();
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
  ipcMainHandle('getServerPort', () => serverPort)

});

app.on('will-quit', () => {
  if (server) {
    console.log('Shutting down Express server');
    server.close();
  }
});

