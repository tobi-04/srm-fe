import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Typography,
  Space,
  Tag,
  Button,
  Select,
  Avatar,
  Spin,
} from "antd";
import {
  MdAttachMoney,
  MdPersonAdd,
  MdPlayCircle,
  MdCheckCircle,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { adminAnalyticsApi } from "../api/adminAnalyticsApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const COLORS = ["#2563eb", "#60a5fa", "#93c5fd", "#bfdbfe"];

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<number>(7);

  // Fetch real data
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: adminAnalyticsApi.getSummary,
  });

  const { data: revenueTrend, isLoading: trendLoading } = useQuery({
    queryKey: ["admin-revenue-trend", timeRange],
    queryFn: () => adminAnalyticsApi.getRevenueTrend(timeRange),
  });

  const { data: trafficSources, isLoading: trafficLoading } = useQuery({
    queryKey: ["admin-traffic-sources"],
    queryFn: adminAnalyticsApi.getTrafficSources,
  });

  const { data: recentPayments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-recent-payments"],
    queryFn: adminAnalyticsApi.getRecentPayments,
  });

  const isLoading =
    summaryLoading || trendLoading || trafficLoading || paymentsLoading;

  const statsCards = [
    {
      title: "Tổng doanh thu",
      value: summary?.revenue.value.toLocaleString("vi-VN") + "đ",
      icon: <MdAttachMoney size={24} color="#16a34a" />,
      change: summary?.revenue.change + "%",
      label: summary?.revenue.label,
      isPositive: (summary?.revenue.change || 0) >= 0,
      iconBg: "#f0fdf4",
    },
    {
      title: "Học viên mới",
      value: summary?.students.total.toLocaleString("vi-VN"),
      icon: <MdPersonAdd size={24} color="#2563eb" />,
      change: summary?.students.change + "%",
      label: summary?.students.label,
      isPositive: (summary?.students.change || 0) >= 0,
      iconBg: "#eff6ff",
    },
    {
      title: "Bài học đang mở",
      value: summary?.lessons.total.toLocaleString("vi-VN"),
      icon: <MdPlayCircle size={24} color="#7c3aed" />,
      change: summary?.lessons.status,
      label: summary?.lessons.label,
      isPositive: true,
      iconBg: "#f5f3ff",
    },
    {
      title: "Tỷ lệ hoàn thành",
      value: summary?.completion.rate + "%",
      icon: <MdCheckCircle size={24} color="#059669" />,
      change: summary?.completion.change + "%",
      label: summary?.completion.label,
      isPositive: (summary?.completion.change || 0) >= 0,
      iconBg: "#ecfdf5",
    },
  ];

  const columns = [
    {
      title: "HỌC VIÊN",
      key: "student",
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            src={record.user_submission_id?.avatar}
            style={{ backgroundColor: "#2563eb" }}>
            {record.user_submission_id?.name?.charAt(0)}
          </Avatar>
          <div>
            <Text strong>{record.user_submission_id?.name || "N/A"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.user_submission_id?.email || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "KHÓA HỌC",
      key: "course",
      render: (_: any, record: any) => record.landing_page_id?.title || "N/A",
    },
    {
      title: "NGÀY ĐĂNG KÝ",
      key: "date",
      render: (_: any, record: any) =>
        record.paid_at ? dayjs(record.paid_at).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color = status === "completed" ? "success" : "warning";
        const text = status === "completed" ? "Hoàn thành" : "Chờ thanh toán";
        return (
          <Tag color={color} style={{ borderRadius: 12, padding: "0 12px" }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "SỐ TIỀN",
      dataIndex: "total_amount",
      key: "amount",
      align: "right" as const,
      render: (amount: number) => (
        <Text strong>{amount?.toLocaleString("vi-VN")}đ</Text>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Space
        direction="vertical"
        size={24}
        style={{ width: "100%", padding: "24px 0" }}>
        {/* Stats Cards */}
        <Row gutter={[24, 24]}>
          {statsCards.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: 16,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
                styles={{ body: { padding: "24px" } }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}>
                  <div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 14, fontWeight: 500 }}>
                      {stat.title}
                    </Text>
                    <Title
                      level={3}
                      style={{ margin: "8px 0", fontWeight: 700 }}>
                      {stat.value}
                    </Title>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: stat.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                    {stat.icon}
                  </div>
                </div>
                <Space style={{ marginTop: 12 }}>
                  <Tag
                    icon={
                      stat.isPositive ? <MdTrendingUp /> : <MdTrendingDown />
                    }
                    color={stat.isPositive ? "success" : "error"}
                    bordered={false}
                    style={{
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                    {stat.change}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {stat.label}
                  </Text>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts Row */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              variant="borderless"
              style={{
                borderRadius: 16,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
              title={
                <div style={{ padding: "8px 0" }}>
                  <Title level={4} style={{ margin: 0 }}>
                    Tổng quan doanh thu
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Hiệu suất kinh doanh trong 30 ngày qua
                  </Text>
                </div>
              }
              extra={
                <Select
                  value={timeRange}
                  variant="borderless"
                  style={{ width: 120 }}
                  onChange={(val) => setTimeRange(val)}>
                  <Select.Option value={30}>30 ngày qua</Select.Option>
                  <Select.Option value={7}>7 ngày qua</Select.Option>
                </Select>
              }>
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1">
                        <stop
                          offset="5%"
                          stopColor="#2563eb"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563eb"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={{ stroke: "#f1f5f9" }}
                      tickLine={{ stroke: "#f1f5f9" }}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={10}
                      tickFormatter={(value) => dayjs(value).format("DD/MM")}
                    />
                    <YAxis
                      axisLine={{ stroke: "#f1f5f9" }}
                      tickLine={{ stroke: "#f1f5f9" }}
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}Tr`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: any) => [
                        value?.toLocaleString("vi-VN") + "đ",
                        "Doanh thu",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              variant="borderless"
              style={{
                borderRadius: 16,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                height: "100%",
              }}
              title={
                <div style={{ padding: "8px 0" }}>
                  <Title level={4} style={{ margin: 0 }}>
                    Nguồn truy cập
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Người dùng đến từ đâu
                  </Text>
                </div>
              }>
              <div
                style={{
                  position: "relative",
                  height: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSources as any[]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count">
                      {trafficSources?.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: "absolute", textAlign: "center" }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {trafficSources?.[0]?.percent || 0}%
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {trafficSources?.[0]?.name || "N/A"}
                  </Text>
                </div>
              </div>

              <Space
                direction="vertical"
                style={{ width: "100%", marginTop: 24 }}
                size={16}>
                {trafficSources?.map((source, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                    <Space>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: COLORS[index % COLORS.length],
                        }}
                      />
                      <Text style={{ fontSize: 13 }}>{source.name}</Text>
                    </Space>
                    <Text strong style={{ fontSize: 13 }}>
                      {source.percent}%
                    </Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Recent Orders Table */}
        <Card
          variant="borderless"
          style={{ borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          title={
            <div style={{ padding: "8px 0" }}>
              <Title level={4} style={{ margin: 0 }}>
                Đơn hàng gần đây
              </Title>
            </div>
          }
          extra={<Button type="link">Xem tất cả</Button>}>
          <Table
            dataSource={recentPayments}
            columns={columns}
            pagination={false}
            rowKey="_id"
          />
        </Card>
      </Space>

      <style>{`
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-table-tbody > tr > td {
          padding: 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-card-head {
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-select-selector {
          font-weight: 600 !important;
          color: #1e293b !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
