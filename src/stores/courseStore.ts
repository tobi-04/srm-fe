import { create } from 'zustand';

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  status: "draft" | "published";
  slug: string;
  category: string;
  syllabus: string[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

interface CourseState {
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;
  clearCurrentCourse: () => void;
}

export const useCourseStore = create<CourseState>()((set) => ({
  currentCourse: null,
  setCurrentCourse: (course) => set({ currentCourse: course }),
  clearCurrentCourse: () => set({ currentCourse: null }),
}));
