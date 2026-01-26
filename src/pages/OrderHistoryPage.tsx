import { useState, useEffect } from "react";
import {
  Table,
  Space,
  Typography,
  Card,
  Input,
  Avatar,
  Tag,
  Select,
  Row,
  Col,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  MdSearch,
  MdRefresh,
  MdCheckCircle,
  MdHistory,
  MdPerson,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import { adminAnalyticsApi } from "../api/adminAnalyticsApi";
import { getAvatarStyles } from "../utils/color";

const { Title, Text } = Typography;

export default function OrderHistoryPage() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-transactions", page, pageSize, statusFilter, searchText],
    queryFn: () =>
      adminAnalyticsApi.getTransactions({
        page,
        limit: pageSize,
        status: statusFilter,
        search: searchText || undefined,
      }),
  });

  const orders = data?.data || [];
  const meta = data?.meta;

  const columns = [
    {
      title: "MÃ GD",
      key: "transfer_code",
      width: 150,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>
            {record.transfer_code || record._id.substring(record._id.length - 8).toUpperCase()}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {new Date(record.created_at || record.paid_at).toLocaleDateString("vi-VN")}
          </Text>
        </Space>
      ),
    },
    {
      title: "HỌC VIÊN",
      key: "student",
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            style={{
              ...getAvatarStyles(record.student?.name || ""),
              fontWeight: "bold",
            }}>
            {record.student?.name?.substring(0, 2).toUpperCase() || (
              <MdPerson />
            )}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{record.student?.name || "N/A"}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.student?.email || ""}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "KHÓA HỌC",
      key: "course",
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.course?.title || "N/A"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.amount.toLocaleString("vi-VN")}đ
          </Text>
        </Space>
      ),
    },
    {
      title: "SALER",
      key: "saler",
      render: (_: any, record: any) =>
        record.saler ? (
          <Space>
            <Avatar
              size="small"
              style={{ ...getAvatarStyles(record.saler.name) }}>
              {record.saler.name.substring(0, 1).toUpperCase()}
            </Avatar>
            <Text>{record.saler.name}</Text>
          </Space>
        ) : (
          <Text type="secondary">Direct</Text>
        ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const isCompleted = status === "completed";
        const isFailed = status === "failed";
        return (
          <Tag
            color={isCompleted ? "success" : isFailed ? "error" : "warning"}
            icon={isCompleted ? <MdCheckCircle /> : null}
            style={{ borderRadius: 6, padding: "2px 8px" }}>
            {isCompleted ? "Thành công" : isFailed ? "Thất bại" : "Chờ xử lý"}
          </Tag>
        );
      },
    },
  ];

  const mobileColumns = [
    {
      title: "Thông tin giao dịch",
      key: "mobile_order",
      render: (_: any, record: any) => (
        <div style={{ padding: "8px 0" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
            <Text strong>
              {record.transfer_code || record._id.substring(record._id.length - 8).toUpperCase()}
            </Text>
            <Tag color={record.status === "completed" ? "success" : record.status === "failed" ? "error" : "warning"}>
              {record.status === "completed" ? "Thành công" : record.status === "failed" ? "Thất bại" : "Chờ"}
            </Tag>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text strong>{record.student?.name}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary">{record.course?.title}</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(record.created_at || record.paid_at).toLocaleDateString("vi-VN")}
            </Text>
            <Text strong style={{ color: "#16a34a" }}>
              {record.amount.toLocaleString("vi-VN")}đ
            </Text>
          </div>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div
        className="page-header"
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 16 : 0,
          marginBottom: 24,
        }}>
        <div style={{ flex: 1 }}>
          <Title
            level={isMobile ? 3 : 2}
            style={{
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
            <MdHistory /> Lịch sử giao dịch
          </Title>
          <Text type="secondary">
            Xem và quản lý tất cả các giao dịch thanh toán trong hệ thống
          </Text>
        </div>
      </div>

      <Card variant="borderless" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Input
              placeholder="Tìm theo học viên, khóa học hoặc mã GD..."
              prefix={<MdSearch size={18} style={{ color: "#94a3b8" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={12} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Trạng thái"
              allowClear
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}>
              <Select.Option value="completed">Thành công</Select.Option>
              <Select.Option value="pending">Chờ xử lý</Select.Option>
              <Select.Option value="failed">Thất bại</Select.Option>
            </Select>
          </Col>
          <Col xs={12} md={6}>
            <button
              onClick={() => refetch()}
              style={{
                width: "100%",
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
              }}>
              <MdRefresh size={18} /> Làm mới
            </button>
          </Col>
        </Row>
      </Card>

      <Card variant="borderless" style={{ padding: isMobile ? 0 : undefined }}>
        <Table
          columns={isMobile ? mobileColumns : columns}
          dataSource={orders}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: meta?.total || 0,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
            },
            showTotal: (total) => `Tổng cộng ${total} giao dịch`,
          }}
          scroll={{ x: isMobile ? undefined : 800 }}
        />
      </Card>
    </DashboardLayout>
  );
}
