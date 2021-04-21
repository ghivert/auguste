const { app, BrowserWindow, ...electron } = require('electron')
const window_ = require('./window')
const spotify = require('./spotify')
const path = require('path')
const store = require('./store')
const { IS_DEV, IS_PROD } = require('./env')
try {
  require('electron-reloader')(module, { watchRenderer: false })
} catch (error) {
  console.info(error)
}

const configureApp = win => {
  const shortcut = 'CmdOrCtrl+Shift+Space'
  electron.globalShortcut.register(shortcut, () => {
    const handler = win.isVisible() ? window_.hideWindow : window_.showWindow
    handler(win)
  })
  if (IS_PROD) {
    app.dock.hide()
  }
}

const launch = async () => {
  await app.whenReady()
  const win = window_.createWindow()
  configureApp(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      window_.createWindow()
    }
  })

  // win.on('blur', () => {
  //   hideWindow(win)
  // })

  // electron.screen.on('display-metrics-changed', event => {
  //   console.log(event)
  // })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  return win
}

const saveHandler = async (event, { fileName, content }) => {
  await store.write(fileName, content)
  event.reply('save', true)
}

const readHandler = async (event, { fileName }) => {
  const content = await store.get(fileName)
  event.reply('read', content)
}

const oauth2Handler = win => async event => {
  const token = await spotify.authorize(win)
  event.reply('oauth2', token)
}

const main = async () => {
  const win = await launch()

  electron.ipcMain.on('save', saveHandler)
  electron.ipcMain.on('read', readHandler)
  electron.ipcMain.on('oauth2', oauth2Handler(win))
}

main()
