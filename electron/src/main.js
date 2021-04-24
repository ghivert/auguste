const { app, BrowserWindow, ...electron } = require('electron')
const { hideWindow, showWindow, createWindow } = require('./utils/window')
const spotify = require('./spotify')
const store = require('./utils/store')
const chatbot = require('./chatbot')
const { IS_PROD } = require('./env')
const { SAVE, READ, OAUTH, OAUTH_REFRESH, CHATBOT_TELL } = require('./channels')
const Server = require('./actions')
try {
  require('electron-reloader')(module, { watchRenderer: false })
} catch (error) {
  console.info(error)
}

const selectWindowHandler = win => {
  if (win.isVisible()) {
    return hideWindow(win)
  } else {
    return showWindow(win)
  }
}

const configureApp = win => {
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

const saveHandler = async (event, { fileName, content }) => {
  await store.write(fileName, content)
  event.reply(SAVE, true)
}

const readHandler = async (event, { fileName }) => {
  const content = await store.get(fileName)
  event.reply(READ, content)
}

const oauth2Handler = win => async (event, { provider }) => {
  const token = await (async () => {
    switch (provider) {
      case 'spotify':
        return spotify.authorize(win)
    }
  })()
  event.reply(OAUTH, token)
}

const oauth2RefreshHandler = async (event, params) => {
  const { provider, refresh_token } = params
  const token = await (async () => {
    switch (provider) {
      case 'spotify':
        return spotify.refresh({ refresh_token })
    }
  })()
  event.reply(OAUTH_REFRESH, token)
}

const chatbotHandler = async (event, { message }) => {
  try {
    const content = await chatbot.request({ message })
    event.reply(CHATBOT_TELL, { type: 'success', content })
  } catch (error) {
    event.reply(CHATBOT_TELL, { type: 'error', content: error })
  }
}

const main = async () => {
  const win = await launch()

  electron.ipcMain.on(SAVE, saveHandler)
  electron.ipcMain.on(READ, readHandler)
  electron.ipcMain.on(OAUTH, oauth2Handler(win))
  electron.ipcMain.on(OAUTH_REFRESH, oauth2RefreshHandler)
  electron.ipcMain.on(CHATBOT_TELL, chatbotHandler)
}

main()
