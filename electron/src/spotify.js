const { BrowserWindow, ipcMain } = require('electron')
const fetch = require('node-fetch')
const path = require('path')
const crypto = require('./helpers/crypto')
const url = require('./helpers/url')

const client_id = '49c5b32767aa41f0b659462d7024cb10'
const baseAuthorize = `https://accounts.spotify.com/authorize`
const redirect_uri = 'http://localhost:3000/oauth2/spotify'

const generateChallenge = async () => {
  const codeVerifier = await crypto.randomBytes(48)
  const codeChallenge = crypto.base64url(codeVerifier)
  const state = await crypto.randomBytes(48)
  return { codeVerifier, codeChallenge, state }
}

const accessTokenResponse = () => {
  return new Promise(resolve => {
    const handler = (event, token) => resolve(token)
    ipcMain.once('send-access-token', handler)
  })
}

const openPopup = async (parent, uri) => {
  const preload = path.resolve(__dirname, 'preload.js')
  const webPreferences = { preload, nodeIntegration: false }
  const authWindow = new BrowserWindow({
    width: 650,
    height: 900,
    parent,
    webPreferences,
  })
  authWindow.loadURL(uri)
  const message = await accessTokenResponse()
  authWindow.close()
  return JSON.parse(message)
}

const getAuthorizationCode = async parent => {
  const challenge = await generateChallenge()
  const params = {
    client_id,
    redirect_uri,
    response_type: 'code',
    code_challenge_method: 'S256',
    code_challenge: challenge.codeChallenge,
    state: challenge.state,
    scope: [
      'user-library-modify',
      'user-library-read',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'user-top-read',
      'user-read-playback-position',
      'streaming',
    ].join(' '),
  }
  const uri = `${baseAuthorize}?${url.encodeQueryParams(params)}`
  const { code, error, state } = await openPopup(parent, uri)
  if (state === challenge.state) {
    return { code, ...challenge }
  } else {
    throw error
  }
}

const getAccessToken = async ({ code, codeVerifier }) => {
  const values = {
    client_id,
    code,
    redirect_uri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  }
  const body = url.encodeFormURL(values)
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const options = { method: 'POST', headers, body }
  const res = await fetch('https://accounts.spotify.com/api/token', options)
  return await res.json()
}

const authorize = async parent => {
  const result = await getAuthorizationCode(parent)
  const results = await getAccessToken(result)
  return results
}

const refresh = async ({ refresh_token }) => {
  const grant_type = 'refresh_token'
  const body = url.encodeFormURL({ grant_type, refresh_token, client_id })
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const options = { method: 'POST', headers, body }
  const res = await fetch('https://accounts.spotify.com/api/token', options)
  return res.json()
}

module.exports = { authorize, refresh }
