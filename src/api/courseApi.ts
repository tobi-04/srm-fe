import apiClient from "./client";

export interface Course {
  _id: string;
  title: string;
  description: string;
  slug: string;
  thumbnail?: string;
  price: number;
  instructor?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  lesson_count?: number;
  category?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CoursesResponse {
  data: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const courseApi = {
  getCourses: async (params: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: CoursesResponse }> => {
    const response = await apiClient.get("/courses", {
      params: {
        ...params,
        status: "published",
      },
    });

    return {
      data: response.data,
    };
  },

  getCourseBySlug: async (slug: string): Promise<{ data: Course }> => {
    const response = await apiClient.get(`/landing-pages/slug/${slug}`);
    return response;
  },
};
