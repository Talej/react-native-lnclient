import { LooseObject } from "../types";
declare type ConfigProps =
  | {
      noVerifySSL?: boolean;
    }
  | undefined;
export default class HTTPClient {
  config: ConfigProps;
  constructor(config: ConfigProps);
  request(
    method: "GET" | "POST",
    url: string,
    data?: object,
    headers?: LooseObject
  ): Promise<any>;
  get(url: string, headers?: LooseObject): Promise<any>;
  post(url: string, data?: LooseObject, headers?: LooseObject): Promise<any>;
}
export {};
