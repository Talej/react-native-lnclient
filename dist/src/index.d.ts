import * as types from "./types";
declare const APIClient: {
  getNodeType: (type: string) => types.nodeTypes;
  get: (config: types.configProps) => any;
};
export default APIClient;
