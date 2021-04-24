const fetch = require('node-fetch')

const rasaURL = 'http://localhost:5005'
const webhookURL = `${rasaURL}/webhooks/rest/webhook`

const request = async ({ message }) => {
  const headers = { 'Content-Type': 'application/json' }
  const body = JSON.stringify({ sender: 'user', message })
  const res = await fetch(webhookURL, { method: 'POST', headers, body })
  if (res.ok) {
    const data = await res.json()
    return data
      .filter(d => d.recipient_id === 'user')
      .map(({ recipient_id, ...d }) => d) // eslint-disable-line
  } else {
    const data = await res.text()
    throw new Error(data)
  }
}

module.exports = {
  request,
}
