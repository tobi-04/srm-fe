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
  Avatar,
} from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { MdSchool } from "react-icons/md";
import { courseApi } from "../api/courseApi";
import { useNavigate } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import { motion } from "framer-motion";
import SEO from "../components/common/SEO";

const { Title, Text, Paragraph } = Typography;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const CoursesPage: React.FC = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    search: "",
  });

  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseApi.getCourses(params).then((res) => res.data),
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
        title="Danh sách khóa học"
        description="Khám phá các khóa học chất lượng cao về đầu tư, tài chính và phát triển kỹ năng tại SRM Lesson."
      />
      <PublicLayout>
        {/* Hero Section */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "60px 5% 80px",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.05)",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />

          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Row gutter={[40, 40]} align="middle">
              <Col xs={24} md={14}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Tag
                    color="blue"
                    style={{
                      marginBottom: "16px",
                      padding: "4px 12px",
                      borderRadius: "100px",
                      fontWeight: "bold",
                      border: "none",
                      background: "#e0f2fe",
                      color: "#3b82f6",
                    }}
                  >
                    <MdSchool style={{ marginRight: 4 }} />
                    HỌC TẬP KHÔNG GIỚI HẠN
                  </Tag>
                  <Title
                    style={{
                      fontSize: "48px",
                      fontWeight: 900,
                      marginBottom: "24px",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      color: colors.slate800,
                    }}
                  >
                    Khóa Học Tài Chính <br />
                    <span style={{ color: "#3b82f6" }}>
                      Từ Cơ Bản Đến Nâng Cao
                    </span>
                  </Title>
                  <Paragraph
                    style={{
                      fontSize: "18px",
                      color: colors.slate600,
                      maxWidth: "600px",
                      marginBottom: "32px",
                      lineHeight: 1.6,
                    }}
                  >
                    Học từ các chuyên gia hàng đầu với nội dung cập nhật liên
                    tục. Truy cập trọn đời, học mọi lúc mọi nơi.
                  </Paragraph>
                  <Input
                    placeholder="Tìm khóa học bạn cần..."
                    prefix={
                      <SearchOutlined
                        style={{ color: colors.slate400, marginRight: 8 }}
                      />
                    }
                    size="large"
                    style={{
                      maxWidth: "500px",
                      height: "56px",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      border: "1px solid #e2e8f0",
                    }}
                    onPressEnter={(e) =>
                      handleSearch((e.target as HTMLInputElement).value)
                    }
                  />
                </motion.div>
              </Col>
              <Col xs={0} md={10} style={{ textAlign: "right" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 350,
                      borderRadius: 24,
                      background:
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <MdSchool style={{ fontSize: 100, color: "#3b82f6" }} />
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Courses Grid */}
        <section style={{ padding: "80px 5%", background: "#fff" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "48px",
              }}
            >
              <div>
                <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                  Tất cả khóa học
                </Title>
                <Text type="secondary">
                  Tìm thấy {data?.meta?.total || 0} khóa học phù hợp
                </Text>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Tag
                  color="blue"
                  style={{
                    cursor: "pointer",
                    borderRadius: "6px",
                    padding: "4px 12px",
                  }}
                >
                  Mới nhất
                </Tag>
                <Tag
                  style={{
                    cursor: "pointer",
                    borderRadius: "6px",
                    padding: "4px 12px",
                  }}
                >
                  Phổ biến
                </Tag>
                <Tag
                  style={{
                    cursor: "pointer",
                    borderRadius: "6px",
                    padding: "4px 12px",
                  }}
                >
                  Miễn phí
                </Tag>
              </div>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <Spin size="large" tip="Đang tải danh sách khóa học..." />
              </div>
            ) : data?.data?.length > 0 ? (
              <>
                <Row gutter={[32, 40]}>
                  {data.data.map((course: any, idx: number) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                      >
                        <Card
                          hoverable
                          onClick={() => navigate(`/landing/${course.slug}`)}
                          cover={
                            <div
                              style={{
                                height: 180,
                                background:
                                  "linear-gradient(135deg, #3b82f620, #9333ea20)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {course.thumbnail ? (
                                <img
                                  src={course.thumbnail}
                                  alt={course.title}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <MdSchool
                                  style={{
                                    fontSize: 64,
                                    color: "#3b82f6",
                                    opacity: 0.6,
                                  }}
                                />
                              )}
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
                            {course.title}
                          </Title>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{
                              color: colors.slate500,
                              fontSize: 14,
                              marginBottom: 16,
                            }}
                          >
                            {course.description || "Khóa học chuyên sâu"}
                          </Paragraph>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 12,
                            }}
                          >
                            <Avatar
                              size="small"
                              icon={<UserOutlined />}
                              src={course.instructor?.avatar}
                            />
                            <Text
                              type="secondary"
                              style={{ fontSize: 13 }}
                              ellipsis
                            >
                              {course.instructor?.name || "Giảng viên"}
                            </Text>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              {course.price > 0 ? (
                                <Text
                                  strong
                                  style={{ fontSize: 18, color: "#3b82f6" }}
                                >
                                  {formatPrice(course.price)}
                                </Text>
                              ) : (
                                <Tag color="green">Miễn phí</Tag>
                              )}
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
                <div style={{ textAlign: "center", marginTop: "64px" }}>
                  <Pagination
                    current={params.page}
                    pageSize={params.limit}
                    total={data.meta?.total || 0}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: "80px 0",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: "32px",
                }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div style={{ marginTop: "16px" }}>
                      <Title level={4} style={{ margin: 0 }}>
                        Không tìm thấy khóa học nào
                      </Title>
                      <Text type="secondary">
                        Cần thử từ khóa khác hoặc quay lại sau
                      </Text>
                    </div>
                  }
                />
                <Button
                  type="primary"
                  style={{ marginTop: "24px" }}
                  onClick={() => handleSearch("")}
                >
                  Xem tất cả khóa học
                </Button>
              </div>
            )}
          </div>
        </section>
      </PublicLayout>
    </ConfigProvider>
  );
};

export default CoursesPage;
