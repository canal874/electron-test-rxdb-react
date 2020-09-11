import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  /**
   * Command from Renderer process
   */
  fromRenderer: (message: string) => {
    return ipcRenderer.invoke('from-renderer', message);
  },
});

/**
 * Command from Main process
 */
ipcRenderer.on('from-main', () => window.postMessage({ command: 'from-main' }, 'file://'));
