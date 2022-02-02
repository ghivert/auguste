export type Unsubscriber = () => void
export type Content = { text?: string; image?: string }[]
export type Stds = { stdout: string; stderr: string }
export type Result =
  | { type: 'success'; content: Content }
  | { type: 'error'; content: Error }
export type Auguste = {
  save: (fileName: string, content: string) => Promise<boolean>
  read: (fileName: string) => Promise<string>
  oauth2: {
    authorize: (provider: string) => Promise<Object>
    refresh: (provider: string, refresh_token: string) => Promise<Object>
  }
  tell: (message: string) => Promise<Result>
  sendAccessToken: (token: string) => void
  runScript: (
    fileName: string
  ) => Promise<{ path: string; value: Error | Stds }>
}
export const Auguste: Auguste = (window as any).auguste
