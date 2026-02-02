import apiClient from "./client";
import type { LandingPage } from "../stores/landingPageStore";

export interface CreateLandingPageInput {
  resource_type?: "course" | "book" | "indicator";
  course_id?: string;
  book_id?: string;
  indicator_id?: string;
  title: string;
  slug: string;
  status?: "draft" | "published";
  page_content?: Record<string, any>;
  form_fields?: Array<{
    name: string;
    label: string;
    type: "text" | "email" | "tel" | "textarea" | "select";
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

export interface SubmitUserFormInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  birthday?: string;
  traffic_source?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    landing_page?: string;
    referrer?: string;
    first_visit_at?: string;
    session_id?: string;
  };
  session_id?: string;
  referral_code?: string;
}

export interface SubmitUserFormResponse {
  success: boolean;
  message: string;
  submission_id: string;
}

// Create landing page
export const createLandingPage = async (
  data: CreateLandingPageInput,
): Promise<LandingPage> => {
  const response = await apiClient.post("/landing-pages", data);
  return response.data;
};

// Get all landing pages
export const getLandingPages = async (params?: {
  page?: number;
  limit?: number;
  course_id?: string;
  book_id?: string;
  indicator_id?: string;
  status?: string;
}): Promise<LandingPageListResponse> => {
  const response = await apiClient.get("/landing-pages", { params });
  return response.data;
};

// Get landing page by ID
export const getLandingPageById = async (id: string): Promise<LandingPage> => {
  const response = await apiClient.get(`/landing-pages/${id}`);
  return response.data;
};

// Get landing page by slug (public)
export const getLandingPageBySlug = async (
  slug: string,
): Promise<LandingPage> => {
  const response = await apiClient.get(`/landing-pages/slug/${slug}`);
  return response.data;
};

// Get landing pages by course ID
export const getLandingPagesByCourse = async (
  courseId: string,
): Promise<LandingPage[]> => {
  const response = await apiClient.get(`/landing-pages/course/${courseId}`);
  return response.data;
};

// Get single landing page by course ID (for checking if one exists)
export const getLandingPageByCourseId = async (
  courseId: string,
): Promise<LandingPage | null> => {
  try {
    const landingPages = await getLandingPagesByCourse(courseId);
    return landingPages.length > 0 ? landingPages[0] : null;
  } catch {
    return null;
  }
};

// Update landing page
export const updateLandingPage = async (
  id: string,
  data: UpdateLandingPageInput,
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
  await apiClient.delete("/landing-pages/bulk/delete", { data: { ids } });
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

// Submit user form
export const submitUserForm = async (
  slug: string,
  data: SubmitUserFormInput,
): Promise<SubmitUserFormResponse> => {
  const response = await apiClient.post(
    `/landing-pages/slug/${slug}/submit-form`,
    data,
  );
  return response.data;
};
