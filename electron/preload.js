
const { contextBridge, ipcRenderer } = require('electron');

console.log('ClipVault preload script loaded');

contextBridge.exposeInMainWorld('clipVault', {
  copyText: (text) => {
    if (typeof text !== 'string') {
      throw new TypeError('Clipboard content must be text');
    }

    return ipcRenderer.invoke('clipboard:write-text', text);
  },
});
