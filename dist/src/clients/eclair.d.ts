import RESTClient from "../utils/restclient";
import {
  NodeClient,
  configProps,
  getInvoicesProps,
  createInvoiceProps,
  getPaymentsProps,
  sendPaymentProps,
} from "../types";
export declare class Eclair extends RESTClient implements NodeClient {
  config: configProps;
  constructor(config: configProps);
  signRequest(): {
    "Content-Type": string;
    Authorization: string;
  };
  getInfo(): Promise<any>;
  getInvoices(props?: getInvoicesProps): Promise<any>;
  getInvoice(paymentHash: string): Promise<any>;
  createInvoice(props: createInvoiceProps): Promise<any>;
  subscribeInvoice(rHash: string): Promise<void>;
  getPayments(props?: getPaymentsProps): Promise<any>;
  getPayment(paymentHash: string): Promise<any>;
  sendPayment(props: sendPaymentProps): Promise<any>;
}
