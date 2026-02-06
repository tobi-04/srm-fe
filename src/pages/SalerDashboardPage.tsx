import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Spin,
  Alert,
  Select,
} from "antd";
import {
  MdShoppingCart,
  MdAttachMoney,
  MdTrendingUp,
  MdToday,
} from "react-icons/md";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import salerApi from "../api/salerApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function SalerDashboardPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [timeRange, setTimeRange] = useState<number>(7); // Default to week

  // Fetch dashboard data with time range
  const { data, isLoading, error } = useQuery({
    queryKey: ["saler-dashboard", timeRange],
    queryFn: () => salerApi.getDashboard(timeRange),
    staleTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
  });

  // Responsive listener
  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  if (error) {
    return (
      <DashboardLayout>
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải dữ liệu dashboard. Vui lòng thử lại."
          type="error"
          showIcon
        />
      </DashboardLayout>
    );
  }

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={isMobile ? 3 : 2} className="page-title">
          Dashboard Saler
        </Title>
        <Text className="page-subtitle">
          Tổng quan doanh số, đơn hàng và hoa hồng của bạn
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn hôm nay"
              value={data.orders_today}
              prefix={<MdToday style={{ color: "#3b82f6" }} />}
              valueStyle={{ color: "#3b82f6" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đơn tháng này"
              value={data.orders_month}
              prefix={<MdShoppingCart style={{ color: "#10b981" }} />}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={formatCurrency(data.total_revenue)}
              prefix={<MdTrendingUp style={{ color: "#8b5cf6" }} />}
              valueStyle={{ color: "#8b5cf6", fontSize: isMobile ? 18 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng hoa hồng"
              value={formatCurrency(data.total_commission)}
              prefix={<MdAttachMoney style={{ color: "#f59e0b" }} />}
              valueStyle={{ color: "#f59e0b", fontSize: isMobile ? 18 : 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* KPI Progress */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Hoàn thành KPI tháng này
        </Title>
        <Progress
          percent={Math.min(data.kpi_completion, 100)}
          status={data.kpi_completion >= 100 ? "success" : "active"}
          strokeColor={{
            "0%": "#10b981",
            "100%": "#3b82f6",
          }}
        />
        <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
          {data.kpi_completion >= 100
            ? "Chúc mừng! Bạn đã hoàn thành KPI tháng này 🎉"
            : `Còn ${(100 - data.kpi_completion).toFixed(1)}% để đạt mục tiêu`}
        </Text>
      </Card>

      {/* Revenue Chart with gradient */}
      <Card
        title={
          <div style={{ padding: "8px 0" }}>
            <Title level={4} style={{ margin: 0 }}>
              Doanh thu
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Biểu đồ doanh số theo thời gian
            </Text>
          </div>
        }
        extra={
          <Select
            value={timeRange}
            variant="borderless"
            style={{ width: 120 }}
            onChange={(val) => setTimeRange(val)}>
            <Select.Option value={7}>7 ngày qua</Select.Option>
            <Select.Option value={30}>30 ngày qua</Select.Option>
          </Select>
        }
        style={{
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.chart_data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
              dy={10}
              tickFormatter={(value) => dayjs(value).format("DD/MM")}
            />
            <YAxis
              axisLine={{ stroke: "#f1f5f9" }}
              tickLine={{ stroke: "#f1f5f9" }}
              tick={{ fill: "#64748b", fontSize: isMobile ? 10 : 12 }}
              tickFormatter={(value) => {
                if (value >= 1000000)
                  return `${(value / 1000000).toFixed(1)}Tr`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toString();
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number | undefined) =>
                value !== undefined
                  ? [formatCurrency(value), "Doanh thu"]
                  : ["", ""]
              }
              labelFormatter={(label) => dayjs(label).format("DD/MM/YYYY")}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              activeDot={{
                r: 6,
                fill: "#3b82f6",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <style>{`
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
