import * as path from 'path'
import * as fs from 'fs/promises'
import { app } from 'electron'

const appPath = app.getPath('userData')

export const write = async (key: string, value: string) => {
  const filePath = path.resolve(appPath, key)
  await fs.writeFile(filePath, value)
}

export const get = async (key: string) => {
  const filePath = path.resolve(appPath, key)
  const file = await fs.readFile(filePath, 'utf-8')
  return file
}
