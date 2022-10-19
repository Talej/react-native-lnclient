import https from 'https'
import { RequestInfo, RequestInit } from 'node-fetch'

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, init))

export default class RESTClient {
  host: string
  agent: https.Agent

  constructor (host: string, agent?: https.Agent) {
    this.host = host
    this.agent = agent
  }

  signRequest () {
    return {}
  }

  url (uri: string, args?: object) {
    const url = new URL(this.host + uri)
    if (args) {
      Object.entries(args).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    return url.href
  }

  async request (method: 'GET' | 'POST', uri: string, args?: object) {
    const headers = this.signRequest()

    const options: RequestInit = {
      method,
      headers,
      body:
        method === 'POST' && args
          ? headers['Content-Type'] === 'application/json'
            ? JSON.stringify(args)
            : Object.entries(args)
              .map(
                ([key, value]) =>
                  encodeURIComponent(key) + '=' + encodeURIComponent(value)
              )
              .join('&')
          : null
    }
    if (this.agent) options.agent = this.agent

    return await fetch(
      this.url(uri, method === 'GET' ? args : undefined),
      options
    )
      .then(async (response) => {
        if (response.status < 300) {
          const data = await response.text()
          if (data.includes('\n')) {
            const parts = data.split('\n')
            return JSON.parse(parts[parts.length - 2]) // get the last response and parse it
          }

          return JSON.parse(data)
        } else {
          return response
            .json()
            .then((err) => {
              if (err.error.message) {
                throw Error(err.error.message)
              } else if (err.error || err.message) {
                throw Error(err.error || err.message)
              }
            })
            .catch((e) => {
              if (typeof e === 'string') throw Error(e)
              if (e instanceof Error) throw e
              throw Error(response.statusText)
            })
        }
      })
      .catch((error) => {
        if (error.cause || error.message) {
          throw Error(error.cause || error.message)
        }
        if (typeof error === 'string') throw Error(error)
        throw Error(error)
      })
  }

  async getRequest (uri: string, args?: object) {
    return this.request('GET', uri, args)
  }

  async postRequest (uri: string, args?: object) {
    return this.request('POST', uri, args)
  }

  isBase64 (s: string) {
    return s === Buffer.from(s, 'base64').toString('base64')
  }
}
