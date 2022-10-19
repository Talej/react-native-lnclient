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
Object.defineProperty(exports, "__esModule", { value: true });
const clients_1 = require("./clients");
const types = __importStar(require("./types"));
const APIClient = {
  getNodeType: (type) => {
    switch (type) {
      case "lnd":
        return types.NODETYPE_LND;
      case "eclair":
        return types.NODETYPE_ECLAIR;
    }
    return null;
  },
  get: (config) => {
    let lnNode = null;
    switch (config.nodeType) {
      case types.NODETYPE_LND:
        lnNode = new clients_1.LND(config);
        break;
      case types.NODETYPE_ECLAIR:
        lnNode = new clients_1.Eclair(config);
        break;
      default:
        throw Error("Unsupported node type");
    }
    return lnNode;
  },
};
exports.default = APIClient;
(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    require("dotenv").config();
    const nodeType = APIClient.getNodeType(process.env.LNNODE_TYPE);
    const host = process.env.LNNODE_HOST;
    //const macroon = process.env.LNNODE_MACROON;
    const pass = process.env.LNNODE_PASS;
    const client = APIClient.get({ nodeType, host, pass });
    const result = yield client.getInfo();
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
  }))();
//# sourceMappingURL=index.js.map
