import { useState, useEffect } from "react";
import {
  Table,
  Space,
  Typography,
  Card,
  Button,
  Input,
  Avatar,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdPerson,
  MdSearch,
  MdRefresh,
  MdAdd,
  MdEmail,
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
  MdWarning,
  MdLock,
  MdLockOpen,
  MdDeleteForever,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import { userApi, Saler, CreateSalerDto } from "../api/userApi";
import { getAvatarStyles } from "../utils/color";

const { Title, Text } = Typography;

export default function SalerManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["salers", searchText, page, pageSize],
    queryFn: () =>
      userApi.getSalers({
        page,
        limit: pageSize,
        search: searchText || undefined,
      }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (dto: CreateSalerDto) => userApi.createSaler(dto),
    onSuccess: () => {
      message.success("Tạo tài khoản Saler thành công!");
      setIsModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể tạo tài khoản";
      message.error(msg);
    },
  });

  const lockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.lockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: () => message.error("Không thể khóa tài khoản"),
  });

  const unlockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.unlockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: () => message.error("Không thể mở khóa tài khoản"),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.hardDeleteMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
    onError: () => message.error("Không thể xóa tài khoản"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salers"] });
    },
  });

  const salers = data?.data || [];
  const meta = data?.meta;

  const handleSearch = () => {
    setPage(1);
  };

  const handleCreateSaler = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(values);
    } catch (error) {
      // Validation error
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const hasSelected = selectedRowKeys.length > 0;

  // Mobile columns - single column with everything
  const mobileColumns = [
    {
      title: "Saler",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Saler) => (
        <div style={{ padding: "4px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}>
            <Space size="small">
              <Avatar
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  ...getAvatarStyles(text || record._id),
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  fontSize: 12,
                }}>
                {text ? text.substring(0, 2).toUpperCase() : <MdPerson />}
              </Avatar>
              <div style={{ maxWidth: 150 }}>
                <Text
                  strong
                  style={{ display: "block", color: "#1e293b", fontSize: 13 }}>
                  {text}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, wordBreak: "break-all" }}>
                  {record.email}
                </Text>
              </div>
            </Space>
            <Space size={4}>
              <Button
                type="text"
                size="small"
                icon={
                  record.is_active ? (
                    <MdLock size={16} />
                  ) : (
                    <MdLockOpen size={16} />
                  )
                }
                onClick={() => toggleMutation.mutate(record._id)}
                style={{ padding: 4 }}
              />
              <Popconfirm
                title="Xóa?"
                onConfirm={() => hardDeleteMutation.mutate([record._id])}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, size: "small" }}>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<MdDeleteForever size={16} />}
                  style={{ padding: 4 }}
                />
              </Popconfirm>
            </Space>
          </div>
          <div
            style={{ display: "flex", gap: 4, marginTop: 6, marginLeft: 44 }}>
            <Tag
              color={record.is_active ? "success" : "error"}
              style={{ fontSize: 11, margin: 0 }}>
              {record.is_active ? "Hoạt động" : "Khóa"}
            </Tag>
            {record.must_change_password && (
              <Tag color="warning" style={{ fontSize: 11, margin: 0 }}>
                Đổi MK
              </Tag>
            )}
          </div>
        </div>
      ),
    },
  ];

  // Desktop columns - full view
  const desktopColumns = [
    {
      title: "Saler",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text: string, record: Saler) => (
        <Space size="middle">
          <Avatar
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              ...getAvatarStyles(text || record._id),
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
            }}>
            {text ? text.substring(0, 2).toUpperCase() : <MdPerson />}
          </Avatar>
          <div>
            <Text strong style={{ display: "block", color: "#1e293b" }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record._id?.slice(-6).toUpperCase() || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (text: string) => (
        <Space size="small" style={{ color: "#64748b" }}>
          <MdEmail />
          {text}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (active: boolean) => (
        <Space
          size="small"
          style={{ color: active ? "#10b981" : "#ef4444", fontWeight: 600 }}>
          {active ? <MdCheckCircle /> : <MdCancel />}
          {active ? "Hoạt động" : "Đã khóa"}
        </Space>
      ),
    },
    {
      title: "Đổi MK",
      dataIndex: "must_change_password",
      key: "must_change_password",
      width: 100,
      render: (mustChange: boolean) =>
        mustChange ? (
          <Space size="small" style={{ color: "#f59e0b" }}>
            <MdWarning />
            Cần đổi
          </Space>
        ) : (
          <Text type="secondary">Đã đổi</Text>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      render: (date: string) => (
        <Space size="small" style={{ color: "#64748b" }}>
          <MdCalendarToday />
          {new Date(date).toLocaleDateString("vi-VN")}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      render: (_: any, record: Saler) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={record.is_active ? <MdLock /> : <MdLockOpen />}
            onClick={() => toggleMutation.mutate(record._id)}>
            {record.is_active ? "Khóa" : "Mở"}
          </Button>
          <Popconfirm
            title="Xóa vĩnh viễn?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => hardDeleteMutation.mutate([record._id])}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}>
            <Button
              type="text"
              size="small"
              danger
              icon={<MdDeleteForever />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Header - Responsive */}
      <div
        className="page-header"
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 16 : 0,
        }}>
        <div style={{ flex: 1 }}>
          <Title
            level={isMobile ? 3 : 2}
            className="page-title"
            style={{ marginBottom: 4 }}>
            Quản lý Saler
          </Title>
          <Text
            className="page-subtitle"
            style={{ fontSize: isMobile ? 13 : 14 }}>
            Quản lý đội ngũ bán hàng và tạo tài khoản mới
          </Text>
        </div>
        <Button
          type="primary"
          icon={<MdAdd size={isMobile ? 18 : 20} />}
          size={isMobile ? "middle" : "large"}
          onClick={() => setIsModalOpen(true)}
          style={{ width: isMobile ? "100%" : "auto" }}>
          Tạo Saler mới
        </Button>
      </div>

      <Card variant="borderless" style={{ padding: isMobile ? 12 : undefined }}>
        {/* Search & Actions Bar */}
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            gap: 12,
          }}>
          <Space
            size="middle"
            wrap
            style={{ width: isMobile ? "100%" : "auto" }}>
            <Input
              placeholder="Tìm kiếm..."
              prefix={<MdSearch size={18} style={{ color: "#94a3b8" }} />}
              style={{
                width: isMobile ? "100%" : 280,
                minWidth: isMobile ? "100%" : 200,
              }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button
              icon={<MdRefresh size={18} />}
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["salers"] })
              }
              loading={isLoading}>
              {isMobile ? "" : "Làm mới"}
            </Button>
          </Space>

          {hasSelected && (
            <Space
              size="small"
              wrap
              style={{ width: isMobile ? "100%" : "auto" }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Đã chọn {selectedRowKeys.length}
              </Text>
              <Button
                size="small"
                icon={<MdLock size={14} />}
                onClick={() => lockMutation.mutate(selectedRowKeys as string[])}
                loading={lockMutation.isPending}>
                Khóa
              </Button>
              <Button
                size="small"
                icon={<MdLockOpen size={14} />}
                onClick={() =>
                  unlockMutation.mutate(selectedRowKeys as string[])
                }
                loading={unlockMutation.isPending}>
                Mở
              </Button>
              <Popconfirm
                title={`Xóa ${selectedRowKeys.length} saler?`}
                description="Không thể hoàn tác!"
                onConfirm={() =>
                  hardDeleteMutation.mutate(selectedRowKeys as string[])
                }
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}>
                <Button
                  size="small"
                  danger
                  icon={<MdDeleteForever size={14} />}
                  loading={hardDeleteMutation.isPending}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>

        {/* Table */}
        <Table
          rowSelection={rowSelection}
          columns={isMobile ? mobileColumns : desktopColumns}
          dataSource={salers}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: isMobile ? undefined : 900 }}
          size={isMobile ? "small" : "middle"}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: meta?.total || 0,
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
            showTotal: isMobile
              ? undefined
              : (total, range) => `${range[0]}-${range[1]} / ${total}`,
            size: isMobile ? "small" : "default",
            simple: isMobile,
          }}
        />
      </Card>

      {/* Create Saler Modal */}
      <Modal
        title="Tạo tài khoản Saler mới"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={handleCreateSaler}
        okText="Tạo tài khoản"
        cancelText="Hủy"
        confirmLoading={createMutation.isPending}
        width={isMobile ? "95%" : 520}
        centered={isMobile}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input placeholder="VD: Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}>
            <Input placeholder="VD: saler@company.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu tạm thời"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
            extra="Saler sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu">
            <Input.Password placeholder="Nhập mật khẩu tạm thời" />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
