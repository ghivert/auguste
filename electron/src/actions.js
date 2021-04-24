const MilleFeuille = require('@frenchpastries/millefeuille')
const { response } = require('@frenchpastries/millefeuille/response')
const Arrange = require('@frenchpastries/arrange')
// const logger = require('./utils/logger')

const handleAction = request => {
  const { next_action } = request.body
  return response({
    events: [],
    responses: [{ text: `Hello from ${next_action}` }],
  })
}

const handler = request => {
  if (request.url.pathname === '/webhook') {
    return handleAction(request)
  } else {
    return response('Send an action')
  }
}

const start = () => {
  const options = { port: 9999 }
  const rootHandler = Arrange.parseJSONBody(Arrange.jsonResponse(handler))
  const server = MilleFeuille.create(rootHandler, options)
  return server
}

const stop = server => {
  MilleFeuille.stop(server)
}

module.exports = {
  start,
  stop,
}
