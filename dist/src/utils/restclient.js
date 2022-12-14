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
const httpclient_1 = __importDefault(require("./httpclient"));
const buffer_1 = require("buffer");
class RESTClient {
  constructor(config) {
    this.config = config;
    this.host = config.host;
    this.client = new httpclient_1.default({
      noVerifySSL:
        config === null || config === void 0 ? void 0 : config.noVerifySSL,
      useFetch: config === null || config === void 0 ? void 0 : config.useFetch,
      useTor: !!config.host.match(/\.onion(:[0-9]+)?$/),
      proxy: config === null || config === void 0 ? void 0 : config.proxy,
      proxyAuth:
        config === null || config === void 0 ? void 0 : config.proxyAuth,
    });
  }
  signRequest() {
    return {};
  }
  url(uri, args) {
    const url = new URL(this.host + uri);
    if (args) {
      Object.entries(args).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    // URL is adding trailing slash. This upsets LND so we'll strip it if it wasn't intentional
    let s = url.href;
    if (uri.substring(-1, 1) === "/") s = s.replace(/\/+$/, "");
    return s;
  }
  getRequest(uri, args) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.client.get(this.url(uri, args), this.signRequest());
    });
  }
  postRequest(uri, args) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.client.post(this.url(uri), args, this.signRequest());
    });
  }
  isBase64(s) {
    return s === buffer_1.Buffer.from(s, "base64").toString("base64");
  }
}
exports.default = RESTClient;
//# sourceMappingURL=restclient.js.map
