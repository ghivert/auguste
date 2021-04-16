const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  saveScript: code => {
    ipcRenderer.send('save-script', code)
  },
  runScript: () => {
    ipcRenderer.send('run-script')
  },
  onResult: callback => {
    ipcRenderer.on('run-script-result', callback)
    return () => ipcRenderer.removeListener('run-script-result', callback)
  },
})
