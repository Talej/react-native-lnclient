import { lnd } from './clients'
import * as types from './types'
import { TorClient } from '@mich4l/tor-client'

export const getNodeType = (type: string): typeof types.NODETYPE_LND => {
  switch (type) {
    case 'lnd':
      return types.NODETYPE_LND
  }

  return null
}

const APIClient = (config: types.configProps) => {
  let lnNode = null
  switch (config.nodeType) {
    case types.NODETYPE_LND:
      lnNode = lnd(config)
      break

    default:
      throw Error('Unsupported node type')
  }

  const getInfo = async () => {
    return await lnNode.getInfo()
  }

  const getInvoices = async (props?: types.getInvoicesProps) => {
    return await lnNode.getInvoices(props)
  }

  const getInvoice = async (hash: string) => {
    return await lnNode.getInvoice(hash)
  }

  const createInvoice = async (props?: types.createInvoiceProps) => {
    return await lnNode.createInvoice(props)
  }

  const subscribeInvoice = async (hash: string) => {
    return await lnNode.subscribeInvoice(hash)
  }

  const getPayments = async (props?: types.getPaymentsProps) => {
    return await lnNode.getPayments(props)
  }

  const getPayment = async (paymentHash: string) => {
    return await lnNode.getPayment(paymentHash)
  }

  const sendPayment = async (props: types.sendPaymentProps) => {
    return await lnNode.sendPayment(props)
  }

  return {
    getInfo,
    getInvoices,
    getInvoice,
    createInvoice,
    subscribeInvoice,
    getPayments,
    getPayment,
    sendPayment
  }
}

export default APIClient

/* (async () => {
        const torclient = new TorClient({ socksHost: '127.0.0.1', socksPort: 9050 });
        const url = 'https://qgtcf377lmt46yrrpekcmjojxajleqvfautwfzokgpglbow7yigddrad.onion:8080/v1/getinfo';
        //const response = await torclient.get(url);
        //let response:any = await torclient.torcheck();
        //console.log(response); // HTML -> string
        constresponse = await torclient.get(url)
        console.log(response)

        /*require('dotenv').config();

        const nodeType = getNodeType(process.env.LNNODE_TYPE);
        const host = process.env.LNNODE_HOST;
        const macroon = process.env.LNNODE_MACROON;

        const client = APIClient({ nodeType, host, macroon });

        const result = await client.getInfo();
        //const result = await client.getInvoices({pending_only: true});
        //const result = await client.getInvoice('bNSmglZdKbdOVmmUAVlvUr9vrc+5oDVatbaRqGUxsNY=');
        //const result = await client.subscribeInvoice('bNSmglZdKbdOVmmUAVlvUr9vrc+5oDVatbaRqGUxsNY=');
        //const result = await client.getPayments( { include_incomplete: true });
        //const result = await client.sendPayment({ payment_request: 'lnbc10n1p33r8p0pp5anum5p7rlsufvdanrhhneecksqjeqkantjxk0h2du63wyjw88d9qdq4d9h8vmmfvdjjqvfwxy6nqcqzpgxqyz5vqsp5x2f9kf8ypw7wypqamf96g3vv92m6w45heg4nevzvf2l4y0z7rmzq9qyyssqm8g7ug339yupjyhvgj07uy45qm3v9y8zl7fupf9s9rawueds980hd84jgdkgyc2d0eeauudj6w0s9h9wtd5whttz5fwmhu58hskv5rgp0lm52u'});
        //const result = await client.createInvoice();
        //const payment_hash = '82abf04d50bb0a14013c0bf7c2747da7e5b4b05df8997309bef705f3b869283e';

        //console.log('hex', Buffer.from(payment_hash, 'hex').toString('base64'))
        //const result = await client.getPayment(payment_hash);

        console.log(result)
    })(); */
