const { app, BrowserWindow, ...electron } = require('electron')
const { IS_DEV, IS_PROD } = require('./env')
try {
  require('electron-reloader')(module)
} catch (error) {
  console.info(error)
}

const showWindow = async (win, value = 0.0) => {
  if (!win.isVisible()) {
    app.focus()
    win.focus()
    win.show()
  }
  return new Promise(resolve =>
    setTimeout(async () => {
      if (value < 1.0) {
        const newValue = value + 0.01
        win.setOpacity(newValue)
        await showWindow(win, newValue)
      }
      resolve()
    }, 1)
  )
}

const hideWindow = async (win, value = 1.0) => {
  return new Promise(resolve =>
    setTimeout(async () => {
      if (value > 0.0) {
        const newValue = value - 0.01
        win.setOpacity(newValue)
        await hideWindow(win, newValue)
      } else {
        win.hide()
        win.blur()
        app.hide()
      }
      resolve()
    })
  )
}

const getActiveDisplay = () => {
  const getDisplay = IS_DEV
    ? () => electron.screen.getPrimaryDisplay()
    : () => electron.screen.getDisplayNearestPoint(cursorPoint)
  const cursorPoint = electron.screen.getCursorScreenPoint()
  const { workArea } = getDisplay()
  const { x, y, width, height } = workArea
  return { x, y, width, height }
}

const generateOptions = () => {
  const scr = getActiveDisplay()
  const opacity = IS_DEV ? 1 : 0
  const show = IS_DEV
  const options = {
    resizable: false,
    movable: false,
    frame: false,
    visualEffectState: 'active',
    // transparent: true,
    vibrancy: 'hud',
    roundedCorners: false,
  }
  return { ...scr, ...options, opacity, show }
}

const createWindow = () => {
  const win = new BrowserWindow(generateOptions())
  if (IS_DEV) {
    win.loadURL('http://localhost:3000')
  } else {
    showWindow(win)
  }
  return win
}

const configureApp = win => {
  const shortcut = 'CmdOrCtrl+Shift+Space'
  electron.globalShortcut.register(shortcut, () => {
    const handler = win.isVisible() ? hideWindow : showWindow
    handler(win)
  })
  if (IS_PROD) {
    app.dock.hide()
  }
}

const main = async () => {
  await app.whenReady()
  const win = createWindow()
  configureApp(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  // win.on('blur', () => {
  //   hideWindow(win)
  // })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

main()
