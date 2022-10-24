import { configProps } from '../types'
import HTTPClient from './httpclient'

export default class RESTClient {
  config: configProps
  host: string
  client: HTTPClient

  constructor (config: configProps) {
    this.config = config
    this.host = config.host
    this.client = new HTTPClient({
      noVerifySSL: config?.noVerifySSL,
      useFetch: config?.useFetch,
      proxy: config?.proxy
    })
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

  async getRequest (uri: string, args?: object) {
    return this.client.get(this.url(uri, args), this.signRequest())
  }

  async postRequest (uri: string, args?: object) {
    return this.client.post(this.url(uri), args, this.signRequest())
  }

  isBase64 (s: string) {
    return s === Buffer.from(s, 'base64').toString('base64')
  }
}
