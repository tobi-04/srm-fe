import apiClient from "./client";

export interface Payment {
  _id: string;
  user_submission_id: string;
  landing_page_id: string;
  course_price: number;
  fee: number;
  total_amount: number;
  qr_code_url?: string;
  bank_account: string;
  bank_code: string;
  transfer_content: string;
  status: "pending" | "completed" | "failed" | "expired";
  paid_at?: string;
  sepay_transaction_id?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentInput {
  user_submission_id: string;
  landing_page_id: string;
  course_price: number;
}

// Create payment
export const createPayment = async (
  data: CreatePaymentInput
): Promise<Payment> => {
  const response = await apiClient.post("/payment", data);
  return response.data;
};

// Get payment by ID
export const getPaymentById = async (paymentId: string): Promise<Payment> => {
  const response = await apiClient.get(`/payment/${paymentId}`);
  return response.data;
};

// Get payments by user submission
export const getPaymentsByUserSubmission = async (
  userSubmissionId: string
): Promise<Payment[]> => {
  const response = await apiClient.get(
    `/payment/user-submission/${userSubmissionId}`
  );
  return response.data;
};
