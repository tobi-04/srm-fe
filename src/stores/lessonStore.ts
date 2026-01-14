import { create } from 'zustand';

interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  main_content: string[];
  video: string;
  status: 'draft' | 'published';
  order: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

interface LessonState {
  currentLesson: Lesson | null;
  lessons: Lesson[];
  setCurrentLesson: (lesson: Lesson | null) => void;
  setLessons: (lessons: Lesson[]) => void;
  addLesson: (lesson: Lesson) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  removeLesson: (id: string) => void;
  clearLessons: () => void;
}

export const useLessonStore = create<LessonState>()((set) => ({
  currentLesson: null,
  lessons: [],
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  setLessons: (lessons) => set({ lessons }),
  addLesson: (lesson) => set((state) => ({ lessons: [...state.lessons, lesson] })),
  updateLesson: (id, updates) =>
    set((state) => ({
      lessons: state.lessons.map((l) => (l._id === id ? { ...l, ...updates } : l)),
    })),
  removeLesson: (id) =>
    set((state) => ({
      lessons: state.lessons.filter((l) => l._id !== id),
    })),
  clearLessons: () => set({ lessons: [], currentLesson: null }),
}));
