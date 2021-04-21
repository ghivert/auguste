const crypto = require('crypto')
const encoder = require('base64url')

const randomBytes = num => {
  return new Promise(resolve => {
    const handler = (_, buf) => resolve(buf.toString('hex'))
    crypto.randomBytes(num, handler)
  })
}

const base64url = value => {
  const base64 = crypto.createHash('sha256').update(value).digest()
  return encoder(base64)
}

module.exports = {
  randomBytes,
  base64url,
}
