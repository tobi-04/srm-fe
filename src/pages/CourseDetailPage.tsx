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
  Table,
  Dropdown,
  Tooltip,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnsType } from "antd/es/table";
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
  MdPlayCircleOutline,
  MdVisibility,
  MdAdd,
  MdLock,
  MdLockOpen,
  MdMoreVert,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../api/client";
import { useCourseStore } from "../stores/courseStore";
import { useLessonStore } from "../stores/lessonStore";
import LessonDrawer from "../components/LessonDrawer";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface Lesson {
  _id: string;
  course_id: string;
  title: string;
  description: string;
  main_content: string[];
  video: string;
  status: "draft" | "published";
  order: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

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
  lessons?: Lesson[];
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLessonDrawerOpen, setIsLessonDrawerOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLessonKeys, setSelectedLessonKeys] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Get course from store
  const { currentCourse, setCurrentCourse, clearCurrentCourse } =
    useCourseStore();

  // Get lesson store
  const { setLessons, setCurrentLesson, currentLesson, clearLessons } =
    useLessonStore();

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
      // Set lessons in store
      if (course.lessons) {
        setLessons(course.lessons);
      }
    }
    return () => {
      clearCurrentCourse();
      clearLessons();
    };
  }, [course, setCurrentCourse, clearCurrentCourse, setLessons, clearLessons]);

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!currentCourse?._id) throw new Error("Course ID not found in store");
      const response = await apiClient.put(
        `/courses/${currentCourse._id}`,
        values
      );
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
      const response = await apiClient.put(
        `/courses/${currentCourse._id}/restore`
      );
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

  // Lesson CRUD mutations
  const createLessonMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await apiClient.post("/lessons", {
        ...values,
        course_id: currentCourse?._id,
        main_content: values.main_content
          ? values.main_content.split("\n").filter((s: string) => s.trim())
          : [],
      });
      return response.data;
    },
    onSuccess: async () => {
      message.success("Bài học đã được tạo thành công");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
      setIsLessonModalOpen(false);
      lessonForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể tạo bài học");
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const response = await apiClient.put(`/lessons/${id}`, {
        ...values,
        main_content: values.main_content
          ? values.main_content.split("\n").filter((s: string) => s.trim())
          : [],
      });
      return response.data;
    },
    onSuccess: async () => {
      message.success("Bài học đã được cập nhật");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
      setIsLessonModalOpen(false);
      setSelectedLesson(null);
      lessonForm.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Không thể cập nhật bài học"
      );
    },
  });

  const toggleLessonStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.put(`/lessons/${id}`, { status });
      return response.data;
    },
    onSuccess: async () => {
      message.success("Trạng thái bài học đã được cập nhật");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/lessons/${id}`);
    },
    onSuccess: async () => {
      message.success("Bài học đã được chuyển vào thùng rác");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa bài học");
    },
  });

  const hardDeleteLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/lessons/${id}/hard`);
    },
    onSuccess: async () => {
      message.success("Bài học đã được xóa vĩnh viễn");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa vĩnh viễn");
    },
  });

  const restoreLessonMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/lessons/${id}/restore`);
      return response.data;
    },
    onSuccess: async () => {
      message.success("Bài học đã được khôi phục");
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể khôi phục");
    },
  });

  // Bulk lesson mutations
  const bulkDeleteLessonsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.delete("/lessons/bulk", { data: { ids } });
    },
    onSuccess: async () => {
      message.success(
        `Đã chuyển ${selectedLessonKeys.length} bài học vào thùng rác`
      );
      setSelectedLessonKeys([]);
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa bài học");
    },
  });

  const bulkHardDeleteLessonsMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.delete("/lessons/bulk/hard", { data: { ids } });
    },
    onSuccess: async () => {
      message.success(`Đã xóa vĩnh viễn ${selectedLessonKeys.length} bài học`);
      setSelectedLessonKeys([]);
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa vĩnh viễn");
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      await apiClient.put("/lessons/bulk", { ids, data: { status } });
    },
    onSuccess: async () => {
      message.success(
        `Đã cập nhật trạng thái ${selectedLessonKeys.length} bài học`
      );
      setSelectedLessonKeys([]);
      await queryClient.invalidateQueries({ queryKey: ["course", slug] });
      await refetch();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );
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

  // Lesson handlers
  const handleCreateLesson = () => {
    setSelectedLesson(null);
    lessonForm.resetFields();
    lessonForm.setFieldsValue({
      status: "draft",
      order: (course?.lessons?.length || 0) + 1,
    });
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    lessonForm.setFieldsValue({
      ...lesson,
      main_content: lesson.main_content.join("\n"),
    });
    setIsLessonModalOpen(true);
  };

  const handleSubmitLesson = async () => {
    try {
      const values = await lessonForm.validateFields();
      if (selectedLesson) {
        updateLessonMutation.mutate({ id: selectedLesson._id, values });
      } else {
        createLessonMutation.mutate(values);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleToggleStatus = (lesson: Lesson) => {
    const newStatus = lesson.status === "published" ? "draft" : "published";
    toggleLessonStatusMutation.mutate({ id: lesson._id, status: newStatus });
  };

  const handleViewLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setIsLessonDrawerOpen(true);
  };

  const handleDeleteLesson = (id: string) => {
    Modal.confirm({
      title: "Chuyển vào thùng rác",
      content: "Bài học sẽ được chuyển vào mục lưu trữ tạm thời.",
      okText: "Chuyển",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => deleteLessonMutation.mutate(id),
    });
  };

  const handleHardDeleteLesson = (id: string) => {
    Modal.confirm({
      title: "Xóa vĩnh viễn",
      content: "Hành động này không thể hoàn tác!",
      okText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => hardDeleteLessonMutation.mutate(id),
    });
  };

  // Bulk lesson handlers
  const handleBulkDelete = () => {
    if (selectedLessonKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một bài học");
      return;
    }
    Modal.confirm({
      title: "Chuyển vào thùng rác",
      content: `Bạn có chắc chắn muốn chuyển ${selectedLessonKeys.length} bài học vào thùng rác?`,
      okText: "Chuyển",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => bulkDeleteLessonsMutation.mutate(selectedLessonKeys),
    });
  };

  const handleBulkHardDelete = () => {
    if (selectedLessonKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một bài học");
      return;
    }
    Modal.confirm({
      title: "Xóa vĩnh viễn",
      content: `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedLessonKeys.length} bài học? Hành động này không thể hoàn tác!`,
      okText: "Xóa vĩnh viễn",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      onOk: () => bulkHardDeleteLessonsMutation.mutate(selectedLessonKeys),
    });
  };

  const handleBulkPublish = () => {
    if (selectedLessonKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một bài học");
      return;
    }
    bulkUpdateStatusMutation.mutate({
      ids: selectedLessonKeys,
      status: "published",
    });
  };

  const handleBulkUnpublish = () => {
    if (selectedLessonKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một bài học");
      return;
    }
    bulkUpdateStatusMutation.mutate({
      ids: selectedLessonKeys,
      status: "draft",
    });
  };

  // Row selection for bulk operations
  const rowSelection = {
    selectedRowKeys: selectedLessonKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedLessonKeys(newSelectedRowKeys as string[]);
    },
    getCheckboxProps: (record: Lesson) => ({
      disabled: false,
      name: record.title,
    }),
  };

  // Lesson table columns
  const lessonColumns: ColumnsType<Lesson> = [
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 80,
      render: (order: number) => (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            background: "#eff6ff",
            color: "#2564ebce",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            border: "1px solid #2564eb27 !important",
          }}
        >
          {order}
        </div>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (title: string, record: Lesson) => (
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Tooltip title={title}>
            <Text
              strong
              ellipsis
              style={{ fontSize: 14, display: "block", maxWidth: 400 }}
            >
              {title}
            </Text>
          </Tooltip>
          {record.video && (
            <Tag
              icon={<MdPlayCircleOutline />}
              style={{
                color: "#6366f1",
                background: "#eef2ff",
                border: "none",
                fontSize: 11,
              }}
            >
              Video
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const config = {
          draft: {
            color: "#f59e0b",
            bg: "#fffbeb",
            label: "Nháp",
            icon: MdDrafts,
          },
          published: {
            color: "#10b981",
            bg: "#ecfdf5",
            label: "Đã xuất bản",
            icon: MdCheckCircle,
          },
        };
        const statusConfig =
          config[status as keyof typeof config] || config.draft;
        const StatusIcon = statusConfig.icon;
        return (
          <Tag
            style={{
              color: statusConfig.color,
              background: statusConfig.bg,
              border: "none",
              fontWeight: 600,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "fit-content",
            }}
          >
            <StatusIcon size={14} />
            {statusConfig.label}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 100,
      render: (_: any, record: Lesson) => {
        const menuItems: any[] = [
          {
            key: "view",
            label: "Xem chi tiết",
            icon: <MdVisibility size={16} />,
            onClick: () => handleViewLesson(record),
          },
          {
            key: "toggle-status",
            label:
              record.status === "published" ? "Chuyển riêng tư" : "Công khai",
            icon:
              record.status === "published" ? (
                <MdLock size={16} />
              ) : (
                <MdLockOpen size={16} />
              ),
            onClick: () => handleToggleStatus(record),
          },
        ];

        if (!record.is_deleted) {
          menuItems.push(
            {
              key: "edit",
              label: "Chỉnh sửa",
              icon: <MdEdit size={16} />,
              onClick: () => handleEditLesson(record),
            },
            {
              type: "divider",
              key: "divider",
            },
            {
              key: "delete",
              label: "Thùng rác",
              icon: <MdDelete size={16} />,
              onClick: () => handleDeleteLesson(record._id),
              danger: true,
            },
            {
              key: "hard-delete",
              label: "Xóa vĩnh viễn",
              icon: <MdDeleteForever size={16} />,
              onClick: () => handleHardDeleteLesson(record._id),
              danger: true,
            }
          );
        } else {
          menuItems.push({
            key: "restore",
            label: "Khôi phục",
            icon: <MdRestore size={16} />,
            onClick: () => restoreLessonMutation.mutate(record._id),
          });
        }

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MdMoreVert size={20} />}
              style={{ padding: "4px 8px" }}
            />
          </Dropdown>
        );
      },
    },
  ];

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
      <div style={{ margin: "0 auto", padding: "0 16px" }}>
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
            {
              title: (
                <Text ellipsis style={{ maxWidth: 200 }}>
                  {course.title}
                </Text>
              ),
            },
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
            <Tooltip title={course.title}>
              <Title
                level={2}
                ellipsis
                style={{
                  margin: 0,
                  fontSize: "clamp(24px, 5vw, 32px)",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                {course.title}
              </Title>
            </Tooltip>
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
                style={{ borderRadius: 16, minHeight: "100% !important" }}
              >
                {course.syllabus && course.syllabus.length > 0 ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      padding: "5px",
                    }}
                  >
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                      {course.syllabus.map((item, index) => (
                        <li
                          key={index}
                          style={{
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
              style={{ borderRadius: 16, height: "100%" }}
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
                  <Tooltip title={course.slug}>
                    <Text
                      code
                      ellipsis
                      style={{
                        fontSize: 12,
                        maxWidth: "100%",
                        background: "#f1f5f9",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontWeight: 500,
                        display: "inline-block",
                      }}
                    >
                      {course.slug}
                    </Text>
                  </Tooltip>
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

        {/* Lessons Section */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MdPlayCircleOutline style={{ color: "#667eea", fontSize: 22 }} />
              <Text strong style={{ fontSize: 18, fontWeight: 700 }}>
                Danh sách bài học
              </Text>
              <Tag style={{ marginLeft: 8, fontWeight: 600 }}>
                {course.lessons?.length || 0} bài học
              </Tag>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<MdAdd size={18} />}
              onClick={handleCreateLesson}
              style={{ background: "#667eea", borderColor: "#667eea" }}
            >
              Thêm bài học
            </Button>
          }
          variant="borderless"
          style={{ borderRadius: 16, marginTop: 24 }}
        >
          {/* Bulk Actions */}
          {selectedLessonKeys.length > 0 && (
            <Space style={{ marginBottom: 16 }} wrap>
              <Text strong>Đã chọn {selectedLessonKeys.length} bài học</Text>
              <Button
                icon={<MdPublish size={16} />}
                onClick={handleBulkPublish}
                style={{ color: "#10b981", borderColor: "#10b981" }}
              >
                Công khai
              </Button>
              <Button
                icon={<MdLock size={16} />}
                onClick={handleBulkUnpublish}
                style={{ color: "#f59e0b", borderColor: "#f59e0b" }}
              >
                Riêng tư
              </Button>
              <Button
                icon={<MdDelete size={16} />}
                onClick={handleBulkDelete}
                style={{ color: "#faad14", borderColor: "#faad14" }}
              >
                Thùng rác
              </Button>
              <Button
                danger
                icon={<MdDeleteForever size={16} />}
                onClick={handleBulkHardDelete}
              >
                Xóa vĩnh viễn
              </Button>
            </Space>
          )}

          <Table
            columns={lessonColumns}
            dataSource={course.lessons || []}
            rowKey="_id"
            rowSelection={rowSelection}
            pagination={false}
            scroll={{ x: 800 }}
            locale={{ emptyText: "Chưa có bài học nào" }}
          />
        </Card>
      </div>

      {/* Lesson Drawer */}
      <LessonDrawer
        open={isLessonDrawerOpen}
        lesson={currentLesson}
        onClose={() => {
          setIsLessonDrawerOpen(false);
          setCurrentLesson(null);
        }}
        onEdit={handleEditLesson}
      />

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

      {/* Lesson Form Modal */}
      <Modal
        title={selectedLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
        open={isLessonModalOpen}
        onOk={handleSubmitLesson}
        onCancel={() => {
          setIsLessonModalOpen(false);
          setSelectedLesson(null);
          lessonForm.resetFields();
        }}
        okText={selectedLesson ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width="90%"
        style={{ maxWidth: 700 }}
        confirmLoading={
          createLessonMutation.isPending || updateLessonMutation.isPending
        }
      >
        <Form form={lessonForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="Tiêu đề bài học"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề" },
              { min: 3, message: "Tối thiểu 3 ký tự" },
            ]}
          >
            <Input placeholder="Ví dụ: Giới thiệu về React Hooks" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả chi tiết về bài học" />
          </Form.Item>
          <Form.Item name="video" label="URL Video (YouTube)">
            <Input placeholder="https://www.youtube.com/watch?v=..." />
          </Form.Item>
          <Form.Item
            name="main_content"
            label="Nội dung chính (mỗi mục một dòng)"
          >
            <TextArea
              rows={6}
              placeholder="What is React?&#10;Why use React?&#10;Setting up development environment"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="order"
                label="Thứ tự"
                rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  placeholder="1"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="draft">
                <Select>
                  <Select.Option value="draft">Nháp</Select.Option>
                  <Select.Option value="published">Xuất bản</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style>{`
        .lesson-item:hover {
          background: #ffffff !important;
          border-color: #667eea !important;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-2px);
        }

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
