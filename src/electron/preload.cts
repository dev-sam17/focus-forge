const electron = require('electron');

electron.contextBridge.exposeInMainWorld("electron", {
    subscribeStatistics: (callback) => {
        return ipcOn('statistics', (stats) => {
            callback(stats);
        });
    },
    getStaticData: () => ipcInvoke('getStaticData'),
    getServerPort: () => ipcInvoke('getServerPort')
   
} satisfies Window["electron"])

// Add an event listener to get port when available
window.addEventListener('DOMContentLoaded', () => {
    // This will be called when the window loads
    ipcInvoke('getServerPort').then((port: number) => {
      // Expose the API base URL to the renderer
      electron.contextBridge.exposeInMainWorld('apiBaseUrl', `http://localhost:${port}`);
    });
  });

  
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


