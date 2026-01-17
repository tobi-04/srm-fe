import apiClient from "./client";

export interface EmailAutomation {
  _id: string;
  name: string;
  description?: string;
  trigger_type: "event" | "group";
  event_type?: string;
  target_group?:
    | "all_students"
    | "unpurchased_students"
    | "purchased_students"
    | "salers";
  schedule_type?: "once" | "recurring";
  cron_expression?: string;
  scheduled_at?: string;
  is_active: boolean;
  repeat_job_key?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAutomationStep {
  _id: string;
  automation_id: string;
  step_order: number;
  delay_minutes: number;
  subject_template: string;
  body_template: string;
}

export interface EmailLog {
  _id: string;
  user_id: any;
  automation_id: any;
  step_id: string;
  recipient_email: string;
  subject: string;
  status: "pending" | "sent" | "failed";
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export interface CreateAutomationDto {
  name: string;
  description?: string;
  trigger_type?: "event" | "group";
  event_type?: string;
  target_group?:
    | "all_students"
    | "unpurchased_students"
    | "purchased_students"
    | "salers";
  schedule_type?: "once" | "recurring";
  cron_expression?: string;
  scheduled_at?: string;
}

export interface CreateStepDto {
  step_order: number;
  delay_minutes: number;
  subject_template: string;
  body_template: string;
}

// Authorization is handled by apiClient interceptors

export const emailAutomationApi = {
  // Automations
  async getAutomations(includeInactive = true): Promise<EmailAutomation[]> {
    const response = await apiClient.get(
      `/email-automation?includeInactive=${includeInactive}`
    );
    return response.data;
  },

  async getAutomation(
    id: string
  ): Promise<EmailAutomation & { steps: EmailAutomationStep[] }> {
    const response = await apiClient.get(`/email-automation/${id}`);
    return response.data;
  },

  async createAutomation(data: CreateAutomationDto): Promise<EmailAutomation> {
    const response = await apiClient.post("/email-automation", data);
    return response.data;
  },

  async updateAutomation(
    id: string,
    data: Partial<CreateAutomationDto>
  ): Promise<EmailAutomation> {
    const response = await apiClient.put(`/email-automation/${id}`, data);
    return response.data;
  },

  async toggleAutomation(id: string): Promise<EmailAutomation> {
    const response = await apiClient.patch(
      `/email-automation/${id}/toggle`,
      {}
    );
    return response.data;
  },

  async deleteAutomation(id: string): Promise<void> {
    await apiClient.delete(`/email-automation/${id}`);
  },

  // Steps
  async getSteps(automationId: string): Promise<EmailAutomationStep[]> {
    const response = await apiClient.get(
      `/email-automation/${automationId}/steps`
    );
    return response.data;
  },

  async addStep(
    automationId: string,
    data: CreateStepDto
  ): Promise<EmailAutomationStep> {
    const response = await apiClient.post(
      `/email-automation/${automationId}/steps`,
      data
    );
    return response.data;
  },

  async updateStep(
    stepId: string,
    data: Partial<CreateStepDto>
  ): Promise<EmailAutomationStep> {
    const response = await apiClient.put(
      `/email-automation/steps/${stepId}`,
      data
    );
    return response.data;
  },

  async deleteStep(stepId: string): Promise<void> {
    await apiClient.delete(`/email-automation/steps/${stepId}`);
  },

  // Email Logs
  async getEmailLogs(filters?: {
    automationId?: string;
    status?: string;
    limit?: number;
    skip?: number;
  }): Promise<{
    logs: EmailLog[];
    total: number;
    limit: number;
    skip: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.automationId)
      params.append("automationId", filters.automationId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.skip) params.append("skip", filters.skip.toString());

    const response = await apiClient.get(
      `/email-automation/logs/history?${params.toString()}`
    );
    return response.data;
  },

  // Template helpers
  async getTemplateVariables(
    eventType: string
  ): Promise<{ variables: string[] }> {
    const response = await apiClient.get(
      `/email-automation/templates/variables/${eventType}`
    );
    return response.data;
  },

  async previewTemplate(
    template: string,
    eventType: string
  ): Promise<{ preview: string }> {
    const response = await apiClient.post(
      "/email-automation/templates/preview",
      {
        template,
        eventType,
      }
    );
    return response.data;
  },
};
