import * as electron from 'electron'
import { BrowserWindow } from 'electron'
import * as channels from './channels'
import * as files from './files'
import * as oauth2 from './oauth2'
import * as chatbot from './chatbot'

export const setup = (win: BrowserWindow) => {
  electron.ipcMain.on(channels.SAVE, files.save)
  electron.ipcMain.on(channels.READ, files.read)
  electron.ipcMain.on(channels.OAUTH, oauth2.handler(win))
  electron.ipcMain.on(channels.OAUTH_REFRESH, oauth2.refresh)
  electron.ipcMain.on(channels.CHATBOT_TELL, chatbot.message)
}
