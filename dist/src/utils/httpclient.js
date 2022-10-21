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
const react_native_blob_util_1 = __importDefault(
  require("react-native-blob-util")
);
class HTTPClient {
  constructor(config) {
    this.config = config;
  }
  request(method, url, data, headers) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield react_native_blob_util_1.default
        .config({ trusty: this.config.noVerifySSL })
        .fetch(method, url, headers, data)
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
                if (err.error.message) {
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
