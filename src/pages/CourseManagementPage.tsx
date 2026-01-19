import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Button,
  Input,
  message,
  Modal,
  Form,
  InputNumber,
  Select,
  Popconfirm,
  Dropdown,
  Tooltip,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdRestore,
  MdSearch,
  MdRefresh,
  MdVisibility,
  MdDeleteForever,
  MdAttachMoney,
  MdCategory,
  MdList,
  MdMoreVert,
  MdPublish,
  MdDrafts,
  MdWeb,
  MdPlayCircle,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import apiClient from "../api/client";
import { getAvatarStyles } from "../utils/color";
import { getLandingPagesByCourse, createLandingPage } from "../api/landingPage";
import type { LandingPage } from "../stores/landingPageStore";

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

export default function CourseManagementPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>(
    {},
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]); // For bulk selection
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["courses", searchText, statusFilter, priceRange],
    queryFn: async () => {
      const response = await apiClient.get("/courses", {
        params: {
          page: 1,
          limit: 100,
          search: searchText,
          status: statusFilter || undefined,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
        },
      });
      return response.data;
    },
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache in memory
  });

  const courses: Course[] = data?.data || [];

  // Fetch landing pages for all courses
  const { data: landingPagesData } = useQuery({
    queryKey: ["landing-pages-by-courses", courses.map((c) => c._id)],
    queryFn: async () => {
      const landingPagesMap: Record<string, LandingPage> = {};
      await Promise.all(
        courses.map(async (course) => {
          try {
            const landingPages = await getLandingPagesByCourse(course._id);
            if (landingPages.length > 0) {
              landingPagesMap[course._id] = landingPages[0];
            }
          } catch {
            // Ignore errors for individual courses
          }
        }),
      );
      return landingPagesMap;
    },
    enabled: courses.length > 0,
    staleTime: 30000, // Cache for 30 seconds
  });

  const courseLandingPages = landingPagesData || {};

  // Create landing page mutation
  const createLandingPageMutation = useMutation({
    mutationFn: async (course: Course) => {
      return createLandingPage({
        course_id: course._id,
        title: `Landing Page - ${course.title}`,
        slug: course.slug,
      });
    },
    onSuccess: async (landingPage) => {
      message.success("Landing page đã được tạo thành công");
      await queryClient.invalidateQueries({
        queryKey: ["landing-pages-by-courses"],
      });
      // Navigate to the builder
      navigate(`/admin/landing-builder/${landingPage._id}`);
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Không thể tạo landing page",
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const response = await apiClient.post("/courses", values);
      return response.data;
    },
    onSuccess: async () => {
      message.success("Khóa học đã được tạo thành công");
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await refetch(); // Force immediate refetch
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể tạo khóa học");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const response = await apiClient.put(`/courses/${id}`, values);
      return response.data;
    },
    onSuccess: async () => {
      message.success("Khóa học đã được cập nhật");
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await refetch(); // Force immediate refetch
      setIsModalOpen(false);
      setSelectedCourse(null);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Không thể cập nhật khóa học",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/courses/${id}`);
    },
    onSuccess: async () => {
      message.success("Khóa học đã được xóa");
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await refetch(); // Force immediate refetch
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa khóa học");
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/courses/${id}/hard`);
    },
    onSuccess: async () => {
      message.success("Khóa học đã được xóa vĩnh viễn");
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await refetch(); // Force immediate refetch
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa vĩnh viễn");
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/courses/${id}/restore`);
      return response.data;
    },
    onSuccess: async () => {
      message.success("Khóa học đã được khôi phục");
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await refetch(); // Force immediate refetch
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể khôi phục");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.delete("/courses/bulk/delete", { data: { ids } });
    },
    onSuccess: async () => {
      message.success(
        `Đã chuyển ${selectedRowKeys.length} khóa học vào thùng rác`,
      );
      setSelectedRowKeys([]); // Clear selection
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await refetch(); // Force immediate refetch
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa khóa học");
    },
  });

  const bulkHardDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await apiClient.delete("/courses/bulk/hard", { data: { ids } });
    },
    onSuccess: async () => {
      message.success(`Đã xóa vĩnh viễn ${selectedRowKeys.length} khóa học`);
      setSelectedRowKeys([]); // Clear selection
      await queryClient.invalidateQueries({ queryKey: ["courses"] });
      await refetch(); // Force immediate refetch
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xóa vĩnh viễn");
    },
  });

  const handleCreate = () => {
    setSelectedCourse(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    form.setFieldsValue({
      ...course,
      syllabus: course.syllabus.join("\n"),
    });
    setIsModalOpen(true);
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

      if (selectedCourse) {
        updateMutation.mutate({ id: selectedCourse._id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleViewDetail = (course: Course) => {
    navigate(`/admin/courses/${course.slug}`);
  };

  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một khóa học");
      return;
    }
    bulkDeleteMutation.mutate(selectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
    },
    getCheckboxProps: (record: Course) => ({
      disabled: false,
      name: record.title,
    }),
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 250,
      render: (text: string, record: Course) => (
        <div>
          <Tooltip title={text}>
            <Paragraph
              strong
              ellipsis={{ rows: 2 }}
              style={{
                color: "#1e293b",
                marginBottom: 0,
              }}>
              {text}
            </Paragraph>
          </Tooltip>
          <Tooltip title={record.slug}>
            <Text type="secondary" style={{ fontSize: 11 }} ellipsis>
              Slug: {record.slug}
            </Text>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price: number) => (
        <Space>
          <MdAttachMoney color="#10b981" />
          <Text strong style={{ color: price === 0 ? "#10b981" : "#1e293b" }}>
            {price === 0 ? "Miễn phí" : `${price.toLocaleString()}đ`}
          </Text>
        </Space>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (category: string) =>
        category ? (
          <Tag
            style={{ background: "#f1f5f9", color: "#475569", border: "none" }}>
            <MdCategory style={{ marginRight: 4 }} />
            {category}
          </Tag>
        ) : (
          <Text type="secondary">Chưa có</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string) => {
        const statusConfig: Record<
          string,
          { color: string; bg: string; label: string }
        > = {
          draft: { color: "#f59e0b", bg: "#fffbeb", label: "Nháp" },
          published: { color: "#10b981", bg: "#ecfdf5", label: "Đã xuất bản" },
        };
        const config = statusConfig[status] || statusConfig.draft;
        return (
          <Tag
            style={{
              color: config.color,
              background: config.bg,
              border: "none",
              fontWeight: 600,
            }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_: any, record: Course) => {
        const items = [
          ...(!record.is_deleted
            ? [
                {
                  key: "view",
                  label: "Xem chi tiết",
                  icon: <MdVisibility />,
                  onClick: () => handleViewDetail(record),
                },
                {
                  key: "learn",
                  label: "Xem trang học",
                  icon: <MdPlayCircle style={{ color: "#22c55e" }} />,
                  style: { color: "#22c55e" },
                  onClick: () => window.open(`/learn/${record._id}`, "_blank"),
                },
                {
                  key: "status",
                  label:
                    record.status === "published" ? "Gỡ xuất bản" : "Xuất bản",
                  icon:
                    record.status === "published" ? (
                      <MdDrafts />
                    ) : (
                      <MdPublish />
                    ),
                  onClick: () =>
                    updateMutation.mutate({
                      id: record._id,
                      values: {
                        status:
                          record.status === "published" ? "draft" : "published",
                      },
                    }),
                },
                {
                  key: "edit",
                  label: "Chỉnh sửa",
                  icon: <MdEdit />,
                  style: { color: "#6366f1" },
                  onClick: () => handleEdit(record),
                },
                // Landing Page actions
                ...(courseLandingPages[record._id]
                  ? [
                      {
                        key: "edit_landing",
                        label: "Chỉnh sửa Landing Page",
                        icon: <MdWeb style={{ color: "#8b5cf6" }} />,
                        style: { color: "#8b5cf6" },
                        onClick: () =>
                          navigate(
                            `/admin/landing-builder/${courseLandingPages[record._id]._id}`,
                          ),
                      },
                      {
                        key: "view_landing",
                        label: "Xem Landing Page",
                        icon: <MdVisibility style={{ color: "#06b6d4" }} />,
                        style: { color: "#06b6d4" },
                        onClick: () =>
                          window.open(
                            `/landing/${courseLandingPages[record._id].slug}`,
                            "_blank",
                          ),
                      },
                    ]
                  : [
                      {
                        key: "create_landing",
                        label: "Tạo Landing Page",
                        icon: <MdWeb style={{ color: "#10b981" }} />,
                        style: { color: "#10b981" },
                        onClick: () => createLandingPageMutation.mutate(record),
                      },
                    ]),
                {
                  key: "delete",
                  label: (
                    <Popconfirm
                      title="Chuyển vào thùng rác"
                      description="Khóa học sẽ được chuyển vào mục lưu trữ tạm thời."
                      onConfirm={() => deleteMutation.mutate(record._id)}
                      okText="Chuyển"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}>
                      <span style={{ color: "#faad14", display: "block" }}>
                        Chuyển vào thùng rác
                      </span>
                    </Popconfirm>
                  ),
                  icon: <MdDelete style={{ color: "#faad14" }} />,
                },
                {
                  key: "hard_delete_active",
                  label: (
                    <Popconfirm
                      title="Xóa vĩnh viễn"
                      description="Hành động này không thể hoàn tác và sẽ xóa sạch dữ liệu!"
                      onConfirm={() => hardDeleteMutation.mutate(record._id)}
                      okText="Xóa vĩnh viễn"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}>
                      <span style={{ color: "#ff4d4f", display: "block" }}>
                        Xoá vĩnh viễn
                      </span>
                    </Popconfirm>
                  ),
                  icon: <MdDeleteForever style={{ color: "#ff4d4f" }} />,
                },
              ]
            : [
                {
                  key: "restore",
                  label: "Khôi phục",
                  icon: <MdRestore />,
                  style: { color: "#10b981" },
                  onClick: () => restoreMutation.mutate(record._id),
                },
                {
                  key: "hard_delete",
                  label: (
                    <Popconfirm
                      title="Xóa vĩnh viễn"
                      description="Hành động này không thể hoàn tác!"
                      onConfirm={() => hardDeleteMutation.mutate(record._id)}
                      okText="Xóa vĩnh viễn"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}>
                      <span style={{ color: "#ff4d4f", display: "block" }}>
                        Xóa vĩnh viễn
                      </span>
                    </Popconfirm>
                  ),
                  icon: <MdDeleteForever style={{ color: "#ff4d4f" }} />,
                },
              ]),
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight">
            <Button
              type="text"
              icon={<MdMoreVert size={20} />}
              className="action-btn"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <DashboardLayout>
      <div
        className="page-header"
        style={{
          flexDirection: "row",
          gap: "16px",
          alignItems: "flex-start",
        }}>
        <div style={{ flex: 1 }}>
          <Title
            level={2}
            className="page-title"
            style={{ fontSize: "clamp(20px, 5vw, 28px)" }}>
            Quản lý khóa học
          </Title>
          <Text className="page-subtitle" style={{ display: "block" }}>
            Tạo, sửa, xuất bản và quản lý các khóa học
          </Text>
        </div>
        <Button
          type="primary"
          icon={<MdAdd size={20} />}
          size="large"
          onClick={handleCreate}
          style={{ flexShrink: 0 }}>
          <span className="hide-on-mobile">Tạo khóa học mới</span>
          <span className="show-on-mobile">Tạo mới</span>
        </Button>
      </div>

      <Card variant="borderless">
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div className="filter-container">
            <Input
              placeholder="Tìm kiếm theo tiêu đề, mô tả..."
              prefix={<MdSearch size={20} style={{ color: "#94a3b8" }} />}
              className="search-input"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Trạng thái"
              className="filter-select"
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              allowClear>
              <Select.Option value="draft">Nháp</Select.Option>
              <Select.Option value="published">Đã xuất bản</Select.Option>
            </Select>
            <InputNumber
              placeholder="Giá tối thiểu"
              className="filter-input"
              min={0}
              value={priceRange.min}
              onChange={(value) =>
                setPriceRange({ ...priceRange, min: value || undefined })
              }
            />
            <InputNumber
              placeholder="Giá tối đa"
              className="filter-input"
              min={0}
              value={priceRange.max}
              onChange={(value) =>
                setPriceRange({ ...priceRange, max: value || undefined })
              }
            />
            <Button
              icon={<MdRefresh size={20} />}
              onClick={() => refetch()}
              className="refresh-btn">
              <span>Làm mới</span>
            </Button>
            {selectedRowKeys.length > 0 && (
              <Space wrap>
                <Popconfirm
                  title={`Chuyển ${selectedRowKeys.length} khóa học vào thùng rác`}
                  description="Các khóa học này sẽ bị ẩn khỏi học viên."
                  onConfirm={() => bulkDeleteMutation.mutate(selectedRowKeys)}
                  okText="Chuyển"
                  cancelText="Hủy">
                  <Button
                    icon={<MdDelete size={20} />}
                    loading={bulkDeleteMutation.isPending}
                    style={{ color: "#faad14", borderColor: "#faad14" }}>
                    Thùng rác ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title={`Xóa vĩnh viễn ${selectedRowKeys.length} khóa học`}
                  description="Hành động này không thể hoàn tác và sẽ xóa sạch dữ liệu khỏi hệ thống!"
                  onConfirm={() =>
                    bulkHardDeleteMutation.mutate(selectedRowKeys)
                  }
                  okText="Xóa vĩnh viễn"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}>
                  <Button
                    danger
                    icon={<MdDeleteForever size={20} />}
                    loading={bulkHardDeleteMutation.isPending}>
                    Xóa vĩnh viễn ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </div>

          <Table
            columns={columns}
            dataSource={courses}
            rowKey="_id"
            loading={isLoading}
            scroll={{ x: 1200 }}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} khóa học`,
            }}
          />
        </Space>
      </Card>

      <Modal
        title={selectedCourse ? "Sửa khóa học" : "Tạo khóa học mới"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedCourse(null);
          form.resetFields();
        }}
        okText={selectedCourse ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width="90%"
        style={{ maxWidth: 700 }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}>
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="title"
            label="Tiêu đề khóa học"
            rules={[
              { required: true, message: "Vui lòng nhập tiêu đề" },
              { min: 3, message: "Tối thiểu 3 ký tự" },
            ]}>
            <Input placeholder="Ví dụ: Lập trình React nâng cao" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} placeholder="Mô tả chi tiết về khóa học" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
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
            label="Chương trình học (mỗi chủ đề một dòng)">
            <TextArea
              rows={6}
              placeholder="React Hooks&#10;Context API&#10;Performance Optimization"
            />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table-body::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .ant-table-body::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .ant-table-body::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Responsive styles */
        .filter-container {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          min-width: 200px;
        }

        .filter-select {
          width: 150px;
        }

        .filter-input {
          width: 150px;
        }

        .refresh-btn {
          flex-shrink: 0;
        }

        .hide-on-mobile {
          display: inline;
        }

        .show-on-mobile {
          display: none;
        }

        /* Mobile styles */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column !important;
            gap: 12px !important;
          }

          .page-header > div {
            width: 100%;
          }

          .page-header button {
            width: 100%;
          }

          .hide-on-mobile {
            display: none;
          }

          .show-on-mobile {
            display: inline;
          }

          .filter-container {
            flex-direction: column;
            gap: 12px;
          }

          .search-input,
          .filter-select,
          .filter-input,
          .refresh-btn {
            width: 100% !important;
          }

          .ant-table {
            font-size: 12px;
          }

          .ant-table-thead > tr > th {
            padding: 8px 4px;
            font-size: 11px;
          }

          .ant-table-tbody > tr > td {
            padding: 8px 4px;
            font-size: 12px;
          }

          .ant-btn-sm {
            font-size: 11px;
            padding: 2px 6px;
          }

          .ant-modal {
            max-width: calc(100vw - 32px);
            margin: 16px;
          }

          .ant-modal-body {
            padding: 16px;
          }

          .ant-drawer-content-wrapper {
            width: 100vw !important;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 20px !important;
          }

          .page-subtitle {
            font-size: 13px;
          }

          .ant-card-body {
            padding: 12px;
          }

          .ant-space-vertical {
            gap: 12px !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
