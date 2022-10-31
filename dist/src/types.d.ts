export declare type LooseObject = {
  [key: string]: any;
};
export declare type KeyMap = {
  [key: string]: any;
};
export declare const NODETYPE_LND = "lnd";
export declare const NODETYPE_ECLAIR = "eclair";
export declare const NODETYPE_CLN = "cln";
export declare type nodeTypes =
  | typeof NODETYPE_LND
  | typeof NODETYPE_ECLAIR
  | typeof NODETYPE_CLN;
export declare type configProps = {
  nodeType: nodeTypes;
  host: string;
  noVerifySSL?: boolean;
  macaroon?: string;
  user?: string;
  pass?: string;
};
export interface ResponseObject {
  [key: string]: any;
}
export declare type getInvoicesProps = {
  pending_only?: boolean;
  index_offset?: string;
  num_max_invoices?: string;
  reversed?: boolean;
  from?: number;
  to?: number;
};
export declare type createInvoiceProps = {
  value: number;
  memo?: string;
  description_hash?: string;
};
export declare type eclairCreateInvoiceProps = {
  amountMsat?: number;
  description?: string;
  descriptionHash?: string;
};
export declare type getPaymentsProps = {
  include_incomplete?: boolean;
  index_offset?: string;
  max_payments?: string;
  reversed?: boolean;
  count_total_payments?: boolean;
};
declare type sendPaymentType = {
  payment_request?: string;
  amt?: number;
  dest?: string;
  payment_hash?: string;
  timeout_seconds?: number;
  allow_self_payment?: boolean;
};
export declare type estimateFeeProps = {
  dest: string;
  amt_sat: number;
};
export declare type sendPaymentProps = sendPaymentType;
export interface NodeClient {
  getInfo(): ResponseObject;
  getInvoices(props?: getInvoicesProps): ResponseObject;
  getInvoice(rHash: string): ResponseObject;
  createInvoice(props: createInvoiceProps): ResponseObject;
  subscribeInvoice(rHash: string): ResponseObject;
  getPayments(props?: getPaymentsProps): ResponseObject;
  getPayment(paymentHash: string): ResponseObject;
  sendPayment(props: sendPaymentProps): ResponseObject;
}
export {};
