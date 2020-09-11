"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    /**
     * Command from Renderer process
     */
    persistentStoreDispatch: (action) => {
        return electron_1.ipcRenderer.invoke('persistent-store-dispatch', action);
    },
});
/**
 * Command from Main process
 */
electron_1.ipcRenderer.on('persistent-store-updated', (event, payload) => window.postMessage({ command: 'persistent-store-updated', payload }, 'file://'));
//# sourceMappingURL=preload.js.map