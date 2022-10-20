import RESTClient from '../utils/restclient'
import { mapKeys, toString } from '../utils/misc'

import {
  NodeClient,
  configProps,
  getInvoicesProps,
  createInvoiceProps,
  eclairCreateInvoiceProps,
  getPaymentsProps,
  sendPaymentProps,
  LooseObject
} from '../types'

export class Eclair extends RESTClient implements NodeClient {
  config: configProps

  signRequest () {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(':' + this.config.pass).toString('base64')
    }
  }

  async getInfo () {
    const response = await this.postRequest('/getinfo')
    if (response) {
      return mapKeys(response, {
        version: 'version',
        alias: 'alias',
        chainHash: 'commit_hash',
        nodeId: 'identity_pubkey',
        color: 'color',
        blockHeight: 'block_height',
        publicAddresses: 'uris',
        features: 'features'
      })
    }

    return response
  }

  async getInvoices (props?: getInvoicesProps) {
    const response = await this.postRequest('/listinvoices', props)
    if (response) {
      return {
        invoices: response.map((v) =>
          mapKeys(v, {
            timestamp: ['creation_date', toString],
            serialized: 'payment_request',
            description: 'memo',
            paymentHash: 'r_hash',
            expiry: ['expiry', toString],
            minFinalCltvExpiry: ['cltv_expiry', toString],
            amount: 'value_msat',
            amount_sat: 'value',
            features: 'features',
            routingInfo: 'route_hints'
          })
        )
      }
    }

    return response
  }

  async getInvoice (paymentHash: string) {
    const response = await this.postRequest('/getinvoice', { paymentHash })
    if (response) {
      if (response.amount) response.amount_sat = Number(response.amount) / 1000

      if (!response.amount) response.amount = 0
      if (!response.amount_sat) response.amount_sat = 0

      return mapKeys(response, {
        timestamp: ['creation_date', toString],
        serialized: 'payment_request',
        description: 'memo',
        paymentHash: 'r_hash',
        expiry: ['expiry', toString],
        minFinalCltvExpiry: ['cltv_expiry', toString],
        amount: ['value_msat', toString],
        amount_sat: ['value', toString],
        features: 'features',
        routingInfo: 'route_hints'
      })
    }

    return response
  }

  async createInvoice (props: createInvoiceProps) {
    const data: eclairCreateInvoiceProps = {}
    if (props.value) data.amountMsat = props.value * 1000
    if (props.memo) data.description = props.memo
    if (props.description_hash) data.descriptionHash = props.description_hash

    if (!data.description && !data.descriptionHash) {
      throw Error('memo or description_hash must be supplied')
    }

    const response = await this.postRequest('/createinvoice', data)
    if (response) {
      return mapKeys(response, {
        paymentHash: 'r_hash',
        serialized: 'payment_request'
      })
    }

    return response
  }

  async subscribeInvoice (rHash: string) {
    // return this.getRequest(`/v2/invoices/subscribe/${rHash}`)
  }

  async getPayments (props?: getPaymentsProps) {
    const response = await this.postRequest('/audit')
    if (response) {
      const r = {
        payments: response.sent.map((v: LooseObject) => {
          v.recipientAmountSats = v.recipientAmount / 1000
          v.fee_msat = 0
          v.parts.map((p: LooseObject) => {
            v.fee_msat += p.feesPaid
            return p
          })
          v.fee_sat = v.fee_msat / 1000

          return mapKeys(v, {
            type: 'status',
            paymentHash: 'payment_hash',
            paymentPreimage: 'payment_preimage',
            recipientAmount: 'value_msat',
            recipientAmountSats: 'value_sat'
          })
        })
      }

      return r
    }

    return response
  }

  async getPayment (paymentHash: string) {
    const response = await this.postRequest('/getsentinfo', { paymentHash })
    if (response) {
      // TODO: This isn't ideal. Might need to map LND getPayment into an array of results instead
      const v = response[0]
      v.recipientAmountSats = v.recipientAmount / 1000
      v.status = v.status.type

      return {
        result: mapKeys(v, {
          paymentHash: 'payment_hash',
          paymentPreimage: 'payment_preimage',
          recipientAmount: 'value_msat',
          recipientAmountSats: 'value_sat'
        })
      }
    }

    return response
  }

  async sendPayment (props: sendPaymentProps) {
    const data = { invoice: props.payment_request, blocking: true }
    // TODO: Add other eclair specific data https://acinq.github.io/eclair/#payinvoice

    const response = await this.postRequest('/payinvoice', data)
    if (response) {
      return {
        result: mapKeys(response, {
          type: 'status',
          paymentHash: 'payment_hash'
        })
      }
    }

    return response
  }
}
