/// <reference types="electron" />
import type { EventPayloadMapping, Statistics, UnsubscribeFunction } from '../../types';

const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback: (stats: Statistics) => void) => {
        return ipcOn('statistics', (stats: Statistics) => {
            callback(stats);
        });
    },
    subscribeUserIdleTime: (callback: (idleTime: number) => void) => {
        return ipcOn('user-idle-time', (idleTime: number) => {
            callback(idleTime);
        });
    },
    subscribeUserInactive: (callback: (inactive: boolean) => void) => {
        return ipcOn('user-inactive', (inactive: boolean) => {
            callback(inactive);
        });
    },
    getStaticData: () => ipcInvoke('getStaticData'),
} as Window['electron'])

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
    const cb = (_: Electron.IpcRendererEvent, payload: EventPayloadMapping[Key]) => callback(payload);
    electron.ipcRenderer.on(key, cb);
    return () => electron.ipcRenderer.off(key, cb);
}
