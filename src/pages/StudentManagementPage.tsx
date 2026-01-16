import { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Typography,
  Card,
  Button,
  Input,
  Avatar,
  message,
  Popconfirm,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdPerson,
  MdSearch,
  MdRefresh,
  MdEmail,
  MdCalendarToday,
  MdCheckCircle,
  MdCancel,
  MdShoppingCart,
  MdLock,
  MdLockOpen,
  MdDeleteForever,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import { userApi, Student } from "../api/userApi";
import { getAvatarStyles } from "../utils/color";

const { Title, Text } = Typography;

export default function StudentManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["students", searchText, page, pageSize],
    queryFn: () =>
      userApi.getStudents({
        page,
        limit: pageSize,
        search: searchText || undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed to gcTime in v5)
  });

  const lockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.lockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => message.error("Không thể khóa tài khoản"),
  });

  const unlockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.unlockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => message.error("Không thể mở khóa tài khoản"),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.hardDeleteMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => message.error("Không thể xóa tài khoản"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userApi.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const students = data?.data || [];
  const meta = data?.meta;

  const handleSearch = () => {
    setPage(1);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const hasSelected = selectedRowKeys.length > 0;

  const columns = [
    {
      title: "Học viên",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text: string, record: Student) => (
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
      width: 250,
      render: (text: string) => (
        <Space size="small" style={{ color: "#64748b" }}>
          <MdEmail />
          {text}
        </Space>
      ),
    },
    {
      title: "Trạng thái mua",
      dataIndex: "has_enrollment",
      key: "has_enrollment",
      width: 130,
      render: (hasEnrollment: boolean) => (
        <Tag
          icon={<MdShoppingCart style={{ marginRight: 4 }} />}
          color={hasEnrollment ? "success" : "default"}
          style={{
            display: "flex",
            alignItems: "center",
            width: "fit-content",
          }}>
          {hasEnrollment ? "Đã mua" : "Chưa mua"}
        </Tag>
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
      title: "Ngày tham gia",
      dataIndex: "created_at",
      key: "created_at",
      width: 130,
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
      width: 150,
      render: (_: any, record: Student) => (
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
      <div className="page-header">
        <div>
          <Title level={2} className="page-title">
            Quản lý Học viên
          </Title>
          <Text className="page-subtitle">
            Quản lý danh sách học viên và theo dõi trạng thái mua khóa học
          </Text>
        </div>
      </div>

      <Card variant="borderless">
        <div
          style={{
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}>
          <Space size="middle" wrap>
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              prefix={<MdSearch size={20} style={{ color: "#94a3b8" }} />}
              style={{ width: 280 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
            <Button
              icon={<MdRefresh size={18} />}
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: ["students"] })
              }
              loading={isLoading}>
              Làm mới
            </Button>
          </Space>

          {hasSelected && (
            <Space size="small" wrap>
              <Text type="secondary">
                Đã chọn {selectedRowKeys.length} học viên
              </Text>
              <Button
                icon={<MdLock size={16} />}
                onClick={() => lockMutation.mutate(selectedRowKeys as string[])}
                loading={lockMutation.isPending}>
                Khóa
              </Button>
              <Button
                icon={<MdLockOpen size={16} />}
                onClick={() =>
                  unlockMutation.mutate(selectedRowKeys as string[])
                }
                loading={unlockMutation.isPending}>
                Mở khóa
              </Button>
              <Popconfirm
                title={`Xóa vĩnh viễn ${selectedRowKeys.length} học viên?`}
                description="Hành động này không thể hoàn tác!"
                onConfirm={() =>
                  hardDeleteMutation.mutate(selectedRowKeys as string[])
                }
                okText="Xóa tất cả"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}>
                <Button
                  danger
                  icon={<MdDeleteForever size={16} />}
                  loading={hardDeleteMutation.isPending}>
                  Xóa vĩnh viễn
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={students}
          rowKey="_id"
          loading={isLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: meta?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} học viên`,
          }}
        />
      </Card>
    </DashboardLayout>
  );
}
