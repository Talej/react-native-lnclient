import RESTClient from "../utils/restclient";
import {
  NodeClient,
  configProps,
  getInvoicesProps,
  createInvoiceProps,
  getPaymentsProps,
  sendPaymentProps,
} from "../types";
export declare class LND extends RESTClient implements NodeClient {
  config: configProps;
  constructor(config: configProps);
  signRequest(): {
    "Content-Type": string;
    "Grpc-Metadata-macaroon": string;
  };
  getInfo(): Promise<any>;
  getInvoices(props?: getInvoicesProps): Promise<any>;
  getInvoice(rHash: string): Promise<any>;
  createInvoice(props: createInvoiceProps): Promise<any>;
  subscribeInvoice(rHash: string): Promise<any>;
  getPayments(props?: getPaymentsProps): Promise<any>;
  getPayment(paymentHash: string): Promise<any>;
  sendPayment(props: sendPaymentProps): Promise<any>;
}
