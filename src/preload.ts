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
ipcRenderer.on('persistent-store-updated', (event, payload) =>
  window.postMessage({ command: 'persistent-store-updated', payload }, 'file://')
);
