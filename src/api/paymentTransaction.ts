import apiClient from "./client";

export interface CreatePaymentTransactionDto {
  course_id: string;
  user_submission_id: string;
  course_price: number;
  coupon_code?: string;
}

export interface PaymentTransactionResponse {
  transaction_id: string;
  transfer_code: string;
  amount: number;
  course_price: number;
  fee: number;
  qr_code_url: string;
  bank_account: string;
  bank_code: string;
  status: string;
}

export interface PaymentTransactionDetails extends PaymentTransactionResponse {
  paid_at?: string;
  created_at: string;
}

/**
 * Create a new payment transaction
 */
export const createPaymentTransaction = async (
  data: CreatePaymentTransactionDto,
): Promise<PaymentTransactionResponse> => {
  const response = await apiClient.post("/payment/transaction", data);
  return response.data;
};

/**
 * Get payment transaction by ID
 */
export const getPaymentTransaction = async (
  transactionId: string,
): Promise<PaymentTransactionDetails> => {
  const response = await apiClient.get(`/payment/transaction/${transactionId}`);
  return response.data;
};
