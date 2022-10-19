"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapKeys = exports.toString = void 0;
const toString = (n) => Number(n).toString();
exports.toString = toString;
const mapKeys = (obj, keyMap) => {
  const cb = (key, m) => (Array.isArray(m[key]) ? m[key][0] : m[key]) || key;
  return Object.keys(obj).reduce((acc, k) => {
    acc[cb(k, keyMap)] = Array.isArray(keyMap[k])
      ? keyMap[k][1](obj[k])
      : obj[k];
    return acc;
  }, {});
};
exports.mapKeys = mapKeys;
//# sourceMappingURL=misc.js.map
