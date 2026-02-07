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
  Select,
  Popconfirm,
  Tabs,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdRefresh,
  MdSearch,
  MdShare,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import ShareDialog from "../components/ShareDialog";
import {
  getLandingPages,
  createLandingPage,
  updateLandingPage,
  hardDeleteLandingPage,
} from "../api/landingPage";
import { bookApi } from "../api/bookApi";
import { indicatorApi } from "../api/indicatorApi";
import type { LandingPage } from "../stores/landingPageStore";

const { Title } = Typography;

interface FormValues {
  course_id?: string;
  book_id?: string;
  indicator_id?: string;
  resource_type: "course" | "book" | "indicator";
  title: string;
  slug: string;
  status: "draft" | "published";
}

export default function LandingPageManagementPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "courses" | "books" | "indicators"
  >("courses");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLandingPage, setSelectedLandingPage] =
    useState<LandingPage | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareItem, setShareItem] = useState<LandingPage | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Query courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/courses`,
        {
          credentials: "include",
        },
      );
      return response.json();
    },
  });

  const courses = coursesData?.data || [];

  // Query books for dropdown
  const { data: booksData } = useQuery({
    queryKey: ["admin-books"],
    queryFn: async () => {
      const response = await bookApi.adminGetBooks({ limit: 100 });
      return response.data;
    },
  });

  const books = booksData?.data || [];

  // Query indicators for dropdown
  const { data: indicatorsData } = useQuery({
    queryKey: ["admin-indicators"],
    queryFn: async () => {
      const response = await indicatorApi.adminGetAll({ limit: 100 });
      return response.data;
    },
  });

  const indicators = indicatorsData?.data || [];

  // Query landing pages
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["landing-pages", searchText, statusFilter],
    queryFn: async () => {
      return getLandingPages({
        page: 1,
        limit: 100,
        status: statusFilter || undefined,
      });
    },
    staleTime: 0,
    gcTime: 0,
  });

  const allLandingPages = data?.data || [];

  // Filter landing pages by active tab
  const landingPages = allLandingPages.filter((lp: LandingPage) => {
    if (activeTab === "courses") return lp.course_id;
    if (activeTab === "books") return lp.book_id;
    if (activeTab === "indicators") return lp.indicator_id;
    return true;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createLandingPage,
    onSuccess: async () => {
      message.success("Tạo landing page thành công");
      await queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      await refetch();
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error("Không thể tạo landing page");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormValues> }) =>
      updateLandingPage(id, data),
    onSuccess: async () => {
      message.success("Cập nhật landing page thành công");
      await queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      await refetch();
      setIsModalOpen(false);
      setSelectedLandingPage(null);
      form.resetFields();
    },
    onError: () => {
      message.error("Không thể cập nhật landing page");
    },
  });

  // Delete mutation (hard delete)
  const deleteMutation = useMutation({
    mutationFn: hardDeleteLandingPage,
    onSuccess: async () => {
      message.success("Đã xóa vĩnh viễn landing page");
      await queryClient.invalidateQueries({ queryKey: ["landing-pages"] });
      await refetch();
    },
    onError: () => {
      message.error("Không thể xóa landing page");
    },
  });

  const handleCreate = () => {
    setSelectedLandingPage(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: LandingPage) => {
    setSelectedLandingPage(record);
    form.setFieldsValue({
      course_id: record.course_id,
      book_id: record.book_id,
      indicator_id: record.indicator_id,
      resource_type: record.resource_type || (record.course_id ? "course" : record.book_id ? "book" : "indicator"),
      title: record.title,
      slug: record.slug,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleBuilder = (record: LandingPage) => {
    navigate(`/admin/landing-builder/${record._id}`);
  };

  const handleSubmit = async (values: FormValues) => {
    if (selectedLandingPage) {
      await updateMutation.mutateAsync({
        id: selectedLandingPage._id,
        data: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleShare = (record: LandingPage) => {
    setShareItem(record);
    setShareDialogOpen(true);
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Đường dẫn",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title:
        activeTab === "courses"
          ? "Khóa học"
          : activeTab === "books"
            ? "Sách"
            : "Indicator",
      dataIndex:
        activeTab === "courses"
          ? "course_id"
          : activeTab === "books"
            ? "book_id"
            : "indicator_id",
      key: "resource",
      render: (resourceId: string) => {
        if (activeTab === "courses") {
          const course = courses.find((c: any) => c._id === resourceId);
          return course?.title || resourceId;
        }
        if (activeTab === "books") {
          const book = books.find((b: any) => b._id === resourceId);
          return book?.title || resourceId;
        }
        if (activeTab === "indicators") {
          const indicator = indicators.find((i: any) => i._id === resourceId);
          return indicator?.name || resourceId;
        }
        return resourceId;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "published" ? "green" : "orange"}>
          {status === "published" ? "ĐÃ XUẤT BẢN" : "BẢN NHÁP"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_: any, record: LandingPage) => (
        <Space>
          <Button
            type="link"
            icon={<MdVisibility />}
            onClick={() => handleBuilder(record)}
          >
            Thiết kế
          </Button>
          <Button
            type="link"
            icon={<MdEdit />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            icon={<MdShare />}
            onClick={() => handleShare(record)}
          >
            Chia sẻ
          </Button>
          <Popconfirm
            title="Xóa vĩnh viễn landing page này?"
            description="Hành động này không thể hoàn tác. Landing page sẽ bị xóa vĩnh viễn."
            onConfirm={() => handleDelete(record._id)}
            okText="Có, Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<MdDelete />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={2}>Quản lý Landing Page</Title>
        </div>

        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<MdAdd />} onClick={handleCreate}>
            Tạo Landing Page
          </Button>
          <Button icon={<MdRefresh />} onClick={() => refetch()}>
            Làm mới
          </Button>
          <Input
            placeholder="Tìm kiếm..."
            prefix={<MdSearch />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || "")}
            style={{ width: 150 }}
          >
            <Select.Option value="draft">Bản nháp</Select.Option>
            <Select.Option value="published">Đã xuất bản</Select.Option>
          </Select>
        </Space>

        <Tabs
          activeKey={activeTab}
          onChange={(key) =>
            setActiveTab(key as "courses" | "books" | "indicators")
          }
          items={[
            {
              key: "courses",
              label: "Khóa học",
            },
            {
              key: "books",
              label: "Sách",
            },
            {
              key: "indicators",
              label: "Indicator",
            },
          ]}
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={columns}
          dataSource={landingPages}
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={
            selectedLandingPage ? "Chỉnh sửa Landing Page" : "Tạo Landing Page"
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedLandingPage(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
            initialValues={{
              resource_type:
                activeTab === "courses"
                  ? "course"
                  : activeTab === "books"
                    ? "book"
                    : "indicator",
            }}
          >
            <Form.Item name="resource_type" hidden>
              <Input />
            </Form.Item>

            {activeTab === "courses" && (
              <Form.Item
                name="course_id"
                label="Khóa học"
                rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
              >
                <Select placeholder="Chọn khóa học">
                  {courses.map((course: any) => (
                    <Select.Option key={course._id} value={course._id}>
                      {course.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {activeTab === "books" && (
              <Form.Item
                name="book_id"
                label="Sách"
                rules={[{ required: true, message: "Vui lòng chọn sách" }]}
              >
                <Select placeholder="Chọn sách">
                  {books.map((book: any) => (
                    <Select.Option key={book._id} value={book._id}>
                      {book.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {activeTab === "indicators" && (
              <Form.Item
                name="indicator_id"
                label="Indicator"
                rules={[{ required: true, message: "Vui lòng chọn indicator" }]}
              >
                <Select placeholder="Chọn indicator">
                  {indicators.map((indicator: any) => (
                    <Select.Option key={indicator._id} value={indicator._id}>
                      {indicator.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề landing page" />
            </Form.Item>

            <Form.Item
              name="slug"
              label="Đường dẫn (Slug)"
              rules={[{ required: true, message: "Vui lòng nhập đường dẫn" }]}
            >
              <Input placeholder="duong-dan-landing-page" />
            </Form.Item>

            <Form.Item name="status" label="Trạng thái" initialValue="draft">
              <Select>
                <Select.Option value="draft">Bản nháp</Select.Option>
                <Select.Option value="published">Đã xuất bản</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {selectedLandingPage ? "Cập nhật" : "Tạo mới"}
                </Button>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedLandingPage(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Share Dialog */}
        <ShareDialog
          open={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setShareItem(null);
          }}
          landingPageSlug={shareItem?._id}
          landingPageTitle={shareItem?.title}
        />
      </Card>
    </DashboardLayout>
  );
}
