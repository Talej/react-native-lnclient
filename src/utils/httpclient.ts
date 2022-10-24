import { LooseObject } from '../types'

type ConfigProps =
  | {
      noVerifySSL?: boolean;
      useFetch?: boolean;
      proxy?: string;
      proxyAuth?: string;
    }
  | undefined;

export default class HTTPClient {
  config: ConfigProps
  blobUtil: any

  constructor (config: ConfigProps) {
    this.config = config

    if (!config?.useFetch) {
      this.blobUtil = require('react-native-blob-util').default
    }
  }

  async request (
    method: 'GET' | 'POST',
    url: string,
    data?: object,
    headers?: LooseObject
  ) {
    if (this.config.proxy) {
      headers['X-Proxy-Target-URL'] = url
      if (this.config.proxyAuth) {
        headers['X-Proxy-Auth'] = this.config.proxyAuth
      }
      url = this.config.proxy
    }
    if (this.blobUtil) {
      return await this.blobUtil
        .config({ trusty: this.config.noVerifySSL })
        .fetch(method, url, headers, data)
        .then(async (response) => {
          if (response.respInfo.status < 300) {
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
              } else if (err.error || err.message) {
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
    } else {
      const opts = {
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
      return await fetch(url, opts)
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
              } else if (err.error || err.message) {
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
  }

  async get (url: string, headers?: LooseObject) {
    return this.request('GET', url, null, headers)
  }

  async post (url: string, data?: LooseObject, headers?: LooseObject) {
    return this.request('POST', url, data, headers)
  }
}
