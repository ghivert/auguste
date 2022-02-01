import { Event } from './common'
import { Save, Read } from './channels'
import * as channels from './channels'
import * as store from '../utils/store'

export const save = async (event: Event, { fileName, content }: Save) => {
  await store.write(fileName, content)
  event.reply(channels.SAVE, true)
}

export const read = async (event: Event, { fileName }: Read) => {
  const content = await store.get(fileName)
  event.reply(channels.READ, content)
}
