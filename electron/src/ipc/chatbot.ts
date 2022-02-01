import { Event } from './common'
import { Chatbot } from './channels'
import * as channels from './channels'
import * as chatbot from '../handlers/chatbot'

export const message = async (event: Event, { message }: Chatbot) => {
  try {
    const content = await chatbot.request({ message })
    event.reply(channels.CHATBOT_TELL, { type: 'success', content })
  } catch (error) {
    event.reply(channels.CHATBOT_TELL, { type: 'error', content: error })
  }
}
