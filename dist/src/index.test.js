"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const types = __importStar(require("./types"));
const index_1 = __importDefault(require("./index"));
const nodeType = index_1.default.getNodeType(process.env.LNNODE_TYPE);
const nodeHost = process.env.LNNODE_HOST || "";
const nodeMacroon = process.env.LNNODE_MACROON || false;
const nodeUser = process.env.LNNODE_USER || false;
const nodePass = process.env.LNNODE_PASS || false;
const config = { nodeType, host: nodeHost };
if (nodeMacroon) {
  config.macroon = nodeMacroon;
} else if (nodePass) {
  if (nodeUser) config.user = nodeUser;
  config.pass = nodePass;
}
const client = index_1.default.get(config);
describe("Host & credentials tests", () => {
  test("Check env node type is provided and valid", () => {
    expect(nodeType).toMatch(
      new RegExp("(" + types.NODETYPE_LND + "|" + types.NODETYPE_ECLAIR + ")")
    );
  });
  test("Check env host is provided", () => {
    expect(nodeHost).toMatch(/.+/);
  });
  test("Check env macroon or user/pass is provided", () => {
    expect(nodeMacroon || (nodeUser && nodePass) || nodePass).toBeTruthy();
  });
  test("Check invalid host", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const badHost = index_1.default.get({
        nodeType: "lnd",
        host: "https://www.invalidhost:8080",
      });
      yield expect(badHost.getInfo()).rejects.toThrowError();
    }));
  test("Check invalid macroon", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const badMacroon = "12345";
      const badClient = index_1.default.get({
        nodeType: "lnd",
        host: process.env.LNNODE_HOST,
        macroon: badMacroon,
      });
      yield expect(badClient.getInfo()).rejects.toThrowError();
    }));
  test("Check valid host authentication using getInfo endpoint", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const info = yield client.getInfo();
      console.log("info", info);
      expect(info).toEqual(
        expect.objectContaining({
          version: expect.any(String),
          identity_pubkey: expect.any(String),
          alias: expect.any(String),
          color: expect.any(String),
          features: expect.any(Object),
        })
      );
    }));
});
/*describe('Invoice related tests', () => {
  let newInv

  beforeAll(async () => {
    newInv = await client.createInvoice({ memo: 'no amount invoice' })
  })

  test('Create an undefined amount invoice', async () => {
    expect(newInv).toEqual(
      expect.objectContaining({
        r_hash: expect.any(String),
        payment_request: expect.any(String),
        add_index: expect.stringMatching(/[0-9]+/),
        payment_addr: expect.any(String)
      })
    )
  })

  test('Get an existing invoice', async () => {
    const response = await client.getInvoice(newInv.r_hash)

    expect(response).toEqual(
      expect.objectContaining({
        r_hash: newInv.r_hash,
        payment_request: newInv.payment_request
      })
    )
  })

  test('Get a list of invoices', async () => {
    expect(await client.getInvoices()).toEqual(
      expect.objectContaining({
        invoices: expect.any(Array) // TODO: Need to add a bit more thorough checking of the invoice format here
      })
    )
  })
})*/
/*describe('Payment related tests', () => {
  let newInv
  let paymentHash

  beforeAll(async () => {
    newInv = await client.createInvoice({ value: 1 })
  })

  test('Pay an invoice', async () => {
    // the payment might fail depending on the node but as long as we get a valid response we consider the test a success
    const args = {
      payment_request: newInv.payment_request,
      allow_self_payment: true
    }
    expect(await client.sendPayment(args)).toEqual(
      expect.objectContaining({
        result: expect.objectContaining({
          status: expect.any(String)
        })
      })
    )
  })

  test('Get a list of payments', async () => {
    const payments = await client.getPayments({ include_incomplete: true })
    paymentHash = payments?.payments[0].payment_hash

    expect(payments).toEqual(
      expect.objectContaining({
        payments: expect.any(Array)
      })
    )
  })

  test('Check that we have a payment_hash', () => {
    expect(paymentHash).toMatch(/.+/)
  })

  test('Get a single payment by payment_hash', async () => {
    expect(await client.getPayment(paymentHash)).toEqual(
      expect.objectContaining({
        result: expect.objectContaining({
          payment_hash: expect.any(String),
          status: expect.any(String)
        })
      })
    )
  })
})*/
//# sourceMappingURL=index.test.js.map
