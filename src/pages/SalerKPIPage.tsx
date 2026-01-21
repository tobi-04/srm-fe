import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  DatePicker,
  Space,
  Empty,
} from "antd";
import { MdTrendingUp, MdFlag, MdShowChart } from "react-icons/md";
import dayjs from "dayjs";
import DashboardLayout from "../components/DashboardLayout";
import salerApi from "../api/salerApi";

const { Title, Text } = Typography;

export default function SalerKPIPage() {
  const [period, setPeriod] = useState(dayjs().format("YYYY-MM"));

  const { data, isLoading } = useQuery({
    queryKey: ["saler-kpi", period],
    queryFn: () => salerApi.getKPI(period),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>KPI & Mục tiêu</Title>
        <Text type="secondary">
          Theo dõi tiến độ hoàn thành mục tiêu doanh số hàng tháng
        </Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical">
          <Text strong>Chọn kỳ báo cáo:</Text>
          <DatePicker
            picker="month"
            defaultValue={dayjs()}
            format="MM/YYYY"
            onChange={(date) =>
              setPeriod(
                date ? date.format("YYYY-MM") : dayjs().format("YYYY-MM"),
              )
            }
            allowClear={false}
          />
        </Space>
      </Card>

      {!data && !isLoading ? (
        <Empty description="Không có dữ liệu KPI cho kỳ này" />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Mục tiêu doanh thu"
                  value={formatCurrency(data?.target_revenue || 0)}
                  prefix={<MdFlag style={{ color: "#3b82f6" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Doanh thu thực tế"
                  value={formatCurrency(data?.actual_revenue || 0)}
                  prefix={<MdTrendingUp style={{ color: "#10b981" }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Tổng số đơn hàng"
                  value={data?.total_orders || 0}
                  prefix={<MdShowChart style={{ color: "#8b5cf6" }} />}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Tiến độ mục tiêu">
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Progress
                type="dashboard"
                percent={Math.round(data?.completion_percentage || 0)}
                strokeColor={{
                  "0%": "#10b981",
                  "100%": "#3b82f6",
                }}
                size={200}
                format={(percent) => `${percent}%`}
              />
              <div style={{ marginTop: 20 }}>
                <Title level={4}>
                  {data?.completion_percentage >= 100
                    ? "Đã đạt mục tiêu!"
                    : `Cần cố gắng thêm ${formatCurrency((data?.target_revenue || 0) - (data?.actual_revenue || 0))} nữa`}
                </Title>
              </div>
            </div>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
}
