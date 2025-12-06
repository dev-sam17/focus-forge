import { powerMonitor, app, BrowserWindow } from "electron";

interface IdleMonitor {
  stop: () => void;
}

// Configuration
const DEFAULT_CONFIG = {
  idleThresholdSeconds: 300, // 5 minutes
  checkIntervalMs: 5000, // Check every 5 seconds
  debug: true,
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

    if (debug) {
      console.debug("[Activity Monitor] Started monitoring");
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    // Handle normal app quit
    appInstance.on("before-quit", cleanup);

    // Handle system shutdown/restart
    powerMonitor.on("shutdown", cleanup);

    // Handle system sleep - stop monitoring
    powerMonitor.on("suspend", () => {
      if (debug) {
        console.debug(
          "[Activity Monitor] System suspended, pausing monitoring"
        );
      }
      stop();
    });

    // Handle system wake - restart monitoring
    powerMonitor.on("resume", () => {
      if (debug) {
        console.debug(
          "[Activity Monitor] System resumed, restarting monitoring"
        );
      }
      start();
    });

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

  // Setup event listeners first, then start monitoring
  setupEventListeners();
  start();

  return {
    stop,
  };
}
