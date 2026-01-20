import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Table,
  Button,
  message,
  Spin,
  Alert,
  Tag,
  Tooltip,
} from "antd";
import { MdLink, MdContentCopy } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import salerApi, { SalerCourse } from "../api/salerApi";

const { Title, Text } = Typography;

export default function SalerReferralLinksPage() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch courses
  const { data, isLoading, error } = useQuery({
    queryKey: ["saler-courses"],
    queryFn: () => salerApi.getCourses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Responsive listener
  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  // Copy to clipboard
  const handleCopy = (link: string, courseTitle: string) => {
    navigator.clipboard.writeText(link).then(() => {
      message.success(`Đã copy link khóa học "${courseTitle}"`);
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const columns = [
    {
      title: "Khóa học",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: SalerCourse) => (
        <div>
          <Text strong style={{ fontSize: 14 }}>
            {text}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            /{record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      render: (price: number) => (
        <Text strong style={{ color: "#1e293b" }}>
          {formatCurrency(price)}
        </Text>
      ),
    },
    {
      title: "Hoa hồng",
      dataIndex: "commission_rate",
      key: "commission_rate",
      render: (rate: number) => (
        <Tag color="green" style={{ borderRadius: 4, fontWeight: "bold" }}>
          {rate}%
        </Tag>
      ),
    },
    {
      title: "Link giới thiệu",
      dataIndex: "referral_link",
      key: "referral_link",
      render: (_: string, record: SalerCourse) => {
        const link = `${window.location.origin}/landing/${record._id}?ref=${record.referral_code}`;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tooltip title={link}>
              <div
                style={{
                  maxWidth: isMobile ? 120 : 250,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  background: "#f8fafc",
                  padding: "4px 8px",
                  borderRadius: 4,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  color: "#64748b",
                }}>
                {link}
              </div>
            </Tooltip>
            <Button
              size="small"
              type="text"
              icon={<MdContentCopy size={16} />}
              onClick={() => handleCopy(link, record.title)}
              style={{ color: "#3b82f6" }}
            />
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <DashboardLayout>
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải danh sách khóa học. Vui lòng thử lại."
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

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={isMobile ? 3 : 2} className="page-title">
          <MdLink style={{ marginRight: 8 }} />
          Link giới thiệu
        </Title>
        <Text className="page-subtitle">
          Quản lý khóa học và sao chép link để chia sẻ với khách hàng
        </Text>
      </div>

      <Card
        bodyStyle={{ padding: 0 }}
        style={{ borderRadius: 12, overflow: "hidden" }}>
        <Table
          columns={columns}
          dataSource={data.data}
          rowKey="_id"
          pagination={false}
          locale={{
            emptyText: (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <MdLink
                  size={64}
                  style={{ color: "#cbd5e1", marginBottom: 16 }}
                />
                <Title level={4} type="secondary">
                  Chưa có khóa học được phân bổ
                </Title>
                <Text type="secondary">
                  Vui lòng liên hệ Admin để được phân bổ khóa học
                </Text>
              </div>
            ),
          }}
          scroll={{ x: isMobile ? 600 : undefined }}
        />
      </Card>
    </DashboardLayout>
  );
}
