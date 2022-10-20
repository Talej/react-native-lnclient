import { configProps } from "../types";
import httpClient from "./httpclient";
export default class RESTClient {
  config: configProps;
  host: string;
  client: httpClient;
  constructor(config: configProps);
  signRequest(): {};
  url(uri: string, args?: object): string;
  getRequest(uri: string, args?: object): Promise<any>;
  postRequest(uri: string, args?: object): Promise<any>;
  isBase64(s: string): boolean;
}
