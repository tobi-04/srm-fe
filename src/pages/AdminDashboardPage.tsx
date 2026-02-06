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
  MdPerson,
} from "react-icons/md";
import { getAvatarStyles } from "../utils/color";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { adminAnalyticsApi, TopSaler } from "../api/adminAnalyticsApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const COLORS = ["#10b981", "#8b5cf6", "#34d399", "#a78bfa"];

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<number>(7);
  const [salerPeriod, setSalerPeriod] = useState<"month" | "quarter" | "year">(
    "month",
  );
  const navigate = useNavigate();

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

  const { data: topSalers, isLoading: topSalersLoading } = useQuery({
    queryKey: ["admin-top-salers", salerPeriod],
    queryFn: () => adminAnalyticsApi.getTopSalers(salerPeriod, 3),
  });

  const { data: dailySales } = useQuery({
    queryKey: ["admin-daily-sales"],
    queryFn: () => adminAnalyticsApi.getDailySalesSnapshot(14),
  });

  const { data: weeklySales } = useQuery({
    queryKey: ["admin-weekly-sales"],
    queryFn: () => adminAnalyticsApi.getWeeklySalesSnapshot(4),
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
      title: "LOẠI",
      key: "type",
      width: 90,
      render: (_: any, record: any) => {
        const typeMap: Record<string, { label: string; color: string }> = {
          course: { label: "Khóa học", color: "blue" },
          book: { label: "Sách", color: "green" },
          indicator: { label: "Indicator", color: "purple" },
        };
        const typeInfo = typeMap[record.type] || {
          label: "Khác",
          color: "default",
        };
        return (
          <Tag color={typeInfo.color} style={{ borderRadius: 6 }}>
            {typeInfo.label}
          </Tag>
        );
      },
    },
    {
      title: "KHÁCH HÀNG",
      key: "customer",
      render: (_: any, record: any) => (
        <Space>
          <Avatar
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              ...getAvatarStyles(record.customer_name || record._id),
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
            }}
          >
            {record.customer_name ? (
              record.customer_name.substring(0, 2).toUpperCase()
            ) : (
              <MdPerson />
            )}
          </Avatar>
          <div>
            <Text strong>{record.customer_name || "N/A"}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.customer_email || "N/A"}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "SẢN PHẨM",
      key: "item",
      render: (_: any, record: any) => record.item_name || "N/A",
    },
    {
      title: "NGÀY THANH TOÁN",
      key: "date",
      render: (_: any, record: any) =>
        record.paid_at ? dayjs(record.paid_at).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusLower = status?.toLowerCase();
        const isCompleted =
          statusLower === "completed" ||
          statusLower === "paid" ||
          status === "COMPLETED";
        const text = isCompleted ? "Hoàn thành" : "Chờ thanh toán";
        return (
          <Tag
            color={isCompleted ? "success" : "warning"}
            style={{ borderRadius: 12, padding: "0 12px" }}
          >
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
      render: (_: any, record: any) => (
        <Text strong>
          {(record.total_amount || record.amount)?.toLocaleString("vi-VN")}đ
        </Text>
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
          }}
        >
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
        style={{ width: "100%", padding: "24px 0" }}
      >
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
                styles={{ body: { padding: "24px" } }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 14, fontWeight: 500 }}
                    >
                      {stat.title}
                    </Text>
                    <Title
                      level={3}
                      style={{ margin: "8px 0", fontWeight: 700 }}
                    >
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
                    }}
                  >
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
                    }}
                  >
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
                  onChange={(val) => setTimeRange(val)}
                >
                  <Select.Option value={30}>30 ngày qua</Select.Option>
                  <Select.Option value={7}>7 ngày qua</Select.Option>
                </Select>
              }
            >
              <div style={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
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
                      tickFormatter={(value) => {
                        if (value >= 1000000)
                          return `${(value / 1000000).toFixed(1)}Tr`;
                        if (value >= 1000)
                          return `${(value / 1000).toFixed(0)}k`;
                        return value.toString();
                      }}
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
                      stroke="#10b981"
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
              }
            >
              <div
                style={{
                  position: "relative",
                  height: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSources as any[]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                    >
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
                size={16}
              >
                {trafficSources?.map((source, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
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

        {/* Top Salers Row */}
        <Card
          variant="borderless"
          style={{ borderRadius: 16, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
          title={
            <div style={{ padding: "8px 0" }}>
              <Title level={4} style={{ margin: 0 }}>
                Top Salers đạt KPI
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Xếp hạng theo % vượt KPI
              </Text>
            </div>
          }
          extra={
            <Space>
              <Select
                value={salerPeriod}
                variant="borderless"
                style={{ width: 100 }}
                onChange={(val) => setSalerPeriod(val)}
              >
                <Select.Option value="month">Tháng</Select.Option>
                <Select.Option value="quarter">Quý</Select.Option>
                <Select.Option value="year">Năm</Select.Option>
              </Select>
              <Button type="link" onClick={() => navigate("/admin/salers")}>
                Xem tất cả
              </Button>
            </Space>
          }
        >
          {topSalersLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : topSalers && topSalers.length > 0 ? (
            <Row gutter={[24, 24]}>
              {/* Reorder: 2nd, 1st, 3rd */}
              {[topSalers[1], topSalers[0], topSalers[2]]
                .filter(Boolean)
                .map((saler: TopSaler, displayIndex: number) => {
                  // Original index (0 = 1st place, 1 = 2nd place, 2 = 3rd place)
                  const originalIndex =
                    displayIndex === 0 ? 1 : displayIndex === 1 ? 0 : 2;

                  // Color scheme based on ranking
                  const colorScheme =
                    originalIndex === 0
                      ? { bg: "#fff7ed", text: "#ea580c", border: "#fdba74" } // Orange for 1st
                      : originalIndex === 1
                        ? { bg: "#dbeafe", text: "#2563eb", border: "#93c5fd" } // Blue for 2nd
                        : { bg: "#dbeafe", text: "#2563eb", border: "#93c5fd" }; // Blue for 3rd

                  return (
                    <Col xs={24} md={8} key={saler.saler_id}>
                      <Card
                        size="small"
                        style={{
                          borderRadius: 12,
                          background: colorScheme.bg,
                          border: `2px solid ${colorScheme.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <Avatar
                            src={saler.avatar}
                            size={48}
                            style={{
                              ...getAvatarStyles(saler.name),
                              fontWeight: "bold",
                              border: `2px solid ${colorScheme.border}`,
                            }}
                          >
                            {saler.name?.substring(0, 2).toUpperCase()}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Text
                              strong
                              style={{
                                display: "block",
                                color: colorScheme.text,
                              }}
                            >
                              {originalIndex === 0
                                ? "🥇 "
                                : originalIndex === 1
                                  ? "🥈 "
                                  : "🥉 "}
                              {saler.name}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {saler.total_orders} đơn hàng
                            </Text>
                          </div>
                        </div>
                        <div style={{ marginTop: 16 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 4,
                            }}
                          >
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              KPI
                            </Text>
                            <Text
                              strong
                              style={{
                                color: colorScheme.text,
                              }}
                            >
                              {saler.completion_percentage.toFixed(1)}%
                            </Text>
                          </div>
                          <div
                            style={{
                              height: 8,
                              background: "#e5e7eb",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min(saler.completion_percentage, 100)}%`,
                                background: colorScheme.text,
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          {saler.exceeded_by > 0 && (
                            <Text
                              style={{
                                fontSize: 11,
                                color: colorScheme.text,
                                marginTop: 4,
                                display: "block",
                              }}
                            >
                              Vượt +{saler.exceeded_by.toFixed(1)}%
                            </Text>
                          )}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
            </Row>
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Text type="secondary">Chưa có dữ liệu</Text>
            </div>
          )}
        </Card>

        {/* Sales Snapshots Row */}
        <Row gutter={[24, 24]}>
          {/* Weekly Sales Snapshot */}
          <Col xs={24} lg={12}>
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
                    DOANH THU THEO TUẦN
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Doanh thu 4 tuần gần đây
                  </Text>
                </div>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Table
                  dataSource={weeklySales}
                  pagination={false}
                  size="small"
                  rowKey="weekEnding"
                  columns={[
                    {
                      title: "TUẦN KẾT THÚC",
                      dataIndex: "weekEnding",
                      key: "weekEnding",
                      width: "35%",
                      render: (date: string) => (
                        <Text style={{ fontWeight: 500 }}>
                          {dayjs(date).format("DD/MM/YYYY")}
                        </Text>
                      ),
                    },
                    {
                      title: "KHOẢNG",
                      dataIndex: "weekLabel",
                      key: "weekLabel",
                      width: "35%",
                      render: (label: string) => {
                        const [start, end] = label.split(" - ");
                        return (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(start).format("DD/MM")} -{" "}
                            {dayjs(end).format("DD/MM")}
                          </Text>
                        );
                      },
                    },
                    {
                      title: "DOANH THU",
                      dataIndex: "revenue",
                      key: "revenue",
                      align: "right" as const,
                      width: "30%",
                      render: (revenue: number) => (
                        <Text strong style={{ fontSize: 14 }}>
                          {revenue.toLocaleString("vi-VN")}đ
                        </Text>
                      ),
                    },
                  ]}
                />
              </div>

              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySales?.slice().reverse()}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="weekEnding"
                      axisLine={{ stroke: "#f1f5f9" }}
                      tickLine={{ stroke: "#f1f5f9" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(value) => dayjs(value).format("DD/MM")}
                    />
                    <YAxis
                      axisLine={{ stroke: "#f1f5f9" }}
                      tickLine={{ stroke: "#f1f5f9" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000)
                          return `${(value / 1000000).toFixed(1)}Tr`;
                        if (value >= 1000)
                          return `${(value / 1000).toFixed(0)}k`;
                        return `${value}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: any) => [
                        `${value?.toLocaleString("vi-VN")}đ`,
                        "Doanh thu",
                      ]}
                      labelFormatter={(value) =>
                        `Tuần kết thúc: ${dayjs(value).format("DD/MM/YYYY")}`
                      }
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {weeklySales
                        ?.slice()
                        .reverse()
                        .map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index % 2 === 0 ? "#10b981" : "#8b5cf6"}
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Daily Sales Snapshot */}
          <Col xs={24} lg={12}>
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
                    DOANH THU THEO NGÀY
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Doanh thu 14 ngày gần đây
                  </Text>
                </div>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Table
                  dataSource={dailySales?.slice(0, 7).sort((a, b) => {
                    const dayOrder: Record<string, number> = {
                      Mon: 1,
                      Tue: 2,
                      Wed: 3,
                      Thu: 4,
                      Fri: 5,
                      Sat: 6,
                      Sun: 7,
                    };
                    return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
                  })}
                  pagination={false}
                  size="small"
                  rowKey="date"
                  columns={[
                    {
                      title: "THỨ",
                      dataIndex: "dayOfWeek",
                      key: "dayOfWeek",
                      width: "15%",
                      render: (day: string) => {
                        const viDays: Record<string, string> = {
                          Mon: "T2",
                          Tue: "T3",
                          Wed: "T4",
                          Thu: "T5",
                          Fri: "T6",
                          Sat: "T7",
                          Sun: "CN",
                        };
                        return (
                          <Text style={{ fontWeight: 500 }}>
                            {viDays[day] || day}
                          </Text>
                        );
                      },
                    },
                    {
                      title: "NGÀY",
                      dataIndex: "date",
                      key: "date",
                      width: "20%",
                      render: (date: string) => (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(date).format("DD/MM")}
                        </Text>
                      ),
                    },
                    {
                      title: "XU HƯỚNG",
                      key: "trend",
                      width: "35%",
                      render: (_: any, record: any) => {
                        const maxRevenue = Math.max(
                          ...(dailySales?.map((d) => d.revenue) || [1]),
                        );
                        const width = (record.revenue / maxRevenue) * 100;
                        const dayColors: Record<string, string> = {
                          Mon: "#10b981", // Green
                          Tue: "#8b5cf6", // Purple
                          Wed: "#10b981", // Green
                          Thu: "#8b5cf6", // Purple
                          Fri: "#10b981", // Green
                          Sat: "#8b5cf6", // Purple
                          Sun: "#10b981", // Green
                        };
                        return (
                          <div
                            style={{
                              height: 20,
                              background:
                                dayColors[record.dayOfWeek] || "#10b981",
                              width: `${width}%`,
                              borderRadius: 4,
                              minWidth: width > 0 ? 20 : 0,
                            }}
                          />
                        );
                      },
                    },
                    {
                      title: "DOANH THU",
                      dataIndex: "revenue",
                      key: "revenue",
                      align: "right" as const,
                      width: "30%",
                      render: (revenue: number) => (
                        <Text strong style={{ fontSize: 14 }}>
                          {revenue.toLocaleString("vi-VN")}đ
                        </Text>
                      ),
                    },
                  ]}
                />
              </div>

              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailySales?.slice(0, 14).sort((a, b) => {
                      const dayOrder: Record<string, number> = {
                        Mon: 1,
                        Tue: 2,
                        Wed: 3,
                        Thu: 4,
                        Fri: 5,
                        Sat: 6,
                        Sun: 7,
                      };
                      return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
                    })}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={{ stroke: "#f1f5f9" }}
                      tickLine={{ stroke: "#f1f5f9" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(value) => dayjs(value).format("DD/MM")}
                    />
                    <YAxis
                      axisLine={{ stroke: "#f1f5f9" }}
                      tickLine={{ stroke: "#f1f5f9" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(value) => {
                        if (value >= 1000000)
                          return `${(value / 1000000).toFixed(1)}Tr`;
                        if (value >= 1000)
                          return `${(value / 1000).toFixed(0)}k`;
                        return `${value}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: any) => [
                        `${value?.toLocaleString("vi-VN")}đ`,
                        "Doanh thu",
                      ]}
                      labelFormatter={(value) =>
                        dayjs(value).format("dddd, DD/MM/YYYY")
                      }
                    />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                      {dailySales
                        ?.slice(0, 14)
                        .sort((a, b) => {
                          const dayOrder: Record<string, number> = {
                            Mon: 1,
                            Tue: 2,
                            Wed: 3,
                            Thu: 4,
                            Fri: 5,
                            Sat: 6,
                            Sun: 7,
                          };
                          return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
                        })
                        .map((entry, index) => {
                          const dayColors: Record<string, string> = {
                            Mon: "#10b981", // Green
                            Tue: "#8b5cf6", // Purple
                            Wed: "#10b981", // Green
                            Thu: "#8b5cf6", // Purple
                            Fri: "#10b981", // Green
                            Sat: "#8b5cf6", // Purple
                            Sun: "#10b981", // Green
                          };
                          return (
                            <Cell
                              key={`cell-${index}`}
                              fill={dayColors[entry.dayOfWeek] || "#10b981"}
                            />
                          );
                        })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
          extra={
            <Button type="link" onClick={() => navigate("/admin/orders")}>
              Xem tất cả
            </Button>
          }
        >
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
