export type Statistics = {
  cpuUsage: number;
  ramUsage: number;
};

export type StorageData = {
  total: number;
  usage: number;
  free: number;
};

export type StaticData = {
  storageData: StorageData;
  cpuModel: string;
  cpuCores: number;
  cpuSpeed: number;
  ramTotal: number;
};

export type ActivityMonitorConfig = {
  idleThresholdSeconds?: number;
  checkIntervalMs?: number;
  debug?: boolean;
};

export type ActivityMonitorResponse = {
  success: boolean;
  error?: string;
};

export type ActivityMonitorStatus = {
  running: boolean;
};

export type EventPayloadMapping = {
  statistics: Statistics;
  getStaticData: StaticData;
  "user-idle-time": number;
  "user-inactive": boolean;
  "open-external": void;
  "oauth-callback": string;
  "activity-monitor-start": ActivityMonitorResponse;
  "activity-monitor-stop": ActivityMonitorResponse;
  "activity-monitor-update-config": ActivityMonitorResponse;
  "activity-monitor-is-running": ActivityMonitorStatus;
  "stop-all-trackers": void;
  "system-suspending": void;
};

export type UnsubscribeFunction = () => void;

export type TrackerReturnType =
  | {
      success: boolean;
      message?: string;
      error?: string;
    }
  | undefined;

declare global {
  interface Window {
    electron: {
      subscribeStatistics: (
        callback: (stats: Statistics) => void
      ) => UnsubscribeFunction;
      subscribeUserIdleTime: (
        callback: (idleTime: number) => void
      ) => UnsubscribeFunction;
      subscribeUserInactive: (
        callback: (inactive: boolean) => void
      ) => UnsubscribeFunction;
      getStaticData: () => Promise<StaticData>;
      openExternal: (url: string) => Promise<void>;
      onOAuthCallback: (callback: (url: string) => void) => UnsubscribeFunction;
      activityMonitor: {
        start: () => Promise<ActivityMonitorResponse>;
        stop: () => Promise<ActivityMonitorResponse>;
        updateConfig: (
          config: ActivityMonitorConfig
        ) => Promise<ActivityMonitorResponse>;
        isRunning: () => Promise<ActivityMonitorStatus>;
      };
      setActiveTrackersStatus: (hasActive: boolean) => void;
      onStopAllTrackers: (callback: () => void) => UnsubscribeFunction;
      onSystemSuspending: (callback: () => void) => UnsubscribeFunction;
    };
  }
}
