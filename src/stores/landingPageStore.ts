import { create } from 'zustand';

export interface LandingPage {
  _id: string;
  course_id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  page_1_content: Record<string, any>; // Step 1: User Info Form
  page_2_content: Record<string, any>; // Step 2: Sales Page
  page_3_content: Record<string, any>; // Step 3: Payment Page
  page_content: Record<string, any>; // Legacy field
  form_fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  payment_config: {
    sepay_account_number?: string;
    sepay_account_name?: string;
    sepay_bank_name?: string;
    sepay_bank_code?: string;
  };
  email_template: string;
  metadata: {
    primary_color?: string;
    button_text?: string;
    success_message?: string;
  };
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

interface LandingPageState {
  currentLandingPage: LandingPage | null;
  setCurrentLandingPage: (landingPage: LandingPage | null) => void;
  clearCurrentLandingPage: () => void;
}

export const useLandingPageStore = create<LandingPageState>()((set) => ({
  currentLandingPage: null,
  setCurrentLandingPage: (landingPage) => set({ currentLandingPage: landingPage }),
  clearCurrentLandingPage: () => set({ currentLandingPage: null }),
}));
