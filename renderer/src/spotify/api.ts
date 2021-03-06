import { useState, useEffect } from 'react'
import { Auguste } from '../auguste'

const readAccessToken = () => {
  const item = localStorage.getItem('spotify')
  return item ? JSON.parse(item) : null
}

let token = readAccessToken()

const initialize = async () => {
  token = readAccessToken()
  await (window as any).spotifyInitialized
  return Boolean(token)
}

const renewAccessToken = async (refresh_token: string) => {
  token = await Auguste.oauth2.refresh('spotify', refresh_token)
  localStorage.setItem('spotify', JSON.stringify(token))
  return token
}

type Params = { body?: string; method?: string }
const request = async (endpoint: string, params?: Params): Promise<any> => {
  if (!token) throw new Error('No access token')
  const { body, method = 'GET' } = params ?? {}
  const { access_token, refresh_token } = token
  const headers: any = {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': body ? 'application/json' : undefined,
  }
  const res = await fetch(endpoint, { headers, body, method })
  if (res.status === 401) {
    await renewAccessToken(refresh_token)
    return request(endpoint, { body, method })
  } else if (res.status === 200) {
    const body = await res.json().catch(() => null)
    return body
  } else if (res.status === 204) {
    return null
  }
}

export type API = ReturnType<typeof useSpotify>
export const useSpotify = () => {
  const [token_, setToken] = useState(false)
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
        transfer: (device: string) =>
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
