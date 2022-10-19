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
const fetch = (url, init) =>
  Promise.resolve()
    .then(() => __importStar(require("node-fetch")))
    .then(({ default: fetch }) => fetch(url, init));
class RESTClient {
  constructor(host, agent) {
    this.host = host;
    this.agent = agent;
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
    return url.href;
  }
  request(method, uri, args) {
    return __awaiter(this, void 0, void 0, function* () {
      const headers = this.signRequest();
      const options = {
        method,
        headers,
        body:
          method === "POST" && args
            ? headers["Content-Type"] == "application/json"
              ? JSON.stringify(args)
              : Object.entries(args)
                  .map(
                    ([key, value]) =>
                      encodeURIComponent(key) + "=" + encodeURIComponent(value)
                  )
                  .join("&")
            : null,
      };
      if (this.agent) options.agent = this.agent;
      return yield fetch(
        this.url(uri, method === "GET" ? args : undefined),
        options
      )
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
              return response
                .json()
                .then((err) => {
                  if (err.error.message) {
                    throw Error(err.error.message);
                  } else if (err.error || err.message) {
                    throw Error(err.error || err.message);
                  }
                })
                .catch((e) => {
                  if (typeof e === "string") throw Error(e);
                  throw Error(response.statusText);
                });
            }
          })
        )
        .catch((error) => {
          if (error.cause || error.message) {
            throw Error(error.cause || error.message);
          }
          if (typeof error === "string") throw Error(error);
          throw Error(error);
        });
    });
  }
  getRequest(uri, args) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.request("GET", uri, args);
    });
  }
  postRequest(uri, args) {
    return __awaiter(this, void 0, void 0, function* () {
      return this.request("POST", uri, args);
    });
  }
  isBase64(s) {
    return s === Buffer.from(s, "base64").toString("base64");
  }
}
exports.default = RESTClient;
//# sourceMappingURL=restclient.js.map
