import * as crypto from 'crypto'
import encoder from 'base64url'

export const randomBytes = (num: number) => {
  return new Promise<string>(resolve => {
    crypto.randomBytes(num, (_, buf) => {
      const asString = buf.toString('hex')
      resolve(asString)
    })
  })
}

export const base64url = (value: string) => {
  const base64 = crypto.createHash('sha256').update(value).digest()
  return encoder(base64)
}
