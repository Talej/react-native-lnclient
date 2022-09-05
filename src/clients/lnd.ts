import https from "https";
import { RequestInfo, RequestInit } from "node-fetch";
const fetch = (url: RequestInfo, init?: RequestInit) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

import {
  configProps,
  getInvoicesProps,
  createInvoiceProps,
  getPaymentsProps,
  sendPaymentProps,
} from "../types";

export const lnd = (config: configProps) => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const signRequest = () => {
    return {
      "Content-Type": "application/json",
      "Grpc-Metadata-macaroon": config.macroon,
    };
  };

  const url = (uri: string, args?: object) => {
    const url = new URL(config.host + uri);
    if (args) {
      Object.entries(args).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    return url.href;
  };

  const request = async (
    method: "GET" | "POST",
    uri: string,
    args?: object
  ) => {
    const headers = signRequest();

    return await fetch(url(uri, method == "GET" ? args : undefined), {
      method,
      headers,
      agent,
      body: method == "POST" ? JSON.stringify(args) : null,
    })
      .then(async (response) => {
        if (response.status < 300) {
          const data = await response.text();
          if (data.includes("\n")) {
            const parts = data.split("\n");
            return JSON.parse(parts[parts.length - 2]); // get the last response and parse it
          }

          return JSON.parse(data);
        } else {
          return response
            .json()
            .then((err) => {
              if (err.error.message) {
                throw "Error: " + err.error.message;
              } else if (err.error || err.message) {
                throw "Error: " + (err.error || err.message);
              }
            })
            .catch((e) => {
              if (typeof e == "string") throw "str: " + e;
              throw response.statusText;
            });
        }
      })
      .catch((error) => {
        if (error.cause || error.message)
          throw "Error: " + (error.cause || error.message);
        if (typeof error == "string") throw "Error: " + error;
        throw error;
      });
  };

  const getRequest = async (uri: string, args?: object) => {
    return request("GET", uri, args);
  };

  const postRequest = async (uri: string, args?: object) => {
    return request("POST", uri, args);
  };

  const isBase64 = (s: string) => {
    return s == Buffer.from(s, "base64").toString("base64");
  };

  const getInfo = async () => {
    return getRequest("/v1/getinfo");
  };

  const getInvoices = async (props?: getInvoicesProps) => {
    return getRequest("/v1/invoices", props);
  };

  const getInvoice = async (r_hash: string) => {
    const d = isBase64(r_hash)
      ? Buffer.from(r_hash, "base64").toString("hex")
      : r_hash;

    return getRequest(`/v1/invoice/${d}`);
  };

  const createInvoice = async (props: createInvoiceProps) => {
    return postRequest("/v1/invoices", props);
  };

  const subscribeInvoice = async (r_hash: string) => {
    return getRequest(`/v2/invoices/subscribe/${r_hash}`);
  };

  const getPayments = async (props?: getPaymentsProps) => {
    return getRequest("/v1/payments", props);
  };

  const getPayment = async (payment_hash: string) => {
    const d = Buffer.from(payment_hash, "hex").toString("base64");

    return getRequest(`/v2/router/track/${d}`);
  };

  const sendPayment = async (props: sendPaymentProps) => {
    if (!props.timeout_seconds) props.timeout_seconds = 30;

    return postRequest("/v2/router/send", props);
  };

  return {
    getInfo,
    getInvoices,
    getInvoice,
    createInvoice,
    subscribeInvoice,
    getPayments,
    getPayment,
    sendPayment,
  };
};
