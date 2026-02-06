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
  Modal,
  Tabs,
  Progress,
  Statistic,
  Row,
  Col,
  Spin,
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
  MdSchool,
  MdTrendingUp,
  MdAttachMoney,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import { userApi, Student } from "../api/userApi";
import { getAvatarStyles } from "../utils/color";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function StudentManagementPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const { data: studentDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ["student-details", selectedStudentId],
    queryFn: () => userApi.getStudentDetails(selectedStudentId!),
    enabled: !!selectedStudentId && isModalOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches backend cache TTL
    gcTime: 10 * 60 * 1000,
  });

  const lockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.lockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // Invalidate student details cache for affected students
      selectedRowKeys.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ["student-details", id] });
      });
    },
    onError: () => message.error("Không thể khóa tài khoản"),
  });

  const unlockMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.unlockMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // Invalidate student details cache for affected students
      selectedRowKeys.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ["student-details", id] });
      });
    },
    onError: () => message.error("Không thể mở khóa tài khoản"),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => userApi.hardDeleteMany(ids),
    onSuccess: (res) => {
      message.success(res.message);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // Invalidate student details cache for affected students
      selectedRowKeys.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ["student-details", id] });
      });
    },
    onError: () => message.error("Không thể xóa tài khoản"),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => userApi.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      // Invalidate student details cache
      queryClient.invalidateQueries({ queryKey: ["student-details", id] });
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
            }}
          >
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
          }}
        >
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
          style={{ color: active ? "#10b981" : "#ef4444", fontWeight: 600 }}
        >
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
            onClick={() => toggleMutation.mutate(record._id)}
          >
            {record.is_active ? "Khóa" : "Mở"}
          </Button>
          <Popconfirm
            title="Xóa vĩnh viễn?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => hardDeleteMutation.mutate([record._id])}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
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
          }}
        >
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
              loading={isLoading}
            >
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
                loading={lockMutation.isPending}
              >
                Khóa
              </Button>
              <Button
                icon={<MdLockOpen size={16} />}
                onClick={() =>
                  unlockMutation.mutate(selectedRowKeys as string[])
                }
                loading={unlockMutation.isPending}
              >
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
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<MdDeleteForever size={16} />}
                  loading={hardDeleteMutation.isPending}
                >
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
          onRow={(record) => ({
            onClick: (e) => {
              // Don't open modal if clicking on action buttons
              const target = e.target as HTMLElement;
              if (
                target.closest("button") ||
                target.closest(".ant-checkbox-wrapper")
              ) {
                return;
              }
              setSelectedStudentId(record._id);
              setIsModalOpen(true);
            },
            style: { cursor: "pointer" },
          })}
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

      {/* Student Details Modal */}
      <Modal
        title={
          <Space>
            <MdPerson size={24} />
            <span>Chi tiết học viên</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedStudentId(null);
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        {detailsLoading ? (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        ) : studentDetails ? (
          <>
            {/* Student Info Header */}
            <Card
              size="small"
              style={{ marginBottom: 16, background: "#f8fafc" }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Họ tên
                    </Text>
                    <Text strong style={{ fontSize: 16 }}>
                      {studentDetails.student.name}
                    </Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Email
                    </Text>
                    <Text>{studentDetails.student.email}</Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Summary Statistics */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Khóa học"
                    value={studentDetails.summary.total_courses}
                    prefix={<MdSchool />}
                    valueStyle={{ color: "#2563eb" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Đơn hàng"
                    value={studentDetails.summary.total_orders}
                    prefix={<MdShoppingCart />}
                    valueStyle={{ color: "#7c3aed" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Tiến độ TB"
                    value={studentDetails.summary.avg_progress}
                    suffix="%"
                    prefix={<MdTrendingUp />}
                    valueStyle={{ color: "#10b981" }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Tổng chi"
                    value={studentDetails.summary.total_spent.toLocaleString(
                      "vi-VN",
                    )}
                    suffix="đ"
                    prefix={<MdAttachMoney />}
                    valueStyle={{ color: "#f59e0b" }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabs for detailed information */}
            <Tabs
              items={[
                {
                  key: "courses",
                  label: `Khóa học (${studentDetails.enrollments.length})`,
                  children: (
                    <Table
                      dataSource={studentDetails.enrollments}
                      rowKey="course_id"
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                      columns={[
                        {
                          title: "Khóa học",
                          dataIndex: "course_title",
                          key: "course_title",
                          render: (text) => <Text strong>{text}</Text>,
                        },
                        {
                          title: "Tiến độ",
                          dataIndex: "progress_percent",
                          key: "progress_percent",
                          width: 200,
                          render: (percent) => (
                            <Progress
                              percent={percent}
                              size="small"
                              status={percent === 100 ? "success" : "active"}
                            />
                          ),
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          key: "status",
                          render: (status) => (
                            <Tag
                              color={
                                status === "completed"
                                  ? "success"
                                  : status === "active"
                                    ? "processing"
                                    : "default"
                              }
                            >
                              {status === "completed"
                                ? "Hoàn thành"
                                : status === "active"
                                  ? "Đang học"
                                  : "Đình chỉ"}
                            </Tag>
                          ),
                        },
                        {
                          title: "Ngày đăng ký",
                          dataIndex: "enrolled_at",
                          key: "enrolled_at",
                          render: (date) => dayjs(date).format("DD/MM/YYYY"),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "orders",
                  label: `Lịch sử mua hàng (${studentDetails.orders.length})`,
                  children: (
                    <Table
                      dataSource={studentDetails.orders}
                      rowKey="order_id"
                      pagination={false}
                      size="small"
                      scroll={{ y: 300 }}
                      columns={[
                        {
                          title: "Loại",
                          dataIndex: "type",
                          key: "type",
                          width: 100,
                          render: (type) => {
                            const typeMap: Record<
                              string,
                              { label: string; color: string }
                            > = {
                              course: { label: "Khóa học", color: "blue" },
                              book: { label: "Sách", color: "green" },
                              indicator: {
                                label: "Indicator",
                                color: "purple",
                              },
                            };
                            const typeInfo = typeMap[type] || {
                              label: "Khác",
                              color: "default",
                            };
                            return (
                              <Tag
                                color={typeInfo.color}
                                style={{ borderRadius: 6 }}
                              >
                                {typeInfo.label}
                              </Tag>
                            );
                          },
                        },
                        {
                          title: "Sản phẩm",
                          dataIndex: "item_name",
                          key: "item_name",
                        },
                        {
                          title: "Số tiền",
                          dataIndex: "amount",
                          key: "amount",
                          render: (amount) => (
                            <Text strong>
                              {amount?.toLocaleString("vi-VN")}đ
                            </Text>
                          ),
                        },
                        {
                          title: "Trạng thái",
                          dataIndex: "status",
                          key: "status",
                          render: (status) => {
                            const statusLower = status?.toLowerCase();
                            const isCompleted =
                              statusLower === "completed" ||
                              statusLower === "paid" ||
                              status === "COMPLETED";
                            return (
                              <Tag color={isCompleted ? "success" : "warning"}>
                                {isCompleted
                                  ? "Đã thanh toán"
                                  : "Chờ thanh toán"}
                              </Tag>
                            );
                          },
                        },
                        {
                          title: "Ngày mua",
                          dataIndex: "created_at",
                          key: "created_at",
                          render: (date) =>
                            dayjs(date).format("DD/MM/YYYY HH:mm"),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </>
        ) : null}
      </Modal>
    </DashboardLayout>
  );
}
