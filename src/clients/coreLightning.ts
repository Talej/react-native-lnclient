import RESTClient from '../utils/restclient'
import { mapKeys, toString } from '../utils/misc'

import {
  NodeClient,
  configProps,
  getInvoicesProps,
  createInvoiceProps,
  getPaymentsProps,
  sendPaymentProps,
  LooseObject
} from '../types'

export class CLN extends RESTClient implements NodeClient {
  config: configProps

  signRequest () {
    return {
      'Content-Type': 'application/json',
      macaroon: this.config.macaroon,
      encodingtype: 'hex'
    }
  }

  async getInfo () {
    const response = await this.getRequest('/v1/getinfo')
    if (response) {
      response.commit_hash = ''

      return mapKeys(response, {
        version: 'version',
        alias: 'alias',
        id: 'identity_pubkey',
        color: 'color',
        blockheight: 'block_height',
        address: 'uris',
        our_features: 'features'
      })
    }

    return response
  }

  async getInvoices (props?: getInvoicesProps) {
    // TODO: support label in props
    const response = await this.getRequest('/v1/invoice/listInvoices', props)
    if (response) {
      response.invoices.map((v: LooseObject) => {
        if (v.amount_msat) v.amount_sat = Number(v.amount_msat) / 1000

        return mapKeys(v, {
          bolt11: 'payment_request',
          label: 'memo',
          payment_hash: 'r_hash',
          amount_msat: 'value_msat',
          amount_sat: 'value'
        })
      })
    }

    return response
  }

  async getInvoice (label: string) {
    const response = await this.getRequest('/v1/invoice/listInvoices', {
      label
    })
    if (response) {
      const invoices = response.invoices.map((v: LooseObject) => {
        if (v.amount_msat) v.amount_sat = Number(v.amount_msat) / 1000

        if (!v.amount_msat) v.amount_msat = 0
        if (!v.amount_sat) v.amount_sat = 0

        return mapKeys(v, {
          bolt11: 'payment_request',
          label: 'memo',
          payment_hash: 'r_hash',
          amount_msat: ['value_msat', toString],
          amount_sat: ['value', toString],
          expires_at: ['expiry', toString]
        })
      })

      if (invoices.length) return invoices[0]
    }

    return response
  }

  async createInvoice (props: createInvoiceProps) {
    const data: LooseObject = {} // TODO: create coreLightning props type
    if (props?.value) {
      data.amount = props.value * 1000
    } else {
      data.amount = 0
    }
    if (props?.memo) data.label = props.memo
    if (props?.description_hash) {
      data.description = props.description_hash
    } else {
      data.description = data.label
    }

    if (!data.label) throw Error('memo must be supplied')

    const response = await this.postRequest('/v1/invoice/genInvoice', data)
    if (response) {
      return mapKeys(response, {
        payment_hash: 'r_hash',
        bolt11: 'payment_request'
      })
    }

    return response
  }

  async subscribeInvoice (rHash: string) {
    return this.getRequest(`/v2/invoices/subscribe/${rHash}`)
  }

  async getPayments (props?: getPaymentsProps) {
    const response = await this.getRequest('/v1/pay/listPays', props)
    if (response) {
      const r = {
        payments: response.pays.map((v: LooseObject) => {
          v.amount_sent_sat = v.amount_sent_msat / 1000

          return mapKeys(v, {
            bolt11: 'payment_request',
            amount_sent_msat: 'value_msat',
            amount_sent_sat: 'value_sat'
          })
        })
      }

      return r
    }

    return response
  }

  async getPayment (paymentRequest: string) {
    const response = await this.getRequest('/v1/pay/listPays', {
      invoice: paymentRequest
    })
    if (response) {
      // TODO: This isn't ideal. Might need to map LND getPayment into an array of results instead
      const v = response.pays[0]
      v.amount_sent_msat = v.amount_sent_msat.replace('msat', '')
      v.amount_sent_sat = Number(v.amount_sent_msat) / 1000

      return {
        result: mapKeys(v, {
          bol11: 'payment_request',
          amount_sent_msat: 'value_msat',
          amount_sent_sat: 'value_sat'
        })
      }
    }

    return response
  }

  async sendPayment (props: sendPaymentProps) {
    if (!props.timeout_seconds) props.timeout_seconds = 30

    if (!props.payment_request) throw Error('payment_request must be provided')

    const data: LooseObject = { invoice: props.payment_request }
    if (props.amt) data.amount = props.amt * 1000
    if (props.timeout_seconds) data.retry_for = props.timeout_seconds

    const response = await this.postRequest('/v1/pay', data)
    if (response) {
      if (response.amount_msat) {
        response.amount_sat = Number(response.amount_msat) / 1000
      }

      return {
        result: mapKeys(response, {
          amount_msat: ['value_msat', toString],
          amount_sat: ['value', toString],
          bolt11: 'payment_request'
        })
      }
    }

    return response
  }
}
