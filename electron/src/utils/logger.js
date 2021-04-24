const fs = require('fs').promises
const path = require('path')

const log = async (...args) => {
  const filename = path.resolve(__dirname, '../../../auguste.log')
  const timestamp = new Date().toISOString()
  const toWrite = JSON.stringify([timestamp, ...args], null, 2)
  await fs.appendFile(filename, toWrite)
}

module.exports = {
  log,
}
