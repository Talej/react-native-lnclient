/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.ts?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
