import fetch from '../utils/fetch'

const rasaURL = 'http://localhost:5005'
const webhookURL = `${rasaURL}/webhooks/rest/webhook`

export const request = async ({ message }: any) => {
  const headers = { 'Content-Type': 'application/json' }
  const body = JSON.stringify({ sender: 'user', message })
  const res = await fetch(webhookURL, { method: 'POST', headers, body })
  if (res.ok) {
    const data = await res.json()
    return (data as any)
      .filter((d: any) => d.recipient_id === 'user')
      .map(({ recipient_id, ...d }: any) => d)
  } else {
    const data = await res.text()
    throw new Error(data)
  }
}
