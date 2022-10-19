import { Eclair, LND, CLN } from './clients'
import * as types from './types'

const APIClient = {
  getNodeType: (type: string): types.nodeTypes => {
    switch (type) {
      case 'lnd':
        return types.NODETYPE_LND

      case 'eclair':
        return types.NODETYPE_ECLAIR

      case 'cln':
        return types.NODETYPE_CLN
    }

    return null
  },

  get: (config: types.configProps) => {
    let lnNode = null
    switch (config.nodeType) {
      case types.NODETYPE_LND:
        lnNode = new LND(config)
        break

      case types.NODETYPE_ECLAIR:
        lnNode = new Eclair(config)
        break

      case types.NODETYPE_CLN:
        lnNode = new CLN(config)
        break

      default:
        throw Error('Unsupported node type')
    }

    return lnNode
  }
}

export default APIClient

/* (async () => {
        require('dotenv').config();

        const nodeType = APIClient.getNodeType(process.env.LNNODE_TYPE);
        const host = process.env.LNNODE_HOST;
        //const macroon = process.env.LNNODE_MACROON;
        const pass = process.env.LNNODE_PASS;

        const client = APIClient.get({ nodeType, host, pass });

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

        //console.log(result)
    })(); */
