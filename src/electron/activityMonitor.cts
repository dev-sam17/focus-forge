import { powerMonitor, app, BrowserWindow } from "electron";

interface IdleMonitor {
  stop: () => void;
  start: () => void;
  updateConfig: (newConfig: Partial<MonitorConfig>) => void;
  isRunning: () => boolean;
}

export interface MonitorConfig {
  idleThresholdSeconds: number;
  checkIntervalMs: number;
  debug: boolean;
}

// Configuration
const DEFAULT_CONFIG: MonitorConfig = {
  idleThresholdSeconds: 60, // 5 minutes
  checkIntervalMs: 5000, // Check every 5 seconds
  debug: true,
};

export function startIdleMonitoring(
  appInstance: typeof app,
  mainWindow: BrowserWindow,
  initialConfig = DEFAULT_CONFIG
): IdleMonitor {
  let isTracking = false;
  let intervalId: NodeJS.Timeout | null = null;

  let config: MonitorConfig = { ...initialConfig };

  function checkIdleTime() {
    const idleTime = powerMonitor.getSystemIdleTime();

    if (idleTime >= config.idleThresholdSeconds) {
      mainWindow.webContents.send("user-inactive", true);
      mainWindow.show();
    } else if (config.debug) {
      console.debug(`[Activity Monitor] Current idle time: ${idleTime}s`);
      mainWindow.webContents.send("user-idle-time", idleTime);
    }
  }

  function start() {
    if (isTracking) return;
    isTracking = true;

    checkIdleTime();
    intervalId = setInterval(checkIdleTime, config.checkIntervalMs);

    if (config.debug) {
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
      if (config.debug) {
        console.debug(
          "[Activity Monitor] System suspended, pausing monitoring"
        );
      }
      stop();
    });

    // Handle system wake - restart monitoring
    powerMonitor.on("resume", () => {
      if (config.debug) {
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

    if (config.debug) {
      console.debug("[Activity Monitor] Stopped monitoring");
    }
  }

  function updateConfig(newConfig: Partial<MonitorConfig>) {
    const wasRunning = isTracking;
    const oldCheckInterval = config.checkIntervalMs;

    config = { ...config, ...newConfig };

    if (config.debug) {
      console.debug("[Activity Monitor] Config updated:", config);
    }

    if (wasRunning && oldCheckInterval !== config.checkIntervalMs) {
      stop();
      start();
    }
  }

  function isRunning() {
    return isTracking;
  }

  // Setup event listeners first, then start monitoring
  setupEventListeners();
  start();

  return {
    stop,
    start,
    updateConfig,
    isRunning,
  };
}
