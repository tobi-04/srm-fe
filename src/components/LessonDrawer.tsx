import { useState, useEffect } from "react";
import { Drawer, Typography, Space, Tag, Button, Card, List, Tabs } from "antd";
import {
  MdPlayCircleOutline,
  MdClose,
  MdCheckCircle,
  MdDrafts,
  MdAttachFile,
} from "react-icons/md";
import { useAuthStore } from "../stores/authStore";
import FileUpload from "./FileUpload";

const { Title, Text, Paragraph } = Typography;

interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  main_content: string[];
  video: string;
  status: "draft" | "published";
  order: number;
  chapter_index?: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

interface LessonDrawerProps {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onEdit?: (lesson: Lesson) => void;
}

export default function LessonDrawer({
  open,
  lesson,
  onClose,
}: LessonDrawerProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  // Responsive drawer placement
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Early return after hooks
  if (!lesson) return null;

  const statusConfig = {
    draft: { color: "#f59e0b", bg: "#fffbeb", label: "Nháp", icon: MdDrafts },
    published: {
      color: "#10b981",
      bg: "#ecfdf5",
      label: "Đã xuất bản",
      icon: MdCheckCircle,
    },
  };
  const config = statusConfig[lesson.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <Drawer
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
          <Text strong style={{ fontSize: 18, fontWeight: 700 }}>
            Chi tiết bài học
          </Text>
          <Space>
            <Button
              type="text"
              icon={<MdClose size={20} />}
              onClick={onClose}
            />
          </Space>
        </div>
      }
      open={open}
      onClose={onClose}
      placement={isMobile ? "bottom" : "right"}
      width={isMobile ? "100%" : 600}
      height={isMobile ? "85vh" : "100%"}
      style={isMobile ? {} : { maxWidth: 800 }}
      closable={false}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Lesson Header */}
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800 }}>
            {lesson.title}
          </Title>
          <Space style={{ marginTop: 8 }}>
            <Tag
              style={{
                color: config.color,
                background: config.bg,
                border: "none",
                fontWeight: 600,
                fontSize: 14,
                padding: "4px 12px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
              <StatusIcon size={16} />
              {config.label}
            </Tag>
            <Tag style={{ fontWeight: 600 }}>Thứ tự: {lesson.order}</Tag>
          </Space>
        </div>

        {/* Tabs for different sections */}
        <Tabs
          defaultActiveKey="content"
          items={[
            {
              key: "content",
              label: "Nội dung",
              children: (
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}>
                  {/* Video */}
                  {lesson.video && (
                    <Card
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}>
                          <MdPlayCircleOutline
                            style={{ color: "#667eea", fontSize: 20 }}
                          />
                          <Text
                            strong
                            style={{ fontSize: 16, fontWeight: 700 }}>
                            Video bài học
                          </Text>
                        </div>
                      }
                      variant="borderless"
                      style={{ borderRadius: 16, background: "#f8fafc" }}>
                      <div
                        style={{
                          position: "relative",
                          paddingBottom: "56.25%",
                          height: 0,
                          overflow: "hidden",
                          borderRadius: 8,
                        }}>
                        <iframe
                          src={lesson.video.replace("watch?v=", "embed/")}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: "none",
                            borderRadius: 8,
                          }}
                          allowFullScreen
                        />
                      </div>
                    </Card>
                  )}

                  {/* Description */}
                  {lesson.description && (
                    <Card
                      title={
                        <Text strong style={{ fontSize: 16, fontWeight: 700 }}>
                          Mô tả
                        </Text>
                      }
                      variant="borderless"
                      style={{ borderRadius: 16 }}>
                      <Paragraph
                        style={{
                          fontSize: 15,
                          lineHeight: 1.8,
                          color: "#475569",
                          marginBottom: 0,
                        }}>
                        {lesson.description}
                      </Paragraph>
                    </Card>
                  )}

                  {/* Main Content */}
                  {lesson.main_content && lesson.main_content.length > 0 && (
                    <Card
                      title={
                        <Text strong style={{ fontSize: 16, fontWeight: 700 }}>
                          Nội dung chính
                        </Text>
                      }
                      variant="borderless"
                      style={{ borderRadius: 16 }}>
                      <List
                        dataSource={lesson.main_content}
                        renderItem={(item, index) => (
                          <List.Item
                            style={{ padding: "12px 0", border: "none" }}>
                            <Space>
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: "50%",
                                  background: "#667eea",
                                  color: "white",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 700,
                                  fontSize: 14,
                                }}>
                                {index + 1}
                              </div>
                              <Text style={{ fontSize: 15, color: "#334155" }}>
                                {item}
                              </Text>
                            </Space>
                          </List.Item>
                        )}
                      />
                    </Card>
                  )}

                  {/* Metadata */}
                  <Card
                    variant="borderless"
                    style={{ borderRadius: 16, background: "#f8fafc" }}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}>
                        <Text type="secondary">Ngày tạo:</Text>
                        <Text strong>
                          {new Date(lesson.created_at).toLocaleString("vi-VN")}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}>
                        <Text type="secondary">Cập nhật:</Text>
                        <Text strong>
                          {new Date(lesson.updated_at).toLocaleString("vi-VN")}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Space>
              ),
            },
            {
              key: "files",
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MdAttachFile />
                  Tệp đính kèm
                </span>
              ),
              children: (
                <Card variant="borderless" style={{ borderRadius: 16 }}>
                  <FileUpload lessonId={lesson._id} isAdmin={isAdmin} />
                </Card>
              ),
            },
          ]}
        />
      </Space>
    </Drawer>
  );
}
