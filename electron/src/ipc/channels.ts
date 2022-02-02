export const SAVE = 'save'
export const READ = 'read'
export const OAUTH = 'oauth2'
export const OAUTH_REFRESH = 'oauth2-refresh'
export const CHATBOT_TELL = 'chatbot-tell'
export const SEND_ACCESS_TOKEN = 'send-access-token'
export const RUN_SCRIPT = 'run-script'
export const GET_ADDRESS = 'get-address'
export const GENERATE_ADDRESS = 'generate-address'

export type Channel =
  | 'save'
  | 'read'
  | 'oauth2'
  | 'oauth2-refresh'
  | 'chatbot-tell'
  | 'send-access-token'
  | 'run-script'
  | 'get-address'
  | 'generate-address'

export type Message = Save | Read | OAuth2 | OAuth2Refresh | Chatbot | RunScript

export type Save = { fileName: string; content: string }
export type Read = { fileName: string }
export type OAuth2 = { provider: string }
export type OAuth2Refresh = { provider: string; refresh_token: string }
export type Chatbot = { message: string }
export type RunScript = { fileName: string }
