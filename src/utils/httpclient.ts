import { LooseObject } from '../types'
import ReactNativeBlobUtil from 'react-native-blob-util'

type ConfigProps =
  | {
      noVerifySSL?: boolean;
    }
  | undefined;

export default class HTTPClient {
  config: ConfigProps

  constructor (config: ConfigProps) {
    this.config = config
  }

  async request (
    method: 'GET' | 'POST',
    url: string,
    data?: object,
    headers?: LooseObject
  ) {
    return await ReactNativeBlobUtil.config({ trusty: this.config.noVerifySSL })
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
            if (err.error.message) {
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

  async get (url: string, headers?: LooseObject) {
    return this.request('GET', url, null, headers)
  }

  async post (url: string, data?: LooseObject, headers?: LooseObject) {
    return this.request('POST', url, data, headers)
  }
}
