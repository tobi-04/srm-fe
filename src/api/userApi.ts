import apiClient from "./client";

export interface Student {
  _id: string;
  name: string;
  email: string;
  is_active: boolean;
  has_enrollment: boolean;
  created_at: string;
}

export interface Saler {
  _id: string;
  name: string;
  email: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateSalerDto {
  email: string;
  name: string;
  password: string;
}

export const userApi = {
  /**
   * Get students with enrollment status
   */
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Student>> {
    const response = await apiClient.get("/users/students", { params });
    return response.data;
  },

  /**
   * Get salers
   */
  async getSalers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Saler>> {
    const response = await apiClient.get("/users/salers", { params });
    return response.data;
  },

  /**
   * Create a new saler account
   */
  async createSaler(dto: CreateSalerDto): Promise<Saler> {
    const response = await apiClient.post("/users/salers", dto);
    return response.data;
  },

  /**
   * Delete a user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Update a user
   */
  async updateUser(
    id: string,
    data: Partial<{ name: string; email: string; is_active: boolean }>
  ): Promise<any> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Toggle user active status (lock/unlock)
   */
  async toggleActive(id: string): Promise<any> {
    const response = await apiClient.patch(`/users/${id}/toggle-active`);
    return response.data;
  },

  /**
   * Lock multiple users
   */
  async lockMany(
    ids: string[]
  ): Promise<{ message: string; modifiedCount: number }> {
    const response = await apiClient.patch("/users/bulk/lock", { ids });
    return response.data;
  },

  /**
   * Unlock multiple users
   */
  async unlockMany(
    ids: string[]
  ): Promise<{ message: string; modifiedCount: number }> {
    const response = await apiClient.patch("/users/bulk/unlock", { ids });
    return response.data;
  },

  /**
   * Hard delete a single user (permanent)
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/users/${id}/hard`);
    return response.data;
  },

  /**
   * Hard delete multiple users (permanent)
   */
  async hardDeleteMany(
    ids: string[]
  ): Promise<{ message: string; deletedCount: number }> {
    const response = await apiClient.delete("/users/bulk/hard", {
      data: { ids },
    });
    return response.data;
  },
};
