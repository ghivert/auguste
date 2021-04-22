const { contextBridge, ipcRenderer } = require('electron')

const publish = async (channel, payload) => {
  const promise = new Promise(resolve => {
    const handler = (e, v) => resolve(v)
    ipcRenderer.once(channel, handler)
  })
  ipcRenderer.send(channel, payload)
  return promise
}

const save = (fileName, content) => publish('save', { fileName, content })
const read = fileName => publish('read', { fileName })
const oauth2 = {
  authorize: provider => publish('oauth2', { provider }),
  refresh: (provider, refresh_token) => {
    return publish('oauth2-refresh', { provider, refresh_token })
  },
}

const sendAccessToken = token => {
  ipcRenderer.send('send-access-token', token)
}

const onResult = callback => {
  ipcRenderer.on('run-script-result', callback)
  return () => ipcRenderer.removeListener('run-script-result', callback)
}

contextBridge.exposeInMainWorld('auguste', {
  save,
  read,
  oauth2,
  onResult,
  sendAccessToken,
})
