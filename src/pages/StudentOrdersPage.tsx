import { useState } from "react";
import { Card, Typography, Table, Tag, Spin, Empty, Space } from "antd";
import { useQuery } from "@tanstack/react-query";
import { MdShoppingCart, MdCheckCircle, MdAccessTime } from "react-icons/md";
import StudentDashboardLayout from "../components/StudentDashboardLayout";
import { studentApi } from "../api/studentApi";

const { Title, Text } = Typography;

export default function StudentOrdersPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: ["student-orders", page, pageSize],
    queryFn: () => studentApi.getOrders({ page, limit: pageSize }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const columns = [
    {
      title: "MÃ ĐƠN",
      dataIndex: "_id",
      key: "_id",
      render: (id: string) => (
        <Text strong style={{ fontFamily: "monospace" }}>
          #{id?.slice(-8).toUpperCase()}
        </Text>
      ),
      responsive: ["sm"] as any,
    },
    {
      title: "KHÓA HỌC",
      dataIndex: "course_id",
      key: "course",
      render: (course: any) => <Text>{course?.title || "N/A"}</Text>,
    },
    {
      title: "SỐ TIỀN",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong style={{ color: "#10b981" }}>
          {amount?.toLocaleString("vi-VN")}đ
        </Text>
      ),
      responsive: ["md"] as any,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusConfig = {
          completed: {
            color: "success",
            icon: <MdCheckCircle />,
            text: "Hoàn thành",
          },
          pending: {
            color: "warning",
            icon: <MdAccessTime />,
            text: "Chờ thanh toán",
          },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || {
          color: "default",
          icon: null,
          text: status,
        };
        return (
          <Tag
            color={config.color}
            icon={config.icon}
            style={{ borderRadius: 8, padding: "4px 12px" }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "NGÀY MUA",
      dataIndex: "paid_at",
      key: "date",
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
      responsive: ["lg"] as any,
    },
  ];

  if (isLoading) {
    return (
      <StudentDashboardLayout>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <Spin size="large" />
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Lịch sử đơn hàng
          </Title>
          <Text type="secondary">Xem lại các giao dịch đã thực hiện</Text>
        </div>

        <Card variant="borderless" style={{ borderRadius: 12 }}>
          {!data?.data?.length ? (
            <Empty
              image={<MdShoppingCart size={64} color="#cbd5e1" />}
              description="Bạn chưa có đơn hàng nào"
            />
          ) : (
            <Table
              columns={columns}
              dataSource={data.data}
              rowKey="_id"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: data.meta?.total || 0,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                onChange: (newPage, newPageSize) => {
                  setPage(newPage);
                  setPageSize(newPageSize);
                },
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} / ${total} đơn hàng`,
              }}
              scroll={{ x: 768 }}
            />
          )}
        </Card>
      </div>
    </StudentDashboardLayout>
  );
}
