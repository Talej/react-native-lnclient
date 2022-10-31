export type LooseObject = {
  [key: string]: any;
};

export type KeyMap = {
  [key: string]: any;
};

export const NODETYPE_LND = 'lnd'
export const NODETYPE_ECLAIR = 'eclair'
export const NODETYPE_CLN = 'cln'

export type nodeTypes =
  | typeof NODETYPE_LND
  | typeof NODETYPE_ECLAIR
  | typeof NODETYPE_CLN;

export type configProps = {
  nodeType: nodeTypes;
  host: string;
  noVerifySSL?: boolean;

  /* lnd props */
  macaroon?: string;

  /* eclair props */
  user?: string;
  pass?: string;

  /* if set to true use RN fetch, otherwise use blob util */
  useFetch?: boolean;
  proxy?: string;
  proxyAuth?: string;
};

export interface ResponseObject {
  [key: string]: any;
}

export type getInvoicesProps = {
  /* lnd props */
  pending_only?: boolean;
  index_offset?: string;
  num_max_invoices?: string;
  reversed?: boolean;

  /* eclair props */
  from?: number;
  to?: number;
};

export type createInvoiceProps = {
  value: number;
  memo?: string;
  description_hash?: string;
};

export type eclairCreateInvoiceProps = {
  amountMsat?: number;
  description?: string;
  descriptionHash?: string;
};

export type getPaymentsProps = {
  include_incomplete?: boolean;
  index_offset?: string;
  max_payments?: string;
  reversed?: boolean;
  count_total_payments?: boolean;
};

type sendPaymentType = {
  payment_request?: string;
  amt?: number;
  dest?: string;
  payment_hash?: string;
  timeout_seconds?: number;
  allow_self_payment?: boolean;
};

export type estimateFeeProps = {
  dest: string;
  amt_sat: number;
};

export type sendPaymentProps = sendPaymentType;

/* TODO: Define actual response formats for each method */
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
