import * as types from './types'
import APIClient from './index'

const strToBool = (v: string | undefined) => {
  if (
    typeof v === 'string' &&
    (v.toLocaleLowerCase() === 'true' ||
      v.toLocaleLowerCase() === 'yes' ||
      v === '1')
  ) { return true }
  return false
}

const clients = []
for (let i = 1; process.env['LNNODE' + i + '_TYPE']; i++) {
  const nodeType = APIClient.getNodeType(process.env['LNNODE' + i + '_TYPE'])
  const nodeHost = process.env['LNNODE' + i + '_HOST'] || ''
  const nodeMacaroon = process.env['LNNODE' + i + '_MACAROON'] || false
  const nodeUser = process.env['LNNODE' + i + '_USER'] || false
  const nodePass = process.env['LNNODE' + i + '_PASS'] || false
  const noVerifySSL = strToBool(process.env['LNNODE' + i + '_NOVERIFYSSL'])

  const config: types.configProps = { nodeType, host: nodeHost, noVerifySSL }
  if (nodeMacaroon) {
    config.macaroon = nodeMacaroon
  } else if (nodePass) {
    if (nodeUser) config.user = nodeUser
    config.pass = nodePass
  }
  const client = APIClient.get(config)
  clients.push(client)
}

describe('Host & credentials tests', () => {
  test('Check that we have at least one API client', () => {
    expect(clients.length > 0).toBeTruthy()
  })

  test('LND: Check invalid host', async () => {
    const badHost = APIClient.get({
      nodeType: 'lnd',
      host: 'https://www.invalidhost:8080'
    })

    await expect(badHost.getInfo()).rejects.toThrowError()
  })

  test('eclair: Check invalid host', async () => {
    const badHost = APIClient.get({
      nodeType: 'eclair',
      host: 'https://www.invalidhost:8080'
    })

    await expect(badHost.getInfo()).rejects.toThrowError()
  })

  clients.forEach((client) => {
    test(
      client.constructor.name +
        ': Check valid host authentication using getInfo endpoint',
      async () => {
        const info = await client.getInfo()

        expect(info).toEqual(
          expect.objectContaining({
            version: expect.any(String),
            identity_pubkey: expect.any(String),
            alias: expect.any(String),
            color: expect.any(String),
            commit_hash: expect.any(String),
            block_height: expect.any(Number),
            uris: expect.any(Array),
            features: expect.any(Object)
          })
        )
      }
    )
  })
})

describe('Invoice related tests', () => {
  clients.forEach((client) => {
    let newInv, invDesc: string

    beforeAll(async () => {
      invDesc = 'no amount invoice ' + Date.now()
      newInv = await client.createInvoice({ memo: invDesc })
    })

    test(
      client.constructor.name + ': Create an undefined amount invoice',
      async () => {
        expect(newInv).toEqual(
          expect.objectContaining({
            r_hash: expect.any(String),
            payment_request: expect.any(String)
          })
        )
      }
    )

    test(client.constructor.name + ': Get an existing invoice', async () => {
      const key = client.constructor.name === 'CLN' ? invDesc : newInv.r_hash
      const response = await client.getInvoice(key)

      expect(response).toEqual(
        expect.objectContaining({
          // creation_date: expect.stringMatching(/\d+/),
          memo: invDesc,
          r_hash: newInv.r_hash,
          payment_request: newInv.payment_request,
          expiry: expect.stringMatching(/\d+/),
          // cltv_expiry: expect.stringMatching(/\d+/),
          value_msat: expect.any(String),
          value: expect.any(String)
          // features: expect.any(Object),
          // route_hints: expect.any(Array)
        })
      )
    })

    test(client.constructor.name + ': Get a list of invoices', async () => {
      expect(await client.getInvoices()).toEqual(
        expect.objectContaining({
          invoices: expect.any(Array) // TODO: Need to add a bit more thorough checking of the invoice format here
        })
      )
    })
  })
})

describe('Payment related tests', () => {
  const newInv = []
  clients.forEach((client, idx) => {
    let paymentHash
    let paymentRequest

    beforeAll(async () => {
      newInv.push({
        node: client.constructor.name,
        inv: await client.createInvoice({
          memo: 'paying our own invoice ' + Date.now(),
          value: 1
        })
      })
    })

    test(client.constructor.name + ': Pay an invoice', async () => {
      // the payment might fail depending on the node but as long as we get a valid response we consider the test a success

      // if more than one node has been tested we will try and use an invoice from a different node to avoid
      // eclair and core-lightning inability to pay-to-self
      let bolt11
      if (newInv[idx - 1]) {
        bolt11 = newInv[idx - 1]
      } else {
        bolt11 = newInv[idx]
      }

      paymentRequest = bolt11.inv.payment_request
      const args = {
        payment_request: bolt11.inv.payment_request, // newInv.payment_request,
        allow_self_payment: true
      }
      const pay = await client.sendPayment(args)
      paymentHash = pay?.result.payment_hash
      expect(pay).toEqual(
        expect.objectContaining({
          result: expect.objectContaining({
            status: expect.any(String),
            payment_hash: expect.any(String)
          })
        })
      )
    })

    test(client.constructor.name + ': Get a list of payments', async () => {
      const payments = await client.getPayments({ include_incomplete: true })
      // paymentHash = payments?.payments[0].payment_hash
      // paymentHash = '7508b20c6d7948c7d7906265b033989dbabced4c117ce12503629990637667dd'

      expect(payments).toEqual(
        expect.objectContaining({
          payments: expect.any(Array)
        })
      )
    })

    test(
      client.constructor.name + ': Check that we have a payment_hash',
      () => {
        expect(paymentHash).toMatch(/.+/)
      }
    )

    test(
      client.constructor.name + ': Get a single payment by payment_hash',
      async () => {
        const response = await client.getPayment(
          client.constructor.name === 'CLN' ? paymentRequest : paymentHash
        )
        expect(response).toEqual(
          expect.objectContaining({
            result: expect.objectContaining({
              payment_hash: expect.any(String),
              status: expect.any(String)
            })
          })
        )
      }
    )
  })
})
