const path = require('path')
const fs = require('fs').promises
const { app } = require('electron')

const appPath = app.getPath('userData')

const write = async (key, value) => {
  const filePath = path.resolve(appPath, key)
  await fs.writeFile(filePath, value)
}

const get = async key => {
  const filePath = path.resolve(appPath, key)
  const file = await fs.readFile(filePath, 'utf-8')
  return file
}

module.exports = {
  write,
  get,
}
