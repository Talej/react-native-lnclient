import * as types from "./types";
import APIClient, { getNodeType } from "./index";

const nodeType = getNodeType(process.env.LNNODE_TYPE);
const nodeHost = process.env.LNNODE_HOST || "";
const nodeMacroon = process.env.LNNODE_MACROON || "";

const config = { nodeType, host: nodeHost, macroon: nodeMacroon };
const client = APIClient(config);

describe("Host & credentials tests", () => {
  test("Check env node type is provided and valid", () => {
    expect(nodeType).toBe(types.NODETYPE_LND);
  });

  test("Check env host is provided", () => {
    expect(nodeHost).toMatch(/.+/);
  });

  test("Check env macroon is provided", () => {
    expect(nodeMacroon).toMatch(/.+/);
  });

  test("Check invalid host", async () => {
    const badHost = APIClient({
      nodeType: "lnd",
      host: "https://www.invalidhost:8080",
    });

    await expect(badHost.getInfo()).rejects.toMatch(/Error:/);
  });

  test("Check invalid macroon", async () => {
    const badMacroon = "12345";
    const badClient = APIClient({
      nodeType: "lnd",
      host: process.env.LNNODE_HOST,
      macroon: badMacroon,
    });
    await expect(badClient.getInfo()).rejects.toMatch("Error");
  });

  test("Check valid host macroon using getInfo endpoint", async () => {
    const info = await client.getInfo();

    expect(info).toEqual(
      expect.objectContaining({
        version: expect.any(String),
        identity_pubkey: expect.any(String),
        alias: expect.any(String),
      })
    );
  });

  /*test('Check tor host', async () => {
        const torHost = 'bxuqmgowd2tdnvmiiyzhaag5idg4guorwu5ubi3tzwtds2abur35mgad.onion:9735';
        const config = { nodeType, host: torHost, macroon: nodeMacroon };
        const client = APIClient(config);

        const info = await client.getInfo()

        expect(info).toEqual(expect.objectContaining({
            version: expect.any(String),
            identity_pubkey: expect.any(String),
            alias: expect.any(String)
        }))
    })*/
});

describe("Invoice related tests", () => {
  let newInv;

  beforeAll(async () => {
    newInv = await client.createInvoice();
  });

  test("Create an undefined amount invoice", async () => {
    expect(newInv).toEqual(
      expect.objectContaining({
        r_hash: expect.any(String),
        payment_request: expect.any(String),
        add_index: expect.stringMatching(/[0-9]+/),
        payment_addr: expect.any(String),
      })
    );
  });

  test("Get an existing invoice", async () => {
    const response = await client.getInvoice(newInv.r_hash);

    expect(response).toEqual(
      expect.objectContaining({
        r_hash: newInv.r_hash,
        payment_request: newInv.payment_request,
      })
    );
  });

  test("Get a list of invoices", async () => {
    expect(await client.getInvoices()).toEqual(
      expect.objectContaining({
        invoices: expect.any(Array), // TODO: Need to add a bit more thorough checking of the invoice format here
      })
    );
  });
});

describe("Payment related tests", () => {
  let newInv;
  let payment_hash;

  beforeAll(async () => {
    newInv = await client.createInvoice({ value: 1 });
  });

  test("Pay an invoice", async () => {
    // the payment might fail depending on the node but as long as we get a valid response we consider the test a success
    const args = {
      payment_request: newInv.payment_request,
      allow_self_payment: true,
    };
    expect(await client.sendPayment(args)).toEqual(
      expect.objectContaining({
        result: expect.objectContaining({
          status: expect.any(String),
        }),
      })
    );
  });

  test("Get a list of payments", async () => {
    const payments = await client.getPayments({ include_incomplete: true });
    payment_hash = payments?.payments[0].payment_hash;

    expect(payments).toEqual(
      expect.objectContaining({
        payments: expect.any(Array),
      })
    );
  });

  test("Check that we have a payment_hash", () => {
    expect(payment_hash).toMatch(/.+/);
  });

  test("Get a single payment by payment_hash", async () => {
    expect(await client.getPayment(payment_hash)).toEqual(
      expect.objectContaining({
        result: expect.objectContaining({
          payment_hash: expect.any(String),
          status: expect.any(String),
        }),
      })
    );
  });
});
