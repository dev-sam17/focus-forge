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
    getServerPort: number;
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
        getServerPort: () => Promise<number>;
    };
    apiBaseUrl: string;
}

