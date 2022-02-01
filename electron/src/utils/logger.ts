import * as fs from 'fs/promises'
import * as path from 'path'

export const log = async (...args: any[]) => {
  const filename = path.resolve(__dirname, '../../../auguste.log')
  const timestamp = new Date().toISOString()
  const toWrite = JSON.stringify([timestamp, ...args], null, 2)
  await fs.appendFile(filename, toWrite)
}
