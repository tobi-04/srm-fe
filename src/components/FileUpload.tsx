import { useState } from "react";
import {
  Upload,
  Button,
  List,
  message,
  Popconfirm,
  Space,
  Typography,
  Alert,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/client";

const { Text } = Typography;

interface LessonFile {
  _id: string;
  lesson_id: string;
  name: string;
  url: string;
  mime: string;
  size: number;
  created_at: string;
}

interface FileUploadProps {
  lessonId: string;
  isAdmin?: boolean;
}

export default function FileUpload({
  lessonId,
  isAdmin = false,
}: FileUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const queryClient = useQueryClient();

  // Fetch files for this lesson
  const { data: files = [], isLoading } = useQuery<LessonFile[]>({
    queryKey: ["lesson-files", lessonId],
    queryFn: async () => {
      const response = await apiClient.get<LessonFile[]>(
        `/lesson-files/lesson/${lessonId}`
      );
      return response.data;
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await apiClient.post(
        `/lesson-files/upload/${lessonId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      message.success("Tải lên tệp thành công");
      setFileList([]);
      queryClient.invalidateQueries({ queryKey: ["lesson-files", lessonId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Tải lên tệp thất bại");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiClient.delete(`/lesson-files/${fileId}`);
    },
    onSuccess: () => {
      message.success("Xóa tệp thành công");
      queryClient.invalidateQueries({ queryKey: ["lesson-files", lessonId] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Xóa tệp thất bại");
    },
  });

  const uploadProps: UploadProps = {
    multiple: true,
    maxCount: 10,
    fileList,
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv",
    beforeUpload: (file) => {
      // Allowed file types
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain",
        "text/csv",
      ];

      const isAllowedType = allowedTypes.includes(file.type);
      if (!isAllowedType) {
        message.error(`${file.name} không phải là file tài liệu hợp lệ!`);
        return Upload.LIST_IGNORE;
      }

      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error(`${file.name} phải nhỏ hơn 50MB!`);
        return Upload.LIST_IGNORE;
      }

      setFileList((prev) => [...prev, file]);
      return false; // Prevent auto upload
    },
    onRemove: (file) => {
      setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
    },
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn tệp để tải lên");
      return;
    }

    const files = fileList.map((f) => (f.originFileObj || f) as File);
    uploadMutation.mutate(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div>
      {/* Upload section - only for admin */}
      {isAdmin && (
        <div style={{ marginBottom: 24 }}>
          <Alert
            message="Loại file được phép"
            description="Chỉ chấp nhận tài liệu: PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), Text (.txt), CSV. Tối đa 50MB/file."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Chọn tệp</Button>
          </Upload>
          {fileList.length > 0 && (
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploadMutation.isPending}
              style={{ marginTop: 16 }}
            >
              Tải lên {fileList.length} tệp
            </Button>
          )}
        </div>
      )}

      {/* Files list */}
      <List
        loading={isLoading}
        dataSource={files}
        locale={{ emptyText: "Chưa có tệp nào" }}
        renderItem={(file) => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<DownloadOutlined />}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Tải xuống
              </Button>,
              isAdmin && (
                <Popconfirm
                  title="Xóa tệp"
                  description="Bạn có chắc chắn muốn xóa tệp này?"
                  onConfirm={() => deleteMutation.mutate(file._id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    loading={deleteMutation.isPending}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
              ),
            ].filter(Boolean)}
          >
            <List.Item.Meta
              avatar={
                <FileOutlined
                  style={{ fontSize: 18, color: "#667eea", marginTop: "5px" }}
                />
              }
              title={file.name}
              description={
                <Space>
                  <Text type="secondary">{formatFileSize(file.size)}</Text>
                  <Text type="secondary">•</Text>
                  <Text type="secondary">
                    {new Date(file.created_at).toLocaleDateString("vi-VN")}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}
