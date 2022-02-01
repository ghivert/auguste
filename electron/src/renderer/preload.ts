import { contextBridge, ipcRenderer } from 'electron'
import {
  SAVE,
  READ,
  SEND_ACCESS_TOKEN,
  OAUTH,
  OAUTH_REFRESH,
  CHATBOT_TELL,
  Channel,
} from '../channels'

type Message = { type: string; content: string }
const publish = async (channel: Channel, payload: any) => {
  const promise = new Promise<Message>(r => {
    ipcRenderer.once(channel, (_e, v) => r(v))
  })
  ipcRenderer.send(channel, payload)
  return promise
}

const read = (fileName: string) => publish(READ, { fileName })
const sendAccessToken = (t: string) => ipcRenderer.send(SEND_ACCESS_TOKEN, t)
const save = (fileName: string, content: string) =>
  publish(SAVE, { fileName, content })

const oauth2 = {
  authorize: (provider: string) => publish(OAUTH, { provider }),
  refresh: (provider: string, refresh_token: string) => {
    const params = { provider, refresh_token }
    return publish(OAUTH_REFRESH, params)
  },
}

const tell = async (message: string) => {
  const { type, content } = await publish(CHATBOT_TELL, { message })
  return {
    content,
    get success() {
      return type === 'success'
    },
  }
}

const onResult = (callback: (value: any) => void) => {
  ipcRenderer.on('run-script-result', callback)
  return () => ipcRenderer.removeListener('run-script-result', callback)
}

const funcs = { save, read, oauth2, onResult, sendAccessToken, tell }
contextBridge.exposeInMainWorld('auguste', funcs)
