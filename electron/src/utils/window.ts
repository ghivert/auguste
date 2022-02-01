import { BrowserWindow } from 'electron'
import * as electron from 'electron'
import * as path from 'path'
import { IS_DEV, IS_PROD } from '../env'

export const showWindow = async (win: BrowserWindow, value = 0.0) => {
  if (!win.isVisible()) {
    electron.app.focus()
    win.focus()
    win.show()
  }
  return new Promise<void>(resolve =>
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

export const hideWindow = async (win: BrowserWindow, value = 1.0) => {
  return new Promise<void>(resolve =>
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

const generateOptions = (): electron.BrowserWindowConstructorOptions => {
  const scr = getActiveDisplay()
  const opacity = IS_DEV ? 1 : 0
  const show = IS_DEV
  const options: electron.BrowserWindowConstructorOptions = {
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

export const createWindow = () => {
  const options = generateOptions()
  const win = new BrowserWindow(options)
  const handler = () => {
    const bounds = win.getContentBounds()
    const screen = electron.screen.getDisplayMatching(bounds)
    win.setContentBounds(screen.workArea)
  }
  electron.screen.on('display-metrics-changed', handler)
  win.on('close', () => {
    electron.screen.removeListener('display-metrics-changed', handler)
  })
  if (IS_DEV) {
    win.loadURL('http://localhost:3000')
  } else {
    showWindow(win)
  }
  return win
}
