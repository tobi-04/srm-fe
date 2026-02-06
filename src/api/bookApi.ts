import client from "./client";

export interface Book {
  _id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  price: number;
  discount_percentage: number;
  status: string;
  created_at: string;
}

export interface BookFile {
  _id: string;
  book_id: string;
  file_path: string;
  file_type: string;
  file_size: number;
}

export interface BookDetail extends Book {
  files: BookFile[];
}

export interface CreateBookOrderDto {
  book_id: string;
  name: string;
  email: string;
  phone?: string;
  coupon_code?: string;
}

export interface OrderResponse {
  order_id: string;
  qr_code_url: string;
  transfer_code: string;
  amount: number;
  bank: {
    acc_no: string;
    bank_id: string;
    bank_name: string;
    acc_name: string;
  };
  is_new_user: boolean;
  email: string;
}

export const bookApi = {
  // Public
  getBooks: (params: any) => client.get("/books", { params }),
  getBookBySlug: (slug: string) => client.get(`/books/${slug}`),
  getMyBooks: () => client.get("/books/my-books"),
  checkout: (data: CreateBookOrderDto) =>
    client.post<OrderResponse>("/books/checkout", data),
  getOrderStatus: (id: string) => client.get(`/books/order-status/${id}`),
  cancelOrder: (id: string) => client.delete(`/books/order/${id}`),
  getDownloadUrl: (bookId: string, fileId: string) =>
    client.get(`/books/${bookId}/download/${fileId}`),

  // Admin
  adminGetBooks: (params: any) => client.get("/admin/books", { params }),
  adminGetById: (id: string) => client.get(`/admin/books/${id}`),
  adminCreateBook: (data: any) => {
    const headers =
      data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    return client.post("/admin/books", data, { headers });
  },
  adminUpdateBook: (id: string, data: any) => {
    const headers =
      data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
    return client.put(`/admin/books/${id}`, data, { headers });
  },
  adminDeleteBook: (id: string) => client.delete(`/admin/books/${id}`),
  adminUploadFile: (id: string, formData: FormData) =>
    client.post(`/admin/books/${id}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  adminDeleteFile: (fileId: string) =>
    client.delete(`/admin/books/files/${fileId}`),
};

export const couponApi = {
  adminGetCoupons: (params: any) =>
    client.get("/admin/books/coupons", { params }),
  adminCreateCoupon: (data: any) => client.post("/admin/books/coupons", data),
  adminUpdateCoupon: (id: string, data: any) =>
    client.put(`/admin/books/coupons/${id}`, data),
  adminDeleteCoupon: (id: string) =>
    client.delete(`/admin/books/coupons/${id}`),
};
