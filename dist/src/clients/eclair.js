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
      return this.postRequest("/listinvoices", props);
    });
  }
  getInvoice(paymentHash) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.postRequest("/getinvoice", { paymentHash });
    });
  }
  createInvoice(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = {};
      if (props === null || props === void 0 ? void 0 : props.value)
        data.amountMsat = props.value * 1000;
      if (props === null || props === void 0 ? void 0 : props.memo)
        data.description = props.memo;
      if (props === null || props === void 0 ? void 0 : props.description_hash)
        data.descriptionHash = props.description_hash;
      if (!data.description && !data.descriptionHash)
        throw Error("memo or description_hash must be supplied");
      return this.postRequest("/createinvoice", data);
    });
  }
  subscribeInvoice(rHash) {
    return __awaiter(this, void 0, void 0, function* () {
      // return this.getRequest(`/v2/invoices/subscribe/${rHash}`)
    });
  }
  getPayments(props) {
    return __awaiter(this, void 0, void 0, function* () {
      // return this.getRequest('/v1/payments', props)
    });
  }
  getPayment(paymentHash) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.postRequest("/getsentinfo", { paymentHash });
    });
  }
  sendPayment(props) {
    return __awaiter(this, void 0, void 0, function* () {
      const data = { invoice: props.payment_request };
      // TODO: Add other eclair specific data https://acinq.github.io/eclair/#payinvoice
      return this.postRequest("/payinvoice", data);
    });
  }
}
exports.Eclair = Eclair;
//# sourceMappingURL=eclair.js.map
