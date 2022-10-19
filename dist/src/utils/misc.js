"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapKeys = void 0;
const mapKeys = (obj, keyMap) => {
  const cb = (key, m) => m[key] || key;
  return Object.keys(obj).reduce((acc, k) => {
    acc[cb(k, keyMap)] = obj[k];
    return acc;
  }, {});
};
exports.mapKeys = mapKeys;
//# sourceMappingURL=misc.js.map
