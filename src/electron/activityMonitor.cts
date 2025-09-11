import { powerMonitor, app, BrowserWindow } from "electron";

interface IdleMonitor {
  stop: () => void;
}

// Configuration
const DEFAULT_CONFIG = {
  idleThresholdSeconds: 180, // 3 minutes
  checkIntervalMs: 5000, // Check every 5 seconds
  debug: false,
};

export function startIdleMonitoring(
  appInstance: typeof app,
  mainWindow: BrowserWindow,
  config = DEFAULT_CONFIG
): IdleMonitor {
  let isTracking = false;
  let intervalId: NodeJS.Timeout | null = null;

  const { idleThresholdSeconds, checkIntervalMs, debug } = config;

  function checkIdleTime() {
    const idleTime = powerMonitor.getSystemIdleTime();

    if (idleTime >= idleThresholdSeconds) {
      mainWindow.webContents.send("user-inactive", true);
      mainWindow.show();
    } else if (debug) {
      console.debug(`[Activity Monitor] Current idle time: ${idleTime}s`);
      mainWindow.webContents.send("user-idle-time", idleTime);
    }
  }

  function start() {
    if (isTracking) return;
    isTracking = true;

    checkIdleTime(); // Initial check
    intervalId = setInterval(checkIdleTime, checkIntervalMs);

    // Handle normal app quit
    appInstance.on("before-quit", cleanup);

    // Handle system shutdown/restart
    powerMonitor.on("shutdown", cleanup);
    powerMonitor.on("suspend", cleanup);

    // Handle window close

    function cleanup() {
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send("user-inactive", true);
      }
      stop();
    }
  }

  function stop() {
    if (!isTracking) return;
    if (intervalId) clearInterval(intervalId);

    isTracking = false;
    intervalId = null;
  }

  start();

  return {
    stop,
  };
}
