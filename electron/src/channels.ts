export const SAVE = 'save'
export const READ = 'read'
export const OAUTH = 'oauth2'
export const OAUTH_REFRESH = 'oauth2-refresh'
export const CHATBOT_TELL = 'chatbot-tell'
export const SEND_ACCESS_TOKEN = 'send-access-token'

export type Channel =
  | 'save'
  | 'read'
  | 'oauth2'
  | 'oauth2-refresh'
  | 'chatbot-tell'
  | 'send-access-token'
