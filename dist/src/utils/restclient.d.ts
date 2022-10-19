/// <reference types="node" />
import https from "https";
export default class RESTClient {
  host: string;
  agent: https.Agent;
  constructor(host: string, agent?: https.Agent);
  signRequest(): {};
  url(uri: string, args?: object): string;
  request(method: "GET" | "POST", uri: string, args?: object): Promise<any>;
  getRequest(uri: string, args?: object): Promise<any>;
  postRequest(uri: string, args?: object): Promise<any>;
  isBase64(s: string): boolean;
}
