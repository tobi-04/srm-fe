import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tag,
  Popconfirm,
  Card,
  Tabs,
  Dropdown,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { indicatorApi, Indicator } from "../../api/indicatorApi";
import { createLandingPage, getLandingPages } from "../../api/landingPage";
import DashboardLayout from "../../components/DashboardLayout";
import ImageUpload from "../../components/ImageUpload";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const IndicatorManagementPage: React.FC = () => {
  const navigate = useNavigate();
  // ... existing hooks ...

  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [params, setParams] = useState({ page: 1, limit: 10 });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-indicators", params],
    queryFn: () =>
      indicatorApi.adminGetAll(params).then((res: any) => res.data),
  });

  const { data: subscriptionsData, isLoading: subsLoading } = useQuery({
    queryKey: ["admin-subscriptions", params],
    queryFn: () =>
      indicatorApi.adminGetSubscriptions(params).then((res: any) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: indicatorApi.adminCreate,
    onSuccess: () => {
      message.success("Tạo Indicator thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-indicators"] });
      handleCloseModal();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Indicator> }) =>
      indicatorApi.adminUpdate(id, data),
    onSuccess: () => {
      message.success("Cập nhật thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-indicators"] });
      handleCloseModal();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: indicatorApi.adminDelete,
    onSuccess: () => {
      message.success("Xóa thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-indicators"] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || "Có lỗi xảy ra");
    },
  });

  const handleOpenModal = (indicator?: Indicator) => {
    if (indicator) {
      setEditingId(indicator._id);
      form.setFieldsValue(indicator);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleManageLandingPage = async (indicator: Indicator) => {
    try {
      message.loading({
        content: "Đang kiểm tra Landing Page...",
        key: "landing",
      });
      const res = await getLandingPages({ indicator_id: indicator._id });

      if (res.data && res.data.length > 0) {
        message.success({
          content: "Đã tìm thấy Landing Page!",
          key: "landing",
        });
        navigate(`/admin/landing-builder/${res.data[0]._id}`);
      } else {
        message.loading({
          content: "Đang tạo Landing Page mới...",
          key: "landing",
        });
        const newLp = await createLandingPage({
          resource_type: "indicator",
          indicator_id: indicator._id,
          title: indicator.name,
          slug: indicator.slug,
          status: "draft",
        });
        message.success({
          content: "Tạo Landing Page thành công!",
          key: "landing",
        });
        navigate(`/admin/landing-builder/${newLp._id}`);
      }
    } catch (error) {
      console.error(error);
      message.error({
        content: "Lỗi khi truy cập Landing Page",
        key: "landing",
      });
    }
  };

  // ... existing definitions ...

  const columns = [
    {
      title: "Tên Indicator",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Giá/tháng",
      dataIndex: "price_monthly",
      key: "price_monthly",
      render: (price: number) => (
        <Text style={{ color: "#f78404", fontWeight: 600 }}>
          {formatPrice(price)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "default"}>
          {status === "ACTIVE" ? "Hoạt động" : "Tạm ẩn"}
        </Tag>
      ),
    },
    {
      title: "Contact Email",
      dataIndex: "contact_email",
      key: "contact_email",
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      render: (_: any, record: Indicator) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "Xem chi tiết",
                icon: <EyeOutlined />,
                onClick: () => handleOpenModal(record),
              },
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined />,
                onClick: () => handleOpenModal(record),
              },
              {
                key: "landing",
                label: "Landing Page",
                icon: <ThunderboltOutlined />,
                onClick: () => handleManageLandingPage(record),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                label: (
                  <Popconfirm
                    title="Xác nhận xóa?"
                    onConfirm={() => deleteMutation.mutate(record._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <span>Xóa</span>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined />,
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const subscriptionColumns = [
    {
      title: "Indicator",
      dataIndex: ["indicator_id", "name"],
      key: "indicator",
    },
    {
      title: "Người thuê",
      dataIndex: ["user_id", "email"],
      key: "user",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors: Record<string, string> = {
          ACTIVE: "success",
          PENDING: "processing",
          EXPIRED: "error",
          CANCELLED: "default",
        };
        return <Tag color={colors[status] || "default"}>{status}</Tag>;
      },
    },
    {
      title: "Bắt đầu",
      dataIndex: "start_at",
      key: "start_at",
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Hết hạn",
      dataIndex: "end_at",
      key: "end_at",
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Tự động gia hạn",
      dataIndex: "auto_renew",
      key: "auto_renew",
      render: (val: boolean) =>
        val ? <Tag color="blue">Có</Tag> : <Tag>Không</Tag>,
    },
  ];

  const tabItems = [
    {
      key: "indicators",
      label: "Danh sách Indicator",
      children: (
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: params.page,
            pageSize: params.limit,
            total: data?.meta?.total,
            onChange: (page) => setParams({ ...params, page }),
          }}
        />
      ),
    },
    {
      key: "subscriptions",
      label: "Danh sách Subscription",
      children: (
        <Table
          columns={subscriptionColumns}
          dataSource={subscriptionsData?.items || []}
          rowKey="_id"
          loading={subsLoading}
          pagination={{
            current: params.page,
            pageSize: params.limit,
            total: subscriptionsData?.meta?.total,
            onChange: (page) => setParams({ ...params, page }),
          }}
        />
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: "24px 32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div>
            <Title level={2} style={{ marginBottom: 4 }}>
              Quản lý Indicators
            </Title>
            <Text type="secondary">
              Tạo và quản lý các dịch vụ Indicator cho thuê
            </Text>
          </div>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Thêm Indicator
            </Button>
          </Space>
        </div>

        <Card
          style={{ borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          <Tabs items={tabItems} />
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? "Chỉnh sửa Indicator" : "Thêm Indicator mới"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Indicator"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input size="large" placeholder="VD: Premium Trading Signals" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả (Public)">
            <TextArea rows={3} placeholder="Mô tả hiển thị cho người dùng" />
          </Form.Item>

          <Form.Item
            name="price_monthly"
            label="Giá thuê hàng tháng (VND)"
            rules={[{ required: true, message: "Vui lòng nhập giá" }]}
          >
            <InputNumber
              size="large"
              style={{ width: "100%" }}
              min={0}
              step={10000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
            />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái">
            <Select
              size="large"
              options={[
                { value: "ACTIVE", label: "Hoạt động" },
                { value: "INACTIVE", label: "Tạm ẩn" },
              ]}
            />
          </Form.Item>

          <Form.Item name="cover_image" label="Ảnh bìa">
            <ImageUpload folder="indicators" />
          </Form.Item>

          <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
            Thông tin liên hệ (Chỉ hiển thị cho người đã thuê)
          </Title>

          <Form.Item name="owner_name" label="Tên người cung cấp">
            <Input size="large" placeholder="VD: Trading Team" />
          </Form.Item>

          <Form.Item name="contact_email" label="Email liên hệ">
            <Input size="large" placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="contact_telegram" label="Telegram">
            <Input size="large" placeholder="@username hoặc link nhóm" />
          </Form.Item>

          <Form.Item name="description_detail" label="Hướng dẫn chi tiết">
            <TextArea
              rows={4}
              placeholder="Hướng dẫn sử dụng, link tải, etc."
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? "Cập nhật" : "Tạo Indicator"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
};

export default IndicatorManagementPage;
