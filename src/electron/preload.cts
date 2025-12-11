/// <reference types="electron" />
import type {
  EventPayloadMapping,
  Statistics,
  UnsubscribeFunction,
} from "../../types";

const electron = require("electron");

function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
  ...args: unknown[]
): Promise<EventPayloadMapping[Key]> {
  return electron.ipcRenderer.invoke(key, ...args);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
): UnsubscribeFunction {
  const cb = (
    _: Electron.IpcRendererEvent,
    payload: EventPayloadMapping[Key]
  ) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}

const electronAPI = {
  subscribeStatistics: (callback: (stats: Statistics) => void) => {
    return ipcOn("statistics", (stats: Statistics) => {
      callback(stats);
    });
  },
  subscribeUserIdleTime: (callback: (idleTime: number) => void) => {
    return ipcOn("user-idle-time", (idleTime: number) => {
      callback(idleTime);
    });
  },
  subscribeUserInactive: (callback: (inactive: boolean) => void) => {
    return ipcOn("user-inactive", (inactive: boolean) => {
      callback(inactive);
    });
  },
  getStaticData: () => {
    return ipcInvoke("getStaticData");
  },
  openExternal: (url: string) => {
    return ipcInvoke("open-external", url);
  },
  onOAuthCallback: (callback: (url: string) => void) => {
    return ipcOn("oauth-callback", (url: string) => {
      callback(url);
    });
  },
  activityMonitor: {
    start: () => {
      return ipcInvoke("activity-monitor-start");
    },
    stop: () => {
      return ipcInvoke("activity-monitor-stop");
    },
    updateConfig: (config: {
      idleThresholdSeconds?: number;
      checkIntervalMs?: number;
      debug?: boolean;
    }) => {
      return ipcInvoke("activity-monitor-update-config", config);
    },
    isRunning: () => {
      return ipcInvoke("activity-monitor-is-running");
    },
  },
};

try {
  electron.contextBridge.exposeInMainWorld("electron", electronAPI);
} catch (error) {
  console.error("❌ Failed to expose electron API:", error);
}
