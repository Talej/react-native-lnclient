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
exports.LND = void 0;
const https_1 = __importDefault(require("https"));
const restclient_1 = __importDefault(require("../utils/restclient"));
class LND extends restclient_1.default {
  constructor(config) {
    const agent = new https_1.default.Agent({
      rejectUnauthorized: false,
    });
    super(config.host, agent);
    this.config = config;
  }
  signRequest() {
    return {
      "Content-Type": "application/json",
      "Grpc-Metadata-macaroon": this.config.macaroon,
    };
  }
  getInfo() {
    return __awaiter(this, void 0, void 0, function* () {
      return this.getRequest("/v1/getinfo");
    });
  }
  getInvoices(props) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.getRequest("/v1/invoices", props);
    });
  }
  getInvoice(rHash) {
    return __awaiter(this, void 0, void 0, function* () {
      const d = this.isBase64(rHash)
        ? Buffer.from(rHash, "base64").toString("hex")
        : rHash;
      return this.getRequest(`/v1/invoice/${d}`);
    });
  }
  createInvoice(props) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.postRequest("/v1/invoices", props);
    });
  }
  subscribeInvoice(rHash) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.getRequest(`/v2/invoices/subscribe/${rHash}`);
    });
  }
  getPayments(props) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.getRequest("/v1/payments", props);
    });
  }
  getPayment(paymentHash) {
    return __awaiter(this, void 0, void 0, function* () {
      const d = Buffer.from(paymentHash, "hex").toString("base64");
      return this.getRequest(`/v2/router/track/${d}`);
    });
  }
  sendPayment(props) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!props.timeout_seconds) props.timeout_seconds = 30;
      return this.postRequest("/v2/router/send", props);
    });
  }
}
exports.LND = LND;
//# sourceMappingURL=lnd.js.map
