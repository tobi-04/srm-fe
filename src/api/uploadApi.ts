import apiClient from "./client";

export interface UploadResponse {
  success: boolean;
  url: string;
  key: string;
  name: string;
  size: number;
  mime: string;
}

export type UploadFolder =
  | "books"
  | "indicators"
  | "courses"
  | "users"
  | "covers";

export const uploadApi = {
  /**
   * Upload image to R2 storage
   * @param file - File to upload
   * @param folder - Target folder (books, indicators, courses, users, covers)
   */
  uploadImage: async (
    file: File,
    folder: UploadFolder,
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<UploadResponse>(
      `/upload/${folder}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },
};
