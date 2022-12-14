import { LooseObject } from "../types";
declare type ConfigProps =
  | {
      noVerifySSL?: boolean;
      useFetch?: boolean;
      useTor?: boolean;
      proxy?: string;
      proxyAuth?: string;
    }
  | undefined;
export default class HTTPClient {
  config: ConfigProps;
  blobUtil: any;
  tor: any;
  constructor(config: ConfigProps);
  request(
    method: "GET" | "POST",
    url: string,
    data?: LooseObject,
    headers?: LooseObject
  ): Promise<any>;
  get(url: string, headers?: LooseObject): Promise<any>;
  post(url: string, data?: LooseObject, headers?: LooseObject): Promise<any>;
}
export {};
