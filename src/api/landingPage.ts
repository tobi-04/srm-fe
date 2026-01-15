import apiClient from './client';
import type { LandingPage } from '../stores/landingPageStore';

export interface CreateLandingPageInput {
  course_id: string;
  title: string;
  slug: string;
  status?: 'draft' | 'published';
  page_content?: Record<string, any>;
  form_fields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  payment_config?: {
    sepay_account_number?: string;
    sepay_account_name?: string;
    sepay_bank_name?: string;
    sepay_bank_code?: string;
  };
  email_template?: string;
  metadata?: {
    primary_color?: string;
    button_text?: string;
    success_message?: string;
  };
}

export interface UpdateLandingPageInput extends Partial<CreateLandingPageInput> {}

export interface LandingPageListResponse {
  data: LandingPage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Create landing page
export const createLandingPage = async (
  data: CreateLandingPageInput
): Promise<LandingPage> => {
  const response = await apiClient.post('/landing-pages', data);
  return response.data;
};

// Get all landing pages
export const getLandingPages = async (params?: {
  page?: number;
  limit?: number;
  course_id?: string;
  status?: string;
}): Promise<LandingPageListResponse> => {
  const response = await apiClient.get('/landing-pages', { params });
  return response.data;
};

// Get landing page by ID
export const getLandingPageById = async (id: string): Promise<LandingPage> => {
  const response = await apiClient.get(`/landing-pages/${id}`);
  return response.data;
};

// Get landing page by slug (public)
export const getLandingPageBySlug = async (slug: string): Promise<LandingPage> => {
  const response = await apiClient.get(`/landing-pages/slug/${slug}`);
  return response.data;
};

// Get landing pages by course ID
export const getLandingPagesByCourse = async (courseId: string): Promise<LandingPage[]> => {
  const response = await apiClient.get(`/landing-pages/course/${courseId}`);
  return response.data;
};

// Update landing page
export const updateLandingPage = async (
  id: string,
  data: UpdateLandingPageInput
): Promise<LandingPage> => {
  const response = await apiClient.put(`/landing-pages/${id}`, data);
  return response.data;
};

// Delete landing page (soft delete)
export const deleteLandingPage = async (id: string): Promise<void> => {
  await apiClient.delete(`/landing-pages/${id}`);
};

// Bulk delete landing pages
export const bulkDeleteLandingPages = async (ids: string[]): Promise<void> => {
  await apiClient.delete('/landing-pages/bulk/delete', { data: { ids } });
};

// Hard delete landing page
export const hardDeleteLandingPage = async (id: string): Promise<void> => {
  await apiClient.delete(`/landing-pages/${id}/hard`);
};

// Restore landing page
export const restoreLandingPage = async (id: string): Promise<LandingPage> => {
  const response = await apiClient.put(`/landing-pages/${id}/restore`);
  return response.data;
};
