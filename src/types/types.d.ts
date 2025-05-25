type Statistics = {
    cpuUsage: number;
    ramUsage: number;
}

type StorageData = {
    total: number;
    usage: number;
    free: number;
}

type StaticData = {
    storageData: StorageData;
    cpuModel: string;
    cpuCores: number;
    cpuSpeed: number;
    ramTotal: number;
}

type EventPayloadMapping = {
    statistics: Statistics;
    getStaticData: StaticData;
    "user-idle-time": number;
    "user-inactive": boolean;
}

type UnsubscribeFunction = () => void;
type TrackerReturnType = {
    success: boolean
    message?: string
    error?: string
} | undefined;

interface Window {
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => UnsubscribeFunction;
        getStaticData: () => Promise<StaticData>;
        subscribeUserIdleTime: (callback: (idleTime: number) => void) => UnsubscribeFunction;
        subscribeUserInactive: (callback: (inactive: boolean) => void) => UnsubscribeFunction;
    };
}

