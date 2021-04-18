const { app, BrowserWindow, ...electron } = require('electron')
const window_ = require('./window')
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

const main = async () => {
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

  electron.ipcMain.on('save-script', (event, script) => {
    console.log(script)
  })

  electron.ipcMain.on('run-script', event => {
    console.log('run')
    event.reply('run-script-result', true)
  })
}

main()
