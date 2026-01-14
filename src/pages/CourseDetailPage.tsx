import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Descriptions,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Breadcrumb,
  Skeleton,
  Row,
  Col,
  Statistic,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdEdit,
  MdDelete,
  MdRestore,
  MdDeleteForever,
  MdAttachMoney,
  MdCategory,
  MdList,
  MdCalendarToday,
  MdUpdate,
  MdCheckCircle,
  MdDrafts,
  MdPublish,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../api/client";
import { useCourseStore } from "../stores/courseStore";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

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

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Get course from store
  const { currentCourse, setCurrentCourse, clearCurrentCourse } = useCourseStore();

  const {
    data: course,
    isLoading,
    refetch,
  } = useQuery<Course>({
    queryKey: ["course", slug],
    queryFn: async () => {
      const response = await apiClient.get(`/courses/slug/${slug}`);
      return response.data;
    },
    enabled: !!slug,
  });

  // Update store when course data changes
  useEffect(() => {
    if (course) {
      setCurrentCourse(course);
    }
    return () => {
      clearCurrentCourse();
    };
  }, [course, setCurrentCourse, clearCurrentCourse]);

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!currentCourse?._id) throw new Error("Course ID not found in store");
      const response = await apiClient.put(`/courses/${currentCourse._id}`, values);
      return response.data;
    },
    onSuccess: async (updatedCourse) => {
      message.success("Khóa học đã được cập nhật");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await queryClient.invalidateQueries({ queryKey: ["courses"] });

      // Check if slug changed (title was updated)
      if (updatedCourse.slug && updatedCourse.slug !== slug) {
        message.info("Đang chuyển đến URL mới...");
        // Navigate to new slug URL
        navigate(`/admin/courses/${updatedCourse.slug}`, { replace: true });
      } else {
        // Just refetch if slug didn't change
        await refetch();
      }

      setIsEditModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Không thể cập nhật khóa học"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!currentCourse?._id) throw new Error("Course ID not found in store");
      await apiClient.delete(`/courses/${currentCourse._id}`);
    },
    onSuccess: async () => {
      message.success("Khóa học đã được chuyển vào thùng rác");
      clearCurrentCourse();
      navigate("/admin/courses");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa khóa học");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: async () => {
      if (!currentCourse?._id) throw new Error("Course ID not found in store");
      await apiClient.delete(`/courses/${currentCourse._id}/hard`);
    },
    onSuccess: async () => {
      message.success("Khóa học đã được xóa vĩnh viễn");
      clearCurrentCourse();
      navigate("/admin/courses");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa vĩnh viễn");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!currentCourse?._id) throw new Error("Course ID not found in store");
      const response = await apiClient.put(`/courses/${currentCourse._id}/restore`);
      return response.data;
    },
    onSuccess: async () => {
      message.success("Khóa học đã được khôi phục");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể khôi phục");
    },
  });

  const handleEdit = () => {
    if (!course) return;
    form.setFieldsValue({
      ...course,
      syllabus: course.syllabus.join("\n"),
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        syllabus: values.syllabus
          ? values.syllabus.split("\n").filter((s: string) => s.trim())
          : [],
      };
      updateMutation.mutate(payload);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Chuyển vào thùng rác",
      content: "Khóa học sẽ được chuyển vào mục lưu trữ tạm thời.",
      okText: "Chuyển",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(),
    });
  };

  const handleHardDelete = () => {
    Modal.confirm({
      title: "Xóa vĩnh viễn",
      content: "Hành động này không thể hoàn tác và sẽ xóa sạch dữ liệu!",
      okText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => hardDeleteMutation.mutate(),
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div style={{ padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <Card>
          <Text>Không tìm thấy khóa học</Text>
        </Card>
      </DashboardLayout>
    );
  }

  const statusConfig = {
    draft: { color: "#f59e0b", bg: "#fffbeb", label: "Nháp", icon: MdDrafts },
    published: {
      color: "#10b981",
      bg: "#ecfdf5",
      label: "Đã xuất bản",
      icon: MdCheckCircle,
    },
  };
  const config = statusConfig[course.status] || statusConfig.draft;
  const StatusIcon = config.icon;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 24 }}
          items={[
            {
              title: (
                <a onClick={() => navigate("/admin/dashboard")}>Dashboard</a>
              ),
            },
            {
              title: (
                <a onClick={() => navigate("/admin/courses")}>
                  Quản lý khóa học
                </a>
              ),
            },
            { title: course.title },
          ]}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
            marginBottom: 24,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 250 }}>
            <Title
              level={2}
              style={{
                margin: 0,
                fontSize: "clamp(24px, 5vw, 32px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              {course.title}
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
                }}
              >
                <StatusIcon size={16} />
                {config.label}
              </Tag>
              {course.is_deleted && (
                <Tag color="red" style={{ fontWeight: 600 }}>
                  Đã xóa
                </Tag>
              )}
            </Space>
          </div>

          <Space wrap style={{ flexShrink: 0 }}>
            {!course.is_deleted ? (
              <>
                <Button
                  type="primary"
                  icon={<MdEdit size={18} />}
                  onClick={handleEdit}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  icon={<MdDelete size={18} />}
                  onClick={handleDelete}
                  style={{ color: "#faad14", borderColor: "#faad14" }}
                >
                  Thùng rác
                </Button>
                <Button
                  danger
                  icon={<MdDeleteForever size={18} />}
                  onClick={handleHardDelete}
                >
                  Xóa vĩnh viễn
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  icon={<MdRestore size={18} />}
                  onClick={() => restoreMutation.mutate()}
                  style={{ background: "#10b981", borderColor: "#10b981" }}
                >
                  Khôi phục
                </Button>
                <Button
                  danger
                  icon={<MdDeleteForever size={18} />}
                  onClick={handleHardDelete}
                >
                  Xóa vĩnh viễn
                </Button>
              </>
            )}
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ background: "#f0f9ff", borderRadius: 16 }}
            >
              <Statistic
                title={
                  <Text style={{ color: "#64748b", fontWeight: 500 }}>
                    Giá khóa học
                  </Text>
                }
                value={
                  course.price === 0
                    ? "Miễn phí"
                    : `${course.price.toLocaleString()}đ`
                }
                prefix={<MdAttachMoney style={{ color: "#10b981" }} />}
                valueStyle={{
                  color: course.price === 0 ? "#10b981" : "#1e293b",
                  fontWeight: 800,
                  fontSize: 24,
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ background: "#fef3c7", borderRadius: 16 }}
            >
              <Statistic
                title={
                  <Text style={{ color: "#64748b", fontWeight: 500 }}>
                    Danh mục
                  </Text>
                }
                value={course.category || "Chưa có"}
                prefix={<MdCategory style={{ color: "#f59e0b" }} />}
                valueStyle={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ background: "#f3e8ff", borderRadius: 16 }}
            >
              <Statistic
                title={
                  <Text style={{ color: "#64748b", fontWeight: 500 }}>
                    Số chủ đề
                  </Text>
                }
                value={course.syllabus?.length || 0}
                prefix={<MdList style={{ color: "#8b5cf6" }} />}
                valueStyle={{ fontWeight: 800, fontSize: 24, color: "#1e293b" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ background: "#dcfce7", borderRadius: 16 }}
            >
              <Statistic
                title={
                  <Text style={{ color: "#64748b", fontWeight: 500 }}>
                    Trạng thái
                  </Text>
                }
                value={config.label}
                prefix={<StatusIcon style={{ color: config.color }} />}
                valueStyle={{
                  color: config.color,
                  fontWeight: 800,
                  fontSize: 24,
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row gutter={[16, 16]}>
          {/* Left Column */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Description */}
              <Card
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <MdList style={{ color: "#667eea", fontSize: 20 }} />
                    <Text strong style={{ fontSize: 18, fontWeight: 700 }}>
                      Mô tả khóa học
                    </Text>
                  </div>
                }
                variant="borderless"
                style={{ borderRadius: 16 }}
              >
                {course.description ? (
                  <Paragraph
                    style={{
                      fontSize: 15,
                      lineHeight: 1.8,
                      color: "#475569",
                      marginBottom: 0,
                    }}
                  >
                    {course.description}
                  </Paragraph>
                ) : (
                  <Text type="secondary">Chưa có mô tả</Text>
                )}
              </Card>

              {/* Syllabus */}
              <Card
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <MdList style={{ color: "#667eea", fontSize: 20 }} />
                    <Text strong style={{ fontSize: 18, fontWeight: 700 }}>
                      Chương trình học
                    </Text>
                  </div>
                }
                variant="borderless"
                style={{ borderRadius: 16 }}
              >
                {course.syllabus && course.syllabus.length > 0 ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "16px 20px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {course.syllabus.map((item, index) => (
                        <li
                          key={index}
                          style={{
                            marginBottom: 12,
                            fontSize: 15,
                            color: "#334155",
                            lineHeight: 1.6,
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Text type="secondary">Chưa có chương trình học</Text>
                )}
              </Card>
            </Space>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <MdCalendarToday style={{ color: "#667eea", fontSize: 20 }} />
                  <Text strong style={{ fontSize: 18, fontWeight: 700 }}>
                    Thông tin chi tiết
                  </Text>
                </div>
              }
              variant="borderless"
              style={{ borderRadius: 16 }}
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <MdCalendarToday size={16} style={{ color: "#94a3b8" }} />
                      <Text style={{ color: "#64748b", fontWeight: 500 }}>
                        Ngày tạo
                      </Text>
                    </div>
                  }
                >
                  <Text strong style={{ fontWeight: 600 }}>
                    {new Date(course.created_at).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <MdUpdate size={16} style={{ color: "#94a3b8" }} />
                      <Text style={{ color: "#64748b", fontWeight: 500 }}>
                        Ngày cập nhật
                      </Text>
                    </div>
                  }
                >
                  <Text strong style={{ fontWeight: 600 }}>
                    {new Date(course.updated_at).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <MdPublish size={16} style={{ color: "#94a3b8" }} />
                      <Text style={{ color: "#64748b", fontWeight: 500 }}>
                        Slug
                      </Text>
                    </div>
                  }
                >
                  <Text
                    code
                    style={{
                      fontSize: 12,
                      wordBreak: "break-all",
                      background: "#f1f5f9",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {course.slug}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <MdDelete size={16} style={{ color: "#94a3b8" }} />
                      <Text style={{ color: "#64748b", fontWeight: 500 }}>
                        Đã xóa
                      </Text>
                    </div>
                  }
                >
                  {course.is_deleted ? (
                    <Tag color="red" style={{ fontWeight: 600 }}>
                      Có
                    </Tag>
                  ) : (
                    <Tag color="green" style={{ fontWeight: 600 }}>
                      Không
                    </Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa khóa học"
        open={isEditModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        width="90%"
        style={{ maxWidth: 700 }}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="Tiêu đề khóa học"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề" },
              { min: 3, message: "Tối thiểu 3 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Lập trình React nâng cao" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả chi tiết về khóa học" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              placeholder="0 = Miễn phí"
            />
          </Form.Item>
          <Form.Item name="category" label="Danh mục">
            <Input placeholder="Ví dụ: Lập trình web" />
          </Form.Item>
          <Form.Item name="status" label="Trạng thái" initialValue="draft">
            <Select>
              <Select.Option value="draft">Nháp</Select.Option>
              <Select.Option value="published">Xuất bản</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="syllabus"
            label="Chương trình học (mỗi chủ đề một dòng)"
          >
            <TextArea
              rows={6}
              placeholder="React Hooks&#10;Context API&#10;Performance Optimization"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .ant-breadcrumb {
            font-size: 12px;
          }

          .ant-statistic-title {
            font-size: 12px;
          }

          .ant-statistic-content {
            font-size: 16px !important;
          }

          .ant-card-head-title {
            font-size: 14px;
          }

          .ant-descriptions-item-label,
          .ant-descriptions-item-content {
            font-size: 13px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
