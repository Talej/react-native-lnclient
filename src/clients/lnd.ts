import { Buffer } from 'buffer'
import RESTClient from '../utils/restclient'
import {
  NodeClient,
  configProps,
  getInvoicesProps,
  createInvoiceProps,
  getPaymentsProps,
  sendPaymentProps,
  estimateFeeProps
} from '../types'

export class LND extends RESTClient implements NodeClient {
  config: configProps

  signRequest () {
    return {
      'Content-Type': 'application/json',
      'Grpc-Metadata-macaroon': this.config.macaroon
    }
  }

  async getInfo () {
    return this.getRequest('/v1/getinfo')
  }

  async getInvoices (props?: getInvoicesProps) {
    return this.getRequest('/v1/invoices', props)
  }

  async getInvoice (rHash: string) {
    const d = this.isBase64(rHash)
      ? Buffer.from(rHash, 'base64').toString('hex')
      : rHash

    return this.getRequest(`/v1/invoice/${d}`)
  }

  async createInvoice (props: createInvoiceProps) {
    return this.postRequest('/v1/invoices', props)
  }

  async subscribeInvoice (rHash: string) {
    return this.getRequest(`/v2/invoices/subscribe/${rHash}`)
  }

  async getPayments (props?: getPaymentsProps) {
    return this.getRequest('/v1/payments', props)
  }

  async getPayment (paymentHash: string) {
    const d = Buffer.from(paymentHash, 'hex').toString('base64')

    return this.getRequest(`/v2/router/track/${d}`)
  }

  async sendPayment (props: sendPaymentProps) {
    if (!props.timeout_seconds) props.timeout_seconds = 30

    return this.postRequest('/v2/router/send', props)
  }

  async estimateFee (props: estimateFeeProps) {
    props.dest = Buffer.from(props.dest, 'hex').toString('base64')
    return this.postRequest('/v2/router/route/estimatefee', props).then(
      (res) => {
        if (res.routing_fee_msat) {
          return { fee_sats: res.routing_fee_msat / 1000 }
        }
      }
    )
  }

  async decodePayReq (payReq: string) {
    return this.getRequest(`/v1/payreq/${payReq}`)
  }
}
