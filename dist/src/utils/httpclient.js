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
const https_1 = __importDefault(require("https"));
const fetch = (url, init) =>
  Promise.resolve()
    .then(() => __importStar(require("node-fetch")))
    .then(({ default: fetch }) => fetch(url, init));
class HTTPClient {
  constructor(config) {
    this.agent = (
      config === null || config === void 0 ? void 0 : config.noVerifySSL
    )
      ? new https_1.default.Agent({ rejectUnauthorized: false })
      : null;
  }
  request(method, url, data, headers) {
    return __awaiter(this, void 0, void 0, function* () {
      const options = {
        method,
        headers,
        body:
          method === "POST" && data
            ? headers["Content-Type"] === "application/json"
              ? JSON.stringify(data)
              : Object.entries(data)
                  .map(
                    ([key, value]) =>
                      encodeURIComponent(key) + "=" + encodeURIComponent(value)
                  )
                  .join("&")
            : null,
      };
      if (this.agent) options.agent = this.agent;
      return yield fetch(url, options)
        .then((response) =>
          __awaiter(this, void 0, void 0, function* () {
            if (response.status < 300) {
              const data = yield response.text();
              if (data.includes("\n")) {
                const parts = data.split("\n");
                return JSON.parse(parts[parts.length - 2]); // get the last response and parse it
              }
              return JSON.parse(data);
            } else {
              return response.json().then((err) => {
                var _a;
                if (
                  (_a = err === null || err === void 0 ? void 0 : err.error) ===
                    null || _a === void 0
                    ? void 0
                    : _a.message
                ) {
                  throw Error(err.error.message);
                } else if (
                  (err === null || err === void 0 ? void 0 : err.error) ||
                  (err === null || err === void 0 ? void 0 : err.message)
                ) {
                  throw Error(err.error || err.message);
                }
              });
            }
          })
        )
        .catch((error) => {
          if (typeof error === "string") throw Error(error);
          if (
            (error === null || error === void 0 ? void 0 : error.cause) ||
            (error === null || error === void 0 ? void 0 : error.message)
          ) {
            throw Error(error.cause || error.message);
          }
          throw Error(error);
        });
    });
  }
  get(url, headers) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.request("GET", url, null, headers);
    });
  }
  post(url, data, headers) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.request("POST", url, data, headers);
    });
  }
}
exports.default = HTTPClient;
//# sourceMappingURL=httpclient.js.map
