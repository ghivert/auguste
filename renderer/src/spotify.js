import Auguste from './auguste'

let token

export const initialize = params => {
  const item = localStorage.getItem('spotify')
  token = item ? JSON.parse(item) : null
  return Boolean(token)
}

export const logged = () => Boolean(token)

export const log = async () => {
  token = await Auguste.oauth2.authorize('spotify')
  localStorage.setItem('spotify', JSON.stringify(token))
  return Boolean(token)
}

const request = async (endpoint, params = {}) => {
  if (!token) throw new Error('No access token')
  const { body, method = 'GET' } = params
  const { access_token, refresh_token } = token
  const headers = { Authorization: `Bearer ${access_token}` }
  const res = await fetch(endpoint, { headers, body, method })
  if (res.status === 401) {
    token = await Auguste.oauth2.refresh('spotify', refresh_token)
    localStorage.setItem('spotify', JSON.stringify(token))
    return request(endpoint, { body, method })
  } else {
    const body = await res.json()
    return body
  }
}

export const me = () => request('https://api.spotify.com/v1/me')
