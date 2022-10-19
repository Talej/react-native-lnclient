"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLN = exports.Eclair = exports.LND = void 0;
var lnd_1 = require("./lnd");
Object.defineProperty(exports, "LND", {
  enumerable: true,
  get: function () {
    return lnd_1.LND;
  },
});
var eclair_1 = require("./eclair");
Object.defineProperty(exports, "Eclair", {
  enumerable: true,
  get: function () {
    return eclair_1.Eclair;
  },
});
var coreLightning_1 = require("./coreLightning");
Object.defineProperty(exports, "CLN", {
  enumerable: true,
  get: function () {
    return coreLightning_1.CLN;
  },
});
//# sourceMappingURL=index.js.map
