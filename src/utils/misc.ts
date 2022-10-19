import { LooseObject, KeyMap } from '../types'

export const toString = (n) => Number(n).toString()

export const mapKeys = (obj: LooseObject, keyMap: KeyMap) => {
  const cb = (key: string, m: KeyMap) =>
    (Array.isArray(m[key]) ? m[key][0] : m[key]) || key

  return Object.keys(obj).reduce((acc, k) => {
    acc[cb(k, keyMap)] = Array.isArray(keyMap[k])
      ? keyMap[k][1](obj[k])
      : obj[k]
    return acc
  }, {})
}
