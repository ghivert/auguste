const { BrowserWindow, ...electron } = require('electron')
const path = require('path')
const { IS_DEV, IS_PROD } = require('../env')

const showWindow = async (win, value = 0.0) => {
  if (!win.isVisible()) {
    electron.app.focus()
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
        electron.app.hide()
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
    alwaysOnTop: IS_PROD,
    resizable: false,
    movable: false,
    frame: false,
    visualEffectState: 'active',
    vibrancy: 'hud',
    roundedCorners: true,
    webPreferences: {
      preload: path.resolve(__dirname, '../renderer/preload.js'),
      nodeIntegration: false,
    },
  }
  return { ...scr, ...options, opacity, show }
}

const createWindow = () => {
  const options = generateOptions()
  const win = new BrowserWindow(options)
  if (IS_DEV) {
    win.loadURL('http://localhost:3000')
  } else {
    showWindow(win)
  }
  return win
}

module.exports = {
  createWindow,
  hideWindow,
  showWindow,
}
