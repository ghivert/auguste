const { contextBridge, ipcRenderer } = require('electron')
const channels = require('../channels')

const {
  SAVE,
  READ,
  OAUTH,
  OAUTH_REFRESH,
  CHATBOT_TELL,
  SEND_ACCESS_TOKEN,
} = channels

const publish = async (channel, payload) => {
  const promise = new Promise(resolve => {
    const handler = (e, v) => resolve(v)
    ipcRenderer.once(channel, handler)
  })
  ipcRenderer.send(channel, payload)
  return promise
}

const save = (fileName, content) => publish(SAVE, { fileName, content })
const read = fileName => publish(READ, { fileName })
const sendAccessToken = token => ipcRenderer.send(SEND_ACCESS_TOKEN, token)
const oauth2 = {
  authorize: provider => publish(OAUTH, { provider }),
  refresh: (provider, refresh_token) => {
    return publish(OAUTH_REFRESH, { provider, refresh_token })
  },
}
const tell = async message => {
  const { type, content } = await publish(CHATBOT_TELL, { message })
  return {
    content,
    get success() {
      return type === 'success'
    },
  }
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
  tell,
})
