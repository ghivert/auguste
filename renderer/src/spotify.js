import { useState, useEffect } from 'react'
import Auguste from './auguste'

let token

const initialize = async () => {
  const item = localStorage.getItem('spotify')
  token = item ? JSON.parse(item) : null
  await window.spotifyInitialized
  return Boolean(token)
}

const renewAccessToken = async ({ refresh_token }) => {
  token = await Auguste.oauth2.refresh('spotify', refresh_token)
  localStorage.setItem('spotify', JSON.stringify(token))
  return token
}

const request = async (endpoint, params = {}) => {
  if (!token) throw new Error('No access token')
  const { body, method = 'GET' } = params
  const { access_token, refresh_token } = token
  const headers = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': body ? 'application/json' : undefined,
  }
  const res = await fetch(endpoint, { headers, body, method })
  if (res.status === 401) {
    await renewAccessToken({ refresh_token })
    return request(endpoint, { body, method })
  } else if (res.status === 200) {
    const body = await res.json().catch(() => null)
    return body
  } else if (res.status === 204) {
    return null
  }
}

export const useSpotify = () => {
  const [token_, setToken] = useState()
  const initializer = async () => {
    const token = await initialize()
    setToken(token)
  }
  useEffect(() => {
    initializer()
  }, [])
  return {
    get logged() {
      return token_
    },
    logIn: async () => {
      token = await Auguste.oauth2.authorize('spotify')
      localStorage.setItem('spotify', JSON.stringify(token))
      setToken(token)
      return token_
    },
    me: {
      profile: () => request('https://api.spotify.com/v1/me'),
      player: {
        current: () => request('https://api.spotify.com/v1/me/player'),
        devices: () => request('https://api.spotify.com/v1/me/player/devices'),
        currentlyPlaying: () =>
          request('https://api.spotify.com/v1/me/player/currently-playing'),
        transfer: device =>
          request('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            body: JSON.stringify({
              device_ids: [device],
              play: true,
            }),
          }),
      },
    },
  }
}
