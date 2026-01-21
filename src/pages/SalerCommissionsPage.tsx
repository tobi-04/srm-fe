import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Table,
  Space,
  Tag,
  Select,
  Statistic,
  Row,
  Col,
} from "antd";
import { MdAttachMoney, MdAccountBalanceWallet } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import salerApi from "../api/salerApi";

const { Title, Text } = Typography;
const { Option } = Select;

export default function SalerCommissionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<
    "pending" | "available" | "paid" | undefined
  >(undefined);

  // Fetch commissions
  const { data, isLoading } = useQuery({
    queryKey: ["saler-commissions", page, pageSize, status],
    queryFn: () => salerApi.getCommissions({ page, limit: pageSize, status }),
  });

  // Fetch summary
  const { data: summary } = useQuery({
    queryKey: ["saler-commission-summary"],
    queryFn: () => salerApi.getCommissionSummary(),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusTag = (s: string) => {
    const config = {
      pending: { color: "warning", text: "Chờ duyệt" },
      available: { color: "success", text: "Có thể rút" },
      paid: { color: "blue", text: "Đã thanh toán" },
    };
    const c = config[s as keyof typeof config] || { color: "default", text: s };
    return <Tag color={c.color}>{c.text}</Tag>;
  };

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "course_id",
      key: "course",
      render: (course: any) => course?.title || "N/A",
    },
    {
      title: "Giá tiền",
      dataIndex: "order_amount",
      key: "order_amount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "% Hoa hồng",
      dataIndex: "commission_rate",
      key: "rate",
      render: (rate: number) => `${rate}%`,
    },
    {
      title: "Hoa hồng nhận",
      dataIndex: "commission_amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong style={{ color: "#f59e0b" }}>
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
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>Hoa hồng của tôi</Title>
        <Text type="secondary">
          Quản lý và theo dõi thu nhập từ việc giới thiệu khóa học
        </Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Khả dụng"
              value={formatCurrency(summary?.available?.total || 0)}
              valueStyle={{ color: "#10b981" }}
              prefix={<MdAccountBalanceWallet />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={formatCurrency(summary?.pending?.total || 0)}
              valueStyle={{ color: "#f59e0b" }}
              prefix={<MdAttachMoney />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={formatCurrency(summary?.paid?.total || 0)}
              valueStyle={{ color: "#3b82f6" }}
              prefix={<MdAttachMoney />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Chi tiết hoa hồng">
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 200 }}
            allowClear
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}>
            <Option value="pending">Chờ duyệt</Option>
            <Option value="available">Khả dụng</Option>
            <Option value="paid">Đã thanh toán</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: data?.meta?.total || 0,
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
            },
          }}
        />
      </Card>
    </DashboardLayout>
  );
}
