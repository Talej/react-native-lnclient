import { LooseObject } from '../types'
import https from 'https'
import { RequestInfo, RequestInit } from 'node-fetch'

const fetch = (url: RequestInfo, init?: RequestInit) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, init))

type ConfigProps =
  | {
      noVerifySSL?: boolean;
    }
  | undefined;

export default class HTTPClient {
  agent: https.Agent | null

  constructor (config: ConfigProps) {
    this.agent = config?.noVerifySSL
      ? new https.Agent({ rejectUnauthorized: false })
      : null
  }

  async request (
    method: 'GET' | 'POST',
    url: string,
    data?: LooseObject,
    headers?: LooseObject
  ) {
    const options: RequestInit = {
      method,
      headers,
      body:
        method === 'POST' && data
          ? headers['Content-Type'] === 'application/json'
            ? JSON.stringify(data)
            : Object.entries(data)
              .map(
                ([key, value]) =>
                  encodeURIComponent(key) + '=' + encodeURIComponent(value)
              )
              .join('&')
          : null
    }
    if (this.agent) options.agent = this.agent

    return await fetch(url, options)
      .then(async (response) => {
        if (response.status < 300) {
          const data = await response.text()
          if (data.includes('\n')) {
            const parts = data.split('\n')
            return JSON.parse(parts[parts.length - 2]) // get the last response and parse it
          }

          return JSON.parse(data)
        } else {
          return response.json().then((err) => {
            if (err?.error?.message) {
              throw Error(err.error.message)
            } else if (err?.error || err?.message) {
              throw Error(err.error || err.message)
            }
          })
        }
      })
      .catch((error) => {
        if (typeof error === 'string') throw Error(error)
        if (error?.cause || error?.message) {
          throw Error(error.cause || error.message)
        }
        throw Error(error)
      })
  }

  async get (url: string, headers?: LooseObject) {
    return this.request('GET', url, null, headers)
  }

  async post (url: string, data?: LooseObject, headers?: LooseObject) {
    return this.request('POST', url, data, headers)
  }
}
