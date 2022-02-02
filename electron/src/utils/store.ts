import * as path from 'path'
import * as fs from 'fs/promises'
import { app } from 'electron'
import * as childProcess from 'child_process'

const appPath = app.getPath('userData')

export const write = async (key: string, value: string) => {
  const filePath = path.resolve(appPath, key)
  await fs.writeFile(filePath, value)
}

export const get = async (key: string) => {
  const filePath = path.resolve(appPath, key)
  const file = await fs.readFile(filePath, 'utf-8').catch(() => '')
  return file
}

export const run = async (key: string) => {
  const filePath = path.resolve(appPath, key)
  return new Promise((resolve, reject) => {
    const path = filePath.replace(/ /g, '\\ ')
    childProcess.exec(`node ${path}`, (error, stdout, stderr) => {
      if (error) reject({ path, value: error })
      else resolve({ path, value: { stdout, stderr } })
    })
  })
}
