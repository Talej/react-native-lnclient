export const NODETYPE_LND = "lnd";

export type configProps = {
  nodeType: typeof NODETYPE_LND;
  host: string;
  macroon?: string;
  apiKet?: string;
};

export type getInvoicesProps = {
  pending_only?: boolean;
  index_offset?: string;
  num_max_invoices?: string;
  reversed?: boolean;
};

export type createInvoiceProps = {
  value: number;
  memo?: string;
  description_hash?: string;
};

export type getPaymentsProps = {
  include_incomplete?: boolean;
  index_offset?: string;
  max_payments?: string;
  reversed?: boolean;
  count_total_payments?: boolean;
};

type sendPaymentPRType = {
  payment_request: string;
  amt?: number;
};

type sendPaymentNoPRType = {
  amt: number;
  dest: string;
  payment_hash: string;
};

type sendPaymentAnyType = {
  timeout_seconds?: number;
  allow_self_payment?: boolean;
};

export type sendPaymentProps = (sendPaymentPRType | sendPaymentNoPRType) &
  sendPaymentAnyType;
