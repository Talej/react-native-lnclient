"use strict";
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
const index_1 = __importDefault(require("./index"));
const clients = [];
for (let i = 1; process.env["LNNODE" + i + "_TYPE"]; i++) {
  const nodeType = index_1.default.getNodeType(
    process.env["LNNODE" + i + "_TYPE"]
  );
  const nodeHost = process.env["LNNODE" + i + "_HOST"] || "";
  const nodeMacaroon = process.env["LNNODE" + i + "_MACAROON"] || false;
  const nodeUser = process.env["LNNODE" + i + "_USER"] || false;
  const nodePass = process.env["LNNODE" + i + "_PASS"] || false;
  const config = { nodeType, host: nodeHost };
  if (nodeMacaroon) {
    config.macaroon = nodeMacaroon;
  } else if (nodePass) {
    if (nodeUser) config.user = nodeUser;
    config.pass = nodePass;
  }
  const client = index_1.default.get(config);
  clients.push(client);
}
describe("Host & credentials tests", () => {
  test("Check that we have at least one API client", () => {
    expect(clients.length > 0).toBeTruthy();
  });
  test("LND: Check invalid host", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const badHost = index_1.default.get({
        nodeType: "lnd",
        host: "https://www.invalidhost:8080",
      });
      yield expect(badHost.getInfo()).rejects.toThrowError();
    }));
  test("eclair: Check invalid host", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const badHost = index_1.default.get({
        nodeType: "eclair",
        host: "https://www.invalidhost:8080",
      });
      yield expect(badHost.getInfo()).rejects.toThrowError();
    }));
  clients.forEach((client) => {
    test(
      client.constructor.name +
        ": Check valid host authentication using getInfo endpoint",
      () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const info = yield client.getInfo();
          expect(info).toEqual(
            expect.objectContaining({
              version: expect.any(String),
              identity_pubkey: expect.any(String),
              alias: expect.any(String),
              color: expect.any(String),
              commit_hash: expect.any(String),
              block_height: expect.any(Number),
              uris: expect.any(Array),
              features: expect.any(Object),
            })
          );
        })
    );
  });
});
describe("Invoice related tests", () => {
  clients.forEach((client) => {
    let newInv, invDesc;
    beforeAll(() =>
      __awaiter(void 0, void 0, void 0, function* () {
        invDesc = "no amount invoice " + Date.now();
        newInv = yield client.createInvoice({ memo: invDesc });
      })
    );
    test(client.constructor.name + ": Create an undefined amount invoice", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        expect(newInv).toEqual(
          expect.objectContaining({
            r_hash: expect.any(String),
            payment_request: expect.any(String),
          })
        );
      })
    );
    test(client.constructor.name + ": Get an existing invoice", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const key =
          client.constructor.name === "coreLightning" ? invDesc : newInv.r_hash;
        const response = yield client.getInvoice(key);
        expect(response).toEqual(
          expect.objectContaining({
            // creation_date: expect.stringMatching(/\d+/),
            memo: invDesc,
            r_hash: newInv.r_hash,
            payment_request: newInv.payment_request,
            expiry: expect.stringMatching(/\d+/),
            // cltv_expiry: expect.stringMatching(/\d+/),
            value_msat: expect.any(String),
            value: expect.any(String),
            // features: expect.any(Object),
            // route_hints: expect.any(Array)
          })
        );
      })
    );
    test(client.constructor.name + ": Get a list of invoices", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        expect(yield client.getInvoices()).toEqual(
          expect.objectContaining({
            invoices: expect.any(Array), // TODO: Need to add a bit more thorough checking of the invoice format here
          })
        );
      })
    );
  });
});
describe("Payment related tests", () => {
  const newInv = [];
  clients.forEach((client, idx) => {
    let paymentHash;
    let paymentRequest;
    beforeAll(() =>
      __awaiter(void 0, void 0, void 0, function* () {
        newInv.push({
          node: client.constructor.name,
          inv: yield client.createInvoice({
            memo: "paying our own invoice " + Date.now(),
            value: 1,
          }),
        });
      })
    );
    test(client.constructor.name + ": Pay an invoice", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        // the payment might fail depending on the node but as long as we get a valid response we consider the test a success
        // if more than one node has been tested we will try and use an invoice from a different node to avoid
        // eclair and core-lightning inability to pay-to-self
        let bolt11;
        if (newInv[idx - 1]) {
          bolt11 = newInv[idx - 1];
        } else {
          bolt11 = newInv[idx];
        }
        paymentRequest = bolt11.inv.payment_request;
        const args = {
          payment_request: bolt11.inv.payment_request,
          allow_self_payment: true,
        };
        const pay = yield client.sendPayment(args);
        paymentHash =
          pay === null || pay === void 0 ? void 0 : pay.result.payment_hash;
        expect(pay).toEqual(
          expect.objectContaining({
            result: expect.objectContaining({
              status: expect.any(String),
              payment_hash: expect.any(String),
            }),
          })
        );
      })
    );
    test(client.constructor.name + ": Get a list of payments", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const payments = yield client.getPayments({ include_incomplete: true });
        // paymentHash = payments?.payments[0].payment_hash
        // paymentHash = '7508b20c6d7948c7d7906265b033989dbabced4c117ce12503629990637667dd'
        expect(payments).toEqual(
          expect.objectContaining({
            payments: expect.any(Array),
          })
        );
      })
    );
    test(
      client.constructor.name + ": Check that we have a payment_hash",
      () => {
        expect(paymentHash).toMatch(/.+/);
      }
    );
    test(
      client.constructor.name + ": Get a single payment by payment_hash",
      () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const response = yield client.getPayment(
            client.constructor.name === "coreLightning"
              ? paymentRequest
              : paymentHash
          );
          expect(response).toEqual(
            expect.objectContaining({
              result: expect.objectContaining({
                payment_hash: expect.any(String),
                status: expect.any(String),
              }),
            })
          );
        })
    );
  });
});
//# sourceMappingURL=index.test.js.map
