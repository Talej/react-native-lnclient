import RESTClient from "../utils/restclient";
import {
  NodeClient,
  configProps,
  getInvoicesProps,
  createInvoiceProps,
  getPaymentsProps,
  sendPaymentProps,
  estimateFeeProps,
} from "../types";
export declare class CLN extends RESTClient implements NodeClient {
  config: configProps;
  signRequest(): {
    "Content-Type": string;
    macaroon: string;
    encodingtype: string;
  };
  getInfo(): Promise<any>;
  getInvoices(props?: getInvoicesProps): Promise<any>;
  getInvoice(label: string): Promise<any>;
  createInvoice(props: createInvoiceProps): Promise<any>;
  subscribeInvoice(rHash: string): Promise<any>;
  getPayments(props?: getPaymentsProps): Promise<any>;
  getPayment(paymentRequest: string): Promise<any>;
  sendPayment(props: sendPaymentProps): Promise<any>;
  estimateFee(props: estimateFeeProps): Promise<{
    fee_sats: number;
  }>;
}
