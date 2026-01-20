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
} from "antd";
import {
  MdShoppingCart,
  MdAttachMoney,
  MdTrendingUp,
  MdToday,
} from "react-icons/md";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import salerApi from "../api/salerApi";

const { Title, Text } = Typography;

export default function SalerDashboardPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch dashboard data
  const { data, isLoading, error } = useQuery({
    queryKey: ["saler-dashboard"],
    queryFn: () => salerApi.getDashboard(),
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

      {/* Revenue Chart */}
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          Doanh thu 30 ngày gần nhất
        </Title>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.chart_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? "end" : "middle"}
            />
            <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ color: "#000" }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </DashboardLayout>
  );
}
