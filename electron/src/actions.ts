import * as MilleFeuille from '@frenchpastries/millefeuille'
import { response } from '@frenchpastries/millefeuille/response'
import * as arrange from '@frenchpastries/arrange'
import * as http from 'http'

const handleAction = (request: MilleFeuille.IncomingRequest) => {
  const { next_action } = request.body
  return response({
    events: [],
    responses: [{ text: `Hello from ${next_action}` }],
  })
}

const handler = async (request: MilleFeuille.IncomingRequest) => {
  if (request.location?.pathname === '/webhook') {
    return handleAction(request)
  } else {
    return response('Send an action')
  }
}

export const start = () => {
  const options = { port: 9999 }
  const jsonHandler = arrange.json.response(handler)
  const rootHandler = arrange.json.parse(jsonHandler)
  const server = MilleFeuille.create(rootHandler, options)
  return server
}

export const stop = (server: http.Server) => {
  MilleFeuille.stop(server)
}
