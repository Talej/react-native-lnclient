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
exports.CLN = void 0;
const restclient_1 = __importDefault(require("../utils/restclient"));
const misc_1 = require("../utils/misc");
class CLN extends restclient_1.default {
  constructor(config) {
    super(config);
  }
  signRequest() {
    return {
      "Content-Type": "application/json",
      macaroon: this.config.macaroon,
      encodingtype: "hex",
    };
  }
  getInfo() {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.getRequest("/v1/getinfo");
      if (response) {
        response.commit_hash = "";
        return (0, misc_1.mapKeys)(response, {
          version: "version",
          alias: "alias",
          id: "identity_pubkey",
          color: "color",
          blockheight: "block_height",
          address: "uris",
          our_features: "features",
        });
      }
      return response;
    });
  }
  getInvoices(props) {
    return __awaiter(this, void 0, void 0, function* () {
      // TODO: support label in props
      const response = yield this.getRequest("/v1/invoice/listInvoices", props);
      if (response) {
        response.invoices.map((v) => {
          if (v.amount_msat) v.amount_sat = Number(v.amount_msat) / 1000;
          return (0, misc_1.mapKeys)(v, {
            bolt11: "payment_request",
            label: "memo",
            payment_hash: "r_hash",
            amount_msat: "value_msat",
            amount_sat: "value",
          });
        });
      }
      return response;
    });
  }
  getInvoice(label) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.getRequest("/v1/invoice/listInvoices", {
        label,
      });
      if (response) {
        const invoices = response.invoices.map((v) => {
          if (v.amount_msat) v.amount_sat = Number(v.amount_msat) / 1000;
          if (!v.amount_msat) v.amount_msat = 0;
          if (!v.amount_sat) v.amount_sat = 0;
          return (0, misc_1.mapKeys)(v, {
            bolt11: "payment_request",
            label: "memo",
            payment_hash: "r_hash",
            amount_msat: ["value_msat", misc_1.toString],
            amount_sat: ["value", misc_1.toString],
            expires_at: ["expiry", misc_1.toString],
          });
        });
        if (invoices.length) return invoices[0];
      }
      return response;
    });
  }
  createInvoice(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = {}; // TODO: create coreLightning props type
      if (props === null || props === void 0 ? void 0 : props.value) {
        data.amount = props.value * 1000;
      } else {
        data.amount = 0;
      }
      if (props === null || props === void 0 ? void 0 : props.memo)
        data.label = props.memo;
      if (
        props === null || props === void 0 ? void 0 : props.description_hash
      ) {
        data.description = props.description_hash;
      } else {
        data.description = data.label;
      }
      if (!data.label) throw Error("memo must be supplied");
      const response = yield this.postRequest("/v1/invoice/genInvoice", data);
      if (response) {
        return (0, misc_1.mapKeys)(response, {
          payment_hash: "r_hash",
          bolt11: "payment_request",
        });
      }
      return response;
    });
  }
  subscribeInvoice(rHash) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.getRequest(`/v2/invoices/subscribe/${rHash}`);
    });
  }
  getPayments(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.getRequest("/v1/pay/listPays", props);
      if (response) {
        const r = {
          payments: response.pays.map((v) => {
            v.amount_sent_sat = v.amount_sent_msat / 1000;
            return (0, misc_1.mapKeys)(v, {
              bolt11: "payment_request",
              amount_sent_msat: "value_msat",
              amount_sent_sat: "value_sat",
            });
          }),
        };
        return r;
      }
      return response;
    });
  }
  getPayment(paymentRequest) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = yield this.getRequest("/v1/pay/listPays", {
        invoice: paymentRequest,
      });
      if (response) {
        // TODO: This isn't ideal. Might need to map LND getPayment into an array of results instead
        const v = response.pays[0];
        v.amount_sent_msat = v.amount_sent_msat.replace("msat", "");
        v.amount_sent_sat = Number(v.amount_sent_msat) / 1000;
        return {
          result: (0, misc_1.mapKeys)(v, {
            bol11: "payment_request",
            amount_sent_msat: "value_msat",
            amount_sent_sat: "value_sat",
          }),
        };
      }
      return response;
    });
  }
  sendPayment(props) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!props.timeout_seconds) props.timeout_seconds = 30;
      if (!props.payment_request)
        throw Error("payment_request must be provided");
      const data = { invoice: props.payment_request };
      if (props.amt) data.amount = props.amt * 1000;
      if (props.timeout_seconds) data.retry_for = props.timeout_seconds;
      const response = yield this.postRequest("/v1/pay", data);
      if (response) {
        if (response.amount_msat) {
          response.amount_sat = Number(response.amount_msat) / 1000;
        }
        return {
          result: (0, misc_1.mapKeys)(response, {
            amount_msat: ["value_msat", misc_1.toString],
            amount_sat: ["value", misc_1.toString],
            bolt11: "payment_request",
          }),
        };
      }
      return response;
    });
  }
}
exports.CLN = CLN;
//# sourceMappingURL=coreLightning.js.map
