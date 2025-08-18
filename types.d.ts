export type Statistics = {
    cpuUsage: number;
    ramUsage: number;
}

export type StorageData = {
    total: number;
    usage: number;
    free: number;
}

export type StaticData = {
    storageData: StorageData;
    cpuModel: string;
    cpuCores: number;
    cpuSpeed: number;
    ramTotal: number;
}

export type EventPayloadMapping = {
    statistics: Statistics;
    getStaticData: StaticData;
    "user-idle-time": number;
    "user-inactive": boolean;
}

export type UnsubscribeFunction = () => void;

export type TrackerReturnType = {
    success: boolean
    message?: string
    error?: string
} | undefined;

declare global {
    interface Window {
        electron: {
            subscribeStatistics: (callback: (stats: Statistics) => void) => UnsubscribeFunction;
            subscribeUserIdleTime: (callback: (idleTime: number) => void) => UnsubscribeFunction;
            subscribeUserInactive: (callback: (inactive: boolean) => void) => UnsubscribeFunction;
            getStaticData: () => Promise<StaticData>;
        };
    }
}
