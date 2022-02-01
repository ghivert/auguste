import * as electron from 'electron'
import * as Server from './actions'
import { app, BrowserWindow } from 'electron'
import { hideWindow, showWindow, createWindow } from './utils/window'
import { IS_PROD } from './env'
import * as ipc from './ipc'
try {
  require('electron-reloader')(module, { watchRenderer: false })
} catch (error) {
  console.info(error)
}

const selectWindowHandler = (win: BrowserWindow) => {
  if (win.isVisible()) {
    return hideWindow(win)
  } else {
    return showWindow(win)
  }
}

const configureApp = (win: BrowserWindow) => {
  const shortcut = 'CmdOrCtrl+Shift+Space'
  electron.globalShortcut.register(shortcut, () => selectWindowHandler(win))
  if (IS_PROD) app.dock.hide()
}

const recreateWindow = () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
}

const quitOnClose = () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}

const launch = async () => {
  await app.whenReady()
  const win = createWindow()
  const server = Server.start()
  configureApp(win)
  app.on('activate', recreateWindow)
  app.on('window-all-closed', quitOnClose)
  app.on('will-quit', () => Server.stop(server))
  return win
}

const main = async () => {
  const win = await launch()
  ipc.setup(win)
}

main()
