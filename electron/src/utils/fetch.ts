import type { RequestInfo, RequestInit, Response } from 'node-fetch'

let _exec: any = null

type NodeFetch = Promise<typeof import('node-fetch')>
const importFetch = async () => {
  if (_exec) return _exec
  const data = await (Function('return import("node-fetch")')() as NodeFetch)
  _exec = data.default
  return _exec
}

const run = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
  const fetch = await importFetch()
  return fetch(url, init)
}

export default run
