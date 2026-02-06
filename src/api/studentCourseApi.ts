import apiClient from "./client";

export interface LessonProgressData {
  status: "not_started" | "in_progress" | "completed";
  watch_time: number;
  last_position: number;
  duration?: number;
  progress_percent?: number;
  watched_segments?: { start: number; end: number }[];
}

export interface LessonFile {
  _id: string;
  name: string;
  url: string;
  mime: string;
  size: number;
}

export interface LessonWithProgress {
  _id: string;
  title: string;
  description: string;
  video?: string;
  order: number;
  chapter_index?: number;
  status: string;
  is_locked?: boolean;
  progress: LessonProgressData;
}

export interface CourseProgressSummary {
  completed: number;
  inProgress: number;
  notStarted: number;
  percentComplete: number;
}

export interface EnrolledCourse {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  totalLessons: number;
  progress: CourseProgressSummary;
}

export interface StudentCourse {
  _id: string;
  title: string;
  description: string;
  slug: string;
  category: string;
  syllabus: string[];
  lessons: LessonWithProgress[];
  totalLessons: number;
  progress: CourseProgressSummary;
  autoResumeLessonId?: string;
}

export interface LessonNavigation {
  prev: { _id: string; title: string } | null;
  next: { _id: string; title: string } | null;
  currentIndex: number;
  total: number;
}

export interface LessonDetail {
  _id: string;
  title: string;
  description: string;
  main_content: string[];
  video?: string;
  order: number;
  chapter_index?: number;
  files: LessonFile[];
  progress: LessonProgressData;
  navigation: LessonNavigation;
}

export const studentCourseApi = {
  /**
   * Get all enrolled courses
   */
  async getEnrolledCourses(): Promise<EnrolledCourse[]> {
    const response = await apiClient.get("/student/courses");
    return response.data;
  },

  /**
   * Get course details with progress
   */
  async getCourse(courseId: string): Promise<StudentCourse> {
    const response = await apiClient.get(`/student/courses/${courseId}`);
    return response.data;
  },

  /**
   * Get lesson details
   */
  async getLesson(courseId: string, lessonId: string): Promise<LessonDetail> {
    const response = await apiClient.get(
      `/student/courses/${courseId}/lessons/${lessonId}`,
    );
    return response.data;
  },

  /**
   * Update lesson progress
   */
  async updateProgress(
    courseId: string,
    lessonId: string,
    data: {
      watch_time?: number;
      last_position?: number;
      duration?: number;
      watched_segments?: { start: number; end: number }[];
      completed?: boolean;
    },
  ): Promise<LessonProgressData> {
    const response = await apiClient.patch(
      `/student/courses/${courseId}/lessons/${lessonId}/progress`,
      data,
    );
    return response.data;
  },

  /**
   * Get course progress summary
   */
  async getProgress(courseId: string): Promise<CourseProgressSummary> {
    const response = await apiClient.get(
      `/student/courses/${courseId}/progress`,
    );
    return response.data;
  },

  /**
   * Discussion (Comments & Reactions)
   */
  async getComments(lessonId: string): Promise<any[]> {
    const response = await apiClient.get(`/lessons/${lessonId}/comments`);
    return response.data;
  },

  async createComment(
    lessonId: string,
    data: { content: string; replied_to?: string },
  ) {
    const response = await apiClient.post(`/lessons/${lessonId}/comments`, {
      ...data,
      lesson_id: lessonId,
    });
    return response.data;
  },

  async updateComment(
    lessonId: string,
    commentId: string,
    data: { content: string },
  ) {
    const response = await apiClient.put(
      `/lessons/${lessonId}/comments/${commentId}`,
      data,
    );
    return response.data;
  },

  async deleteComment(lessonId: string, commentId: string) {
    const response = await apiClient.delete(
      `/lessons/${lessonId}/comments/${commentId}`,
    );
    return response.data;
  },

  async addReaction(lessonId: string, commentId: string, type: string) {
    const response = await apiClient.post(
      `/lessons/${lessonId}/comments/${commentId}/reactions`,
      { type },
    );
    return response.data;
  },

  async removeReaction(lessonId: string, commentId: string) {
    const response = await apiClient.delete(
      `/lessons/${lessonId}/comments/${commentId}/reactions`,
    );
    return response.data;
  },

  /**
   * Personal Notes
   */
  async getNotes(lessonId: string): Promise<any[]> {
    const response = await apiClient.get(`/lessons/${lessonId}/notes`);
    return response.data;
  },

  async createNote(lessonId: string, data: { content: string }) {
    const response = await apiClient.post(`/lessons/${lessonId}/notes`, {
      ...data,
      lesson_id: lessonId,
    });
    return response.data;
  },

  async updateNote(
    lessonId: string,
    noteId: string,
    data: { content: string },
  ) {
    const response = await apiClient.put(
      `/lessons/${lessonId}/notes/${noteId}`,
      data,
    );
    return response.data;
  },

  async deleteNote(lessonId: string, noteId: string) {
    const response = await apiClient.delete(
      `/lessons/${lessonId}/notes/${noteId}`,
    );
    return response.data;
  },
};
