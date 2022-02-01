import { BrowserWindow } from 'electron'
import { Event } from './common'
import { OAuth2, OAuth2Refresh } from './channels'
import * as channels from './channels'
import * as spotify from '../handlers/spotify'

export const handler = (win: BrowserWindow) => {
  return async (event: Event, { provider }: OAuth2) => {
    const token = await (async () => {
      switch (provider) {
        case 'spotify':
          return spotify.authorize(win)
      }
    })()
    event.reply(channels.OAUTH, token)
  }
}

export const refresh = async (event: Event, params: OAuth2Refresh) => {
  const { provider, refresh_token } = params
  const token = await (async () => {
    switch (provider) {
      case 'spotify':
        return spotify.refresh(refresh_token)
    }
  })()
  event.reply(channels.OAUTH_REFRESH, token)
}
