import { contextBridge, ipcRenderer } from 'electron'
import {
  SAVE,
  READ,
  SEND_ACCESS_TOKEN,
  OAUTH,
  OAUTH_REFRESH,
  CHATBOT_TELL,
  Channel,
} from '../ipc/channels'

const publish = async <Return>(channel: Channel, payload: any) => {
  const promise = new Promise<Return>(r => {
    ipcRenderer.once(channel, (_e, v) => r(v))
  })
  ipcRenderer.send(channel, payload)
  return promise
}

const read = (fileName: string) => publish<string>(READ, { fileName })
const sendAccessToken = (t: string) => ipcRenderer.send(SEND_ACCESS_TOKEN, t)
const save = (fileName: string, content: string) =>
  publish<boolean>(SAVE, { fileName, content })

const oauth2 = {
  authorize: (provider: string) => publish<Object>(OAUTH, { provider }),
  refresh: (provider: string, refresh_token: string) => {
    const params = { provider, refresh_token }
    return publish<Object>(OAUTH_REFRESH, params)
  },
}

const tell = async (message: string) => {
  type Result =
    | { type: 'success'; content: string }
    | { type: 'error'; content: Error }
  const { type, content } = await publish<Result>(CHATBOT_TELL, { message })
  return { content, type }
}

const onResult = (callback: (value: any) => void) => {
  ipcRenderer.on('run-script-result', callback)
  return () => ipcRenderer.removeListener('run-script-result', callback)
}

const funcs = { save, read, oauth2, onResult, sendAccessToken, tell }
contextBridge.exposeInMainWorld('auguste', funcs)
