import electron from 'electron'
import * as path from 'path'
import * as fs from 'fs/promises'
import { ethers } from 'ethers'
import { Event } from './common'
import * as channels from './channels'

const fileExists = async (path: string) => {
  const exists = await fs
    .access(path)
    .then(() => true)
    .catch(() => false)
  return exists
}

const walletPath = async () => {
  const appData = electron.app.getPath('appData')
  const folder = path.resolve(appData, 'Auguste')
  const folderExists = await fileExists(folder)
  if (!folderExists) await fs.mkdir(folder, { recursive: true })
  const path_ = path.resolve(folder, 'wallet.dat')
  return path_
}

export const get = async (event: Event) => {
  const _path = await walletPath()
  const exists = await fileExists(_path)
  if (!exists) return event.reply(channels.GET_ADDRESS, null)
  const file = await fs.readFile(_path)
  const wallet = JSON.parse(electron.safeStorage.decryptString(file))
  const { publicKey, mnemonic, address } = wallet
  event.reply(channels.GET_ADDRESS, { publicKey, mnemonic, address })
}

const saveWallet = async (wallet: ethers.Wallet) => {
  const address = await wallet.getAddress()
  const { privateKey, publicKey, mnemonic } = wallet
  console.log(privateKey)
  const data = JSON.stringify({ privateKey, publicKey, mnemonic, address })
  const encrypted = electron.safeStorage.encryptString(data)
  const _path = await walletPath()
  await fs.writeFile(_path, encrypted)
  return { type: 'success', value: { publicKey, mnemonic, address } }
}

const createWallet = (mnemonic?: string, privateKey?: string) => {
  if (mnemonic) {
    return ethers.Wallet.fromMnemonic(mnemonic)
  } else if (privateKey) {
    return new ethers.Wallet(privateKey)
  } else {
    return ethers.Wallet.createRandom()
  }
}

export const generate = async (
  event: Event,
  option?: { mnemonic?: string; privateKey?: string }
) => {
  try {
    const wallet = createWallet(option?.mnemonic, option?.privateKey)
    const params = await saveWallet(wallet)
    event.reply(channels.GENERATE_ADDRESS, params)
  } catch (error: any) {
    event.reply(channels.GENERATE_ADDRESS, {
      type: 'error',
      value: error.message,
    })
  }
}
