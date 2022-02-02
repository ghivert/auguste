import { contextBridge, ipcRenderer } from 'electron'
import {
  SAVE,
  READ,
  SEND_ACCESS_TOKEN,
  OAUTH,
  OAUTH_REFRESH,
  CHATBOT_TELL,
  RUN_SCRIPT,
  GET_ADDRESS,
  GENERATE_ADDRESS,
  Channel,
} from '../ipc/channels'

const publish = async <Return>(channel: Channel, payload?: any) => {
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
    | { type: 'success'; content: { text?: string; image?: string }[] }
    | { type: 'error'; content: Error }
  const { type, content } = await publish<Result>(CHATBOT_TELL, { message })
  return { content, type }
}

const runScript = async (fileName: string) =>
  publish<any>(RUN_SCRIPT, { fileName })

const address = {
  get: () => publish(GET_ADDRESS),
  generate: (options: any) => publish(GENERATE_ADDRESS, options),
}

contextBridge.exposeInMainWorld('auguste', {
  save,
  read,
  oauth2,
  sendAccessToken,
  tell,
  runScript,
  address,
})
