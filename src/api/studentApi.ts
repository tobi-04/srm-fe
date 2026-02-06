import apiClient from "./client";

// ========== Types ==========
export interface StudentCourse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  price: number;
  enrolled_at: Date;
  progress_percent: number;
  total_lessons: number;
  completed_lessons: number;
  is_completed: boolean;
  last_accessed_at?: Date;
}

export interface StudentDashboard {
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  recent_courses: StudentCourse[];
  stats: {
    total_courses: number;
    in_progress_courses: number;
    completed_courses: number;
    total_lessons_completed: number;
  };
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    created_at: Date;
  }>;
}

export interface StudentCoursesResponse {
  data: StudentCourse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StudentLesson {
  _id: string;
  title: string;
  description: string;
  order: number;
  video_url?: string;
  video_duration?: number;
  is_locked: boolean;
  is_completed: boolean;
  progress_percent: number;
}

export interface StudentCourseDetail {
  _id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  enrolled_at: Date;
  progress_percent: number;
  lessons: StudentLesson[];
}

// ========== API Functions ==========

/**
 * Get student dashboard overview
 */
export const getDashboard = async (): Promise<StudentDashboard> => {
  const response = await apiClient.get("/student/dashboard/overview");
  return response.data;
};

/**
 * Get enrolled courses with pagination
 */
export const getCourses = async (params?: {
  page?: number;
  limit?: number;
  status?: "all" | "in_progress" | "completed";
}): Promise<StudentCoursesResponse> => {
  const response = await apiClient.get("/student/courses", { params });
  return response.data;
};

/**
 * Get course detail with lessons
 */
export const getCourseDetail = async (
  slug: string,
): Promise<StudentCourseDetail> => {
  const response = await apiClient.get(`/student/course/${slug}`);
  return response.data;
};

/**
 * Get course lessons
 */
export const getCourseLessons = async (
  slug: string,
): Promise<StudentLesson[]> => {
  const detail = await getCourseDetail(slug);
  return detail.lessons;
};

/**
 * Get lesson detail
 */
export const getLesson = async (_id: string): Promise<StudentLesson> => {
  // This would typically be a separate endpoint
  // For now, we'll throw an error
  throw new Error("getLesson not yet implemented");
};

/**
 * Get student profile
 */
export const getProfile = async (): Promise<any> => {
  const response = await apiClient.get("/student/profile");
  return response.data;
};

/**
 * Update student profile
 */
export const updateProfile = async (data: {
  name?: string;
  phone?: string;
  avatar?: string;
}): Promise<any> => {
  const response = await apiClient.put("/student/profile", data);
  return response.data;
};

/**
 * Get order history
 */
export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<any> => {
  const response = await apiClient.get("/student/orders", { params });
  return response.data;
};

export const studentApi = {
  getDashboard,
  getCourses,
  getCourseDetail,
  getCourseLessons,
  getLesson,
  getProfile,
  updateProfile,
  getOrders,
};
