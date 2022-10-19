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
exports.Eclair = void 0;
const restclient_1 = __importDefault(require("../utils/restclient"));
const misc_1 = require("../utils/misc");
class Eclair extends restclient_1.default {
  constructor(config) {
    super(config.host);
    this.config = config;
  }
  signRequest() {
    return {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " + Buffer.from(":" + this.config.pass).toString("base64"),
    };
  }
  getInfo() {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.postRequest("/getinfo");
      if (response) {
        return (0, misc_1.mapKeys)(response, {
          version: "version",
          alias: "alias",
          chainHash: "commit_hash",
          nodeId: "identity_pubkey",
          color: "color",
          blockHeight: "block_height",
          publicAddresses: "uris",
          features: "features",
        });
      }
      return response;
    });
  }
  getInvoices(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.postRequest("/listinvoices", props);
      if (response) {
        return {
          invoices: response.map((v) =>
            (0, misc_1.mapKeys)(v, {
              timestamp: ["creation_date", misc_1.toString],
              serialized: "payment_request",
              description: "memo",
              paymentHash: "r_hash",
              expiry: ["expiry", misc_1.toString],
              minFinalCltvExpiry: ["cltv_expiry", misc_1.toString],
              amount: "value_msat",
              amount_sat: "value",
              features: "features",
              routingInfo: "route_hints",
            })
          ),
        };
      }
      return response;
    });
  }
  getInvoice(paymentHash) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.postRequest("/getinvoice", { paymentHash });
      if (response) {
        if (response.amount)
          response.amount_sat = Number(response.amount) / 1000;
        if (!response.amount) response.amount = 0;
        if (!response.amount_sat) response.amount_sat = 0;
        return (0, misc_1.mapKeys)(response, {
          timestamp: ["creation_date", misc_1.toString],
          serialized: "payment_request",
          description: "memo",
          paymentHash: "r_hash",
          expiry: ["expiry", misc_1.toString],
          minFinalCltvExpiry: ["cltv_expiry", misc_1.toString],
          amount: ["value_msat", misc_1.toString],
          amount_sat: ["value", misc_1.toString],
          features: "features",
          routingInfo: "route_hints",
        });
      }
      return response;
    });
  }
  createInvoice(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = {};
      if (props.value) data.amountMsat = props.value * 1000;
      if (props.memo) data.description = props.memo;
      if (props.description_hash) data.descriptionHash = props.description_hash;
      if (!data.description && !data.descriptionHash) {
        throw Error("memo or description_hash must be supplied");
      }
      const response = yield this.postRequest("/createinvoice", data);
      if (response) {
        return (0, misc_1.mapKeys)(response, {
          paymentHash: "r_hash",
          serialized: "payment_request",
        });
      }
      return response;
    });
  }
  subscribeInvoice(rHash) {
    return __awaiter(this, void 0, void 0, function* () {
      // return this.getRequest(`/v2/invoices/subscribe/${rHash}`)
    });
  }
  getPayments(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.postRequest("/audit");
      if (response) {
        const r = {
          payments: response.sent.map((v) => {
            v.recipientAmountSats = v.recipientAmount / 1000;
            v.fee_msat = 0;
            v.parts.map((p) => {
              v.fee_msat += p.feesPaid;
              return p;
            });
            v.fee_sat = v.fee_msat / 1000;
            return (0, misc_1.mapKeys)(v, {
              type: "status",
              paymentHash: "payment_hash",
              paymentPreimage: "payment_preimage",
              recipientAmount: "value_msat",
              recipientAmountSats: "value_sat",
            });
          }),
        };
        return r;
      }
      return response;
    });
  }
  getPayment(paymentHash) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.postRequest("/getsentinfo", { paymentHash });
      if (response) {
        // TODO: This isn't ideal. Might need to map LND getPayment into an array of results instead
        const v = response[0];
        v.recipientAmountSats = v.recipientAmount / 1000;
        v.status = v.status.type;
        return {
          result: (0, misc_1.mapKeys)(v, {
            paymentHash: "payment_hash",
            paymentPreimage: "payment_preimage",
            recipientAmount: "value_msat",
            recipientAmountSats: "value_sat",
          }),
        };
      }
      return response;
    });
  }
  sendPayment(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = { invoice: props.payment_request, blocking: true };
      // TODO: Add other eclair specific data https://acinq.github.io/eclair/#payinvoice
      const response = yield this.postRequest("/payinvoice", data);
      if (response) {
        return {
          result: (0, misc_1.mapKeys)(response, {
            type: "status",
            paymentHash: "payment_hash",
          }),
        };
      }
      return response;
    });
  }
}
exports.Eclair = Eclair;
//# sourceMappingURL=eclair.js.map
