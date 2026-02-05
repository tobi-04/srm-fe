import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Space,
  ConfigProvider,
  Tag,
  Statistic,
} from "antd";
import {
  MdSchool,
  MdMenuBook,
  MdTrendingUp,
  MdPeople,
  MdStar,
  MdPlayCircle,
  MdAutoGraph,
  MdBook,
} from "react-icons/md";
import { FaBook, FaChartLine, FaGraduationCap } from "react-icons/fa";
import PublicLayout from "../components/layout/PublicLayout";
import { motion } from "framer-motion";
import SEO from "../components/common/SEO";

const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

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

  const features = [
    {
      icon: <FaGraduationCap style={{ fontSize: 40 }} />,
      title: "Khóa học chuyên sâu",
      description:
        "Học từ các chuyên gia hàng đầu với nội dung cập nhật liên tục",
      color: "#3b82f6",
      path: "/courses",
    },
    {
      icon: <FaBook style={{ fontSize: 40 }} />,
      title: "Sách điện tử",
      description: "Thư viện sách tài chính phong phú, dễ đọc và dễ hiểu",
      color: colors.primary,
      path: "/books",
    },
    {
      icon: <FaChartLine style={{ fontSize: 40 }} />,
      title: "Indicator chuyên nghiệp",
      description:
        "Công cụ phân tích kỹ thuật mạnh mẽ cho trader chuyên nghiệp",
      color: "#722ed1",
      path: "/indicators",
    },
  ];

  const stats = [
    {
      value: 10000,
      suffix: "+",
      title: "Học viên",
      icon: <MdPeople style={{ fontSize: 32, color: colors.primary }} />,
    },
    {
      value: 50,
      suffix: "+",
      title: "Khóa học",
      icon: <MdSchool style={{ fontSize: 32, color: colors.primary }} />,
    },
    {
      value: 100,
      suffix: "+",
      title: "Sách",
      icon: <MdMenuBook style={{ fontSize: 32, color: colors.primary }} />,
    },
    {
      value: 4.9,
      suffix: "/5",
      title: "Đánh giá",
      icon: <MdStar style={{ fontSize: 32, color: colors.primary }} />,
    },
  ];

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
      <PublicLayout>
        <SEO
          title="Nền tảng đào tạo Tài chính & Đầu tư chuyên sâu"
          description="Tham gia các khóa học chất lượng cao, sở hữu các công cụ (indicator) và sách chuyên sâu về tài chính tại SRM FIN-EDU."
        />
        {/* Hero Section */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "80px 5% 100px",
            background: `linear-gradient(135deg, ${colors.slate900} 0%, ${colors.slate800} 100%)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background:
                "radial-gradient(circle at 20% 50%, #f78404 0%, transparent 50%), radial-gradient(circle at 80% 80%, #722ed1 0%, transparent 50%)",
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
            <Row gutter={[48, 48]} align="middle">
              <Col xs={24} md={14}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Tag
                    color="orange"
                    style={{
                      fontSize: 13,
                      padding: "6px 16px",
                      borderRadius: 20,
                      border: "none",
                      marginBottom: 24,
                      fontWeight: 700,
                    }}
                  >
                    🚀 Nền tảng giáo dục tài chính #1 Việt Nam
                  </Tag>

                  <Title
                    style={{
                      fontSize: 52,
                      fontWeight: 900,
                      color: colors.white,
                      marginBottom: 24,
                      lineHeight: 1.2,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Đầu tư thông minh,{" "}
                    <span style={{ color: colors.primary }}>
                      Tương lai rực rỡ
                    </span>
                  </Title>

                  <Paragraph
                    style={{
                      fontSize: 18,
                      color: "#cbd5e1",
                      marginBottom: 40,
                      lineHeight: 1.7,
                      maxWidth: 600,
                    }}
                  >
                    Nâng cao kiến thức tài chính với khóa học chuyên sâu, sách
                    điện tử và công cụ phân tích chuyên nghiệp. Bắt đầu hành
                    trình đầu tư của bạn ngay hôm nay!
                  </Paragraph>

                  <Space size="large">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => navigate("/courses")}
                      icon={<MdSchool />}
                      style={{
                        height: 52,
                        fontSize: 16,
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: "0 32px",
                        boxShadow: "0 8px 24px rgba(247, 132, 4, 0.35)",
                      }}
                    >
                      Khám phá khóa học
                    </Button>
                    <Button
                      size="large"
                      onClick={() => navigate("/books")}
                      style={{
                        height: 52,
                        fontSize: 16,
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: "0 32px",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: colors.white,
                      }}
                    >
                      Xem sách
                    </Button>
                  </Space>
                </motion.div>
              </Col>

              <Col xs={0} md={10}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 400,
                      borderRadius: 16,
                      background:
                        "linear-gradient(135deg, rgba(247, 132, 4, 0.2), rgba(114, 46, 209, 0.2))",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <MdTrendingUp
                      style={{ fontSize: 120, color: colors.primary }}
                    />
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Stats Section */}
        <section
          style={{
            padding: "60px 5%",
            background: colors.slate50,
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Row gutter={[32, 32]}>
              {stats.map((stat, index) => (
                <Col key={index} xs={12} sm={6}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        textAlign: "center",
                        borderRadius: 12,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div style={{ marginBottom: 12 }}>{stat.icon}</div>
                      <Statistic
                        value={stat.value}
                        suffix={stat.suffix}
                        valueStyle={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: colors.slate800,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          color: colors.slate500,
                          marginTop: 8,
                          fontWeight: 600,
                        }}
                      >
                        {stat.title}
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: "100px 5%", background: colors.white }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 60 }}>
              <Tag
                color="orange"
                style={{
                  fontSize: 13,
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: "none",
                  marginBottom: 16,
                  fontWeight: 700,
                }}
              >
                SẢN PHẨM
              </Tag>
              <Title
                level={2}
                style={{
                  fontSize: 42,
                  fontWeight: 800,
                  color: colors.slate800,
                  marginBottom: 16,
                  letterSpacing: "-0.02em",
                }}
              >
                Giải pháp toàn diện cho nhà đầu tư
              </Title>
              <Paragraph
                style={{
                  fontSize: 18,
                  color: colors.slate600,
                  maxWidth: 600,
                  margin: "0 auto",
                }}
              >
                Từ kiến thức cơ bản đến chuyên sâu, chúng tôi cung cấp mọi thứ
                bạn cần để thành công
              </Paragraph>
            </div>

            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        height: "100%",
                        borderRadius: 16,
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onClick={() => navigate(feature.path)}
                    >
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          background: `${feature.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: feature.color,
                          marginBottom: 24,
                        }}
                      >
                        {feature.icon}
                      </div>

                      <Title
                        level={4}
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: colors.slate800,
                          marginBottom: 12,
                        }}
                      >
                        {feature.title}
                      </Title>

                      <Paragraph
                        style={{
                          fontSize: 15,
                          color: colors.slate600,
                          lineHeight: 1.7,
                          marginBottom: 0,
                        }}
                      >
                        {feature.description}
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.highlight} 100%)`,
            padding: "80px 5%",
          }}
        >
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <Title
              level={2}
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: colors.white,
                marginBottom: 20,
                letterSpacing: "-0.02em",
              }}
            >
              Sẵn sàng bắt đầu?
            </Title>
            <Paragraph
              style={{
                fontSize: 18,
                color: "rgba(255, 255, 255, 0.9)",
                marginBottom: 40,
              }}
            >
              Tham gia cùng hàng ngàn nhà đầu tư thông minh đang học tập và phát
              triển mỗi ngày
            </Paragraph>
            <Button
              size="large"
              onClick={() => navigate("/register")}
              style={{
                height: 52,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
                padding: "0 40px",
                background: colors.white,
                border: "none",
                color: colors.primary,
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              }}
            >
              Đăng ký miễn phí ngay
            </Button>
          </div>
        </section>
      </PublicLayout>
    </ConfigProvider>
  );
};

export default LandingPage;
