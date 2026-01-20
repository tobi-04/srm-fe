import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography, Card, Table, Space, Tag, Select, Alert } from "antd";
import { MdShoppingCart } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import salerApi, { SalerOrder } from "../api/salerApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function SalerOrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<"pending" | "paid" | undefined>(
    undefined,
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch orders
  const { data, isLoading, error } = useQuery({
    queryKey: ["saler-orders", page, pageSize, status],
    queryFn: () => salerApi.getOrders({ page, limit: pageSize, status }),
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
  });

  // Responsive listener
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Status tag
  const getStatusTag = (orderStatus: string) => {
    const statusMap = {
      pending: { color: "warning", text: "Chờ thanh toán" },
      paid: { color: "success", text: "Đã thanh toán" },
    };
    const config = statusMap[orderStatus as keyof typeof statusMap] || {
      color: "default",
      text: orderStatus,
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "course",
      key: "course",
      render: (course: any) => (
        <div>
          <Text strong>{course?.title || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {course?.slug || ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Học viên",
      key: "student",
      render: (_: any, record: SalerOrder) => (
        <div>
          <Text>{record.student_name || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.student_email || ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong style={{ color: "#3b82f6" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
    },
    {
      title: "Ngày mua",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
    },
  ];

  const mobileColumns = [
    {
      title: "Đơn hàng",
      dataIndex: "_id",
      key: "order",
      render: (_: any, record: SalerOrder) => (
        <div>
          <Text strong>{record.course?.title || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.student_name || "N/A"}
          </Text>
          <br />
          <Space size={4} style={{ marginTop: 4 }}>
            {getStatusTag(record.status)}
            <Text strong style={{ color: "#3b82f6", fontSize: 12 }}>
              {record.amount
                ? formatCurrency(record.amount)
                : "Chưa thanh toán"}
            </Text>
          </Space>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {formatDate(record.created_at)}
          </Text>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <DashboardLayout>
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải danh sách đơn hàng. Vui lòng thử lại."
          type="error"
          showIcon
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={isMobile ? 3 : 2} className="page-title">
          <MdShoppingCart style={{ marginRight: 8 }} />
          Đơn hàng của tôi
        </Title>
        <Text className="page-subtitle">
          Danh sách đơn hàng từ link giới thiệu của bạn
        </Text>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <div>
            <Text strong style={{ marginRight: 8 }}>
              Trạng thái:
            </Text>
            <Select
              style={{ width: isMobile ? "100%" : 200 }}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
              allowClear
              placeholder="Tất cả">
              <Option value="pending">Chờ thanh toán</Option>
              <Option value="paid">Đã thanh toán</Option>
            </Select>
          </div>
          {data && (
            <Text type="secondary">Tổng: {data.meta.total} đơn hàng</Text>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={isMobile ? mobileColumns : columns}
          dataSource={data?.data || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta.total || 0,
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "20", "50"],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
            showTotal: (total, range) =>
              isMobile
                ? `${range[0]}-${range[1]} / ${total}`
                : `${range[0]}-${range[1]} của ${total} đơn hàng`,
            size: isMobile ? "small" : "default",
            simple: isMobile,
          }}
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? undefined : 1000 }}
        />
      </Card>
    </DashboardLayout>
  );
}
