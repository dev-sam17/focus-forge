const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback) => {
        return ipcOn('statistics', (stats) => {
            callback(stats);
        });
    },
    subscribeUserIdleTime: (callback) => {
        return ipcOn('user-idle-time', (idleTime) => {
            callback(idleTime);
        });
    },
    subscribeUserInactive: (callback) => {
        return ipcOn('user-inactive', (inactive) => {
            callback(inactive);
        });
    },
    getStaticData: () => ipcInvoke('getStaticData'),
   
} satisfies Window["electron"])
  
function ipcInvoke<Key extends keyof EventPayloadMapping>(
    key: Key,
    ...args: unknown[]
): Promise<EventPayloadMapping[Key]> {
    return electron.ipcRenderer.invoke(key, ...args);
}


function ipcOn<Key extends keyof EventPayloadMapping>(
    key: Key,
    callback: (payload: EventPayloadMapping[Key]) => void
) {
    const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
    electron.ipcRenderer.on(key, cb);
    return () => electron.ipcRenderer.off(key, cb);
}


