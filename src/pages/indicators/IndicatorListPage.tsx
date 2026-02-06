import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Row,
  Col,
  Input,
  Pagination,
  Spin,
  Empty,
  ConfigProvider,
  Button,
  Card,
  Tag,
} from "antd";
import { SearchOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { MdShowChart } from "react-icons/md";
import { indicatorApi, Indicator } from "../../api/indicatorApi";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import { motion } from "framer-motion";
import SEO from "../../components/common/SEO";

const { Title, Text, Paragraph } = Typography;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const IndicatorListPage: React.FC = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    search: "",
  });

  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["indicators", params],
    queryFn: () => indicatorApi.getAll(params).then((res) => res.data),
  });

  const handleSearch = (value: string) => {
    setParams({ ...params, search: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
  };

  const colors = {
    primary: "#f78404",
    highlight: "#fb9d14",
    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate200: "#e2e8f0",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",
    white: "#ffffff",
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
          borderRadius: 12,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <SEO
        title="Công cụ Trading & Indicators"
        description="Thuê các công cụ phân tích kỹ thuật (indicators) chuyên nghiệp để tối ưu hóa hiệu quả giao dịch của bạn."
      />
      <PublicLayout>
        <div style={{ padding: "40px 5%", background: colors.slate50 }}>
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <Tag
              color="orange"
              style={{
                padding: "4px 16px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              <ThunderboltOutlined /> TRADING SIGNALS & TOOLS
            </Tag>
            <Title
              level={1}
              style={{
                fontSize: "clamp(32px, 5vw, 48px)",
                fontWeight: 800,
                color: colors.slate800,
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}
            >
              Thuê Indicator từ Chuyên Gia
            </Title>
            <Paragraph
              style={{
                fontSize: 18,
                color: colors.slate500,
                maxWidth: 600,
                margin: "0 auto 32px",
              }}
            >
              Truy cập signals và công cụ trading chuyên nghiệp với mức giá
              subscription hợp lý. Hủy bất cứ lúc nào.
            </Paragraph>

            {/* Search */}
            <Input
              placeholder="Tìm kiếm indicator..."
              prefix={<SearchOutlined style={{ color: colors.slate400 }} />}
              size="large"
              style={{
                maxWidth: 500,
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </motion.div>

          {/* Indicator Grid */}
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <Spin size="large" />
            </div>
          ) : data?.data?.length === 0 ? (
            <Empty description="Chưa có indicator nào" />
          ) : (
            <>
              <Row gutter={[24, 24]}>
                {data?.data?.map((indicator: Indicator, index: number) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={indicator._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        hoverable
                        onClick={() =>
                          navigate(`/indicators/${indicator.slug}`)
                        }
                        cover={
                          <div
                            style={{
                              height: 180,
                              background: `linear-gradient(135deg, ${colors.primary}20, ${colors.highlight}20)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            {indicator.cover_image ? (
                              <img
                                src={indicator.cover_image}
                                alt={indicator.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <MdShowChart
                                style={{
                                  fontSize: 64,
                                  color: colors.primary,
                                  opacity: 0.6,
                                }}
                              />
                            )}
                            <Tag
                              color="orange"
                              style={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                fontWeight: 600,
                              }}
                            >
                              Subscription
                            </Tag>
                          </div>
                        }
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          border: "none",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                        }}
                        bodyStyle={{ padding: 20 }}
                      >
                        <Title
                          level={5}
                          ellipsis
                          style={{
                            margin: 0,
                            marginBottom: 8,
                            color: colors.slate800,
                          }}
                        >
                          {indicator.name}
                        </Title>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{
                            color: colors.slate500,
                            fontSize: 14,
                            marginBottom: 16,
                          }}
                        >
                          {indicator.description ||
                            "Thuê indicator chuyên nghiệp"}
                        </Paragraph>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <Text
                              strong
                              style={{
                                fontSize: 20,
                                color: colors.primary,
                              }}
                            >
                              {formatPrice(indicator.price_monthly)}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.slate400,
                              }}
                            >
                              /tháng
                            </Text>
                          </div>
                          <Button type="primary" size="small">
                            Xem chi tiết
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {data?.meta && data.meta.totalPages > 1 && (
                <div style={{ textAlign: "center", marginTop: 48 }}>
                  <Pagination
                    current={params.page}
                    total={data.meta.total}
                    pageSize={params.limit}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </PublicLayout>
    </ConfigProvider>
  );
};

export default IndicatorListPage;
