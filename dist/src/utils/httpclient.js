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
const react_native_tor_1 = __importDefault(require("react-native-tor"));
let tor = null;
try {
  tor = (0, react_native_tor_1.default)();
} catch (e) {}
class HTTPClient {
  constructor(config) {
    this.config = config;
    if (
      (config === null || config === void 0 ? void 0 : config.useTor) &&
      tor
    ) {
      this.tor = tor;
    } else if (
      !(config === null || config === void 0 ? void 0 : config.useFetch)
    ) {
      this.blobUtil = require("react-native-blob-util").default;
    }
  }
  request(method, url, data, headers) {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.config.proxy) {
        headers["X-Proxy-Target-URL"] = url;
        if (this.config.proxyAuth) {
          headers["X-Proxy-Auth"] = this.config.proxyAuth;
        }
        url = this.config.proxy;
      }
      if (this.tor) {
        try {
          yield this.tor.startIfNotStarted();
          if (method === "GET") {
            const response = yield this.tor.get(
              url,
              headers,
              this.config.noVerifySSL
            );
            if (response.json) {
              return response.json;
            }
          } else if (method === "POST") {
            const response = yield this.tor.post(
              url,
              headers["Content-Type"] === "application/json"
                ? JSON.stringify(data)
                : data,
              headers,
              this.config.noVerifySSL
            );
            if (response.json) {
              return response.json;
            }
          }
        } catch (e) {
          this.tor.stopIfRunning();
        }
        return false;
      } else if (this.blobUtil) {
        return yield this.blobUtil
          .config({ trusty: this.config.noVerifySSL })
          .fetch(
            method,
            url,
            headers,
            headers["Content-Type"] === "application/json"
              ? JSON.stringify(data)
              : data
          )
          .then((response) =>
            __awaiter(this, void 0, void 0, function* () {
              if (response.respInfo.status < 300) {
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
                    (_a =
                      err === null || err === void 0 ? void 0 : err.error) ===
                      null || _a === void 0
                      ? void 0
                      : _a.message
                  ) {
                    throw Error(err.error.message);
                  } else if (err.error || err.message) {
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
      } else {
        const opts = {
          method,
          headers,
          body:
            method === "POST" && data
              ? headers["Content-Type"] === "application/json"
                ? JSON.stringify(data)
                : Object.entries(data)
                    .map(
                      ([key, value]) =>
                        encodeURIComponent(key) +
                        "=" +
                        encodeURIComponent(value)
                    )
                    .join("&")
              : null,
        };
        return yield fetch(url, opts)
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
                    (_a =
                      err === null || err === void 0 ? void 0 : err.error) ===
                      null || _a === void 0
                      ? void 0
                      : _a.message
                  ) {
                    throw Error(err.error.message);
                  } else if (err.error || err.message) {
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
      }
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
