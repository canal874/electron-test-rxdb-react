import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  /**
   * Command from Renderer process
   */
  persistentStoreDispatch: (action: any) => {
    return ipcRenderer.invoke('persistent-store-dispatch', action);
  },
});

/**
 * Command from Main process
 */
ipcRenderer.on('persistent-store-updated', (event, payload) => {
  console.dir(payload);
  window.postMessage({ command: 'persistent-store-updated', payload }, 'file://');
});
ipcRenderer.on('persistent-store-deleted', (event, payload) => {
  window.postMessage({ command: 'persistent-store-deleted', payload }, 'file://');
});
