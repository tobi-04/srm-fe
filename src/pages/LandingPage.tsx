import React from "react";
import {
  Layout,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Space,
  Avatar,
  Tag,
  Divider,
  ConfigProvider,
  Progress,
} from "antd";
import {
  MdAssessment,
  MdPeople,
  MdAutoGraph,
  MdCheckCircle,
  MdPlayCircleOutline,
  MdQueryStats,
  MdLock,
  MdSchool,
  MdVerifiedUser,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const colors = {
    primary: "#f78404",
    secondary: "#ee7804",
    accent1: "#f0daa1",
    accent2: "#f1d55f",
    highlight: "#fb9d14",
    dark: "#1e293b",
    light: "#f8fafc",
    white: "#ffffff",
    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate200: "#e2e8f0",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",
  };

  const integrations = [
    {
      name: "Bloomberg",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHIywl5QW0qg7BDqKUzx6u10njBQ5bxfDpww&s",
    },
    {
      name: "TradingView",
      icon: "https://www.freelogovectors.net/wp-content/uploads/2021/12/tradingviewlogo-freelogovectors.net_.png",
    },
    {
      name: "Investing.com",
      icon: "https://wp.logos-download.com/wp-content/uploads/2024/03/Investing.com_Logo.png?dl",
    },
    {
      name: "Zoom",
      icon: "https://cdn.worldvectorlogo.com/logos/zoom-communications-logo.svg",
    },
    {
      name: "Google Meeting",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Google_Meet_text_logo_%282020%29.svg/3840px-Google_Meet_text_logo_%282020%29.svg.png",
    },
  ];

  const learningPaths = [
    {
      title: "Phân tích Kỹ thuật",
      progress: 65,
      lessons: "8/12",
      color: colors.primary,
    },
    {
      title: "Quản lý Tài chính Cá nhân",
      progress: 45,
      lessons: "5/11",
      color: colors.highlight,
    },
    {
      title: "Đầu tư Tiền mã hóa",
      progress: 85,
      lessons: "10/12",
      color: colors.secondary,
    },
    {
      title: "Thị trường Chứng khoán",
      progress: 20,
      lessons: "2/10",
      color: colors.accent2,
    },
  ];

  const features = [
    {
      title: "Khóa học Chuyên sâu",
      description:
        "Học từ các chuyên gia tài chính hàng đầu với lộ trình từ cơ bản đến nâng cao về thị trường vốn.",
      icon: <MdSchool size={32} color={colors.primary} />,
    },
    {
      title: "Giả lập Giao dịch",
      description:
        "Thực hành đầu tư với dữ liệu thị trường thực tế trong môi trường không rủi ro trước khi bắt đầu thật.",
      icon: <MdAutoGraph size={32} color={colors.primary} />,
    },
    {
      title: "Phân tích Thị trường",
      description:
        "Cập nhật kiến thức về kinh tế vĩ mô và các công cụ phân tích kỹ thuật hiện đại nhất.",
      icon: <MdQueryStats size={32} color={colors.primary} />,
    },
    {
      title: "Chứng chỉ Uy tín",
      description:
        "Nhận chứng chỉ hoàn thành khóa học được công nhận bởi các định chế tài chính đối tác.",
      icon: <MdVerifiedUser size={32} color={colors.primary} />,
    },
    {
      title: "Cộng đồng Nhà đầu tư",
      description:
        "Giao lưu, chia sẻ kinh nghiệm và học hỏi chiến lược từ cộng đồng hàng nghìn học viên tài năng.",
      icon: <MdPeople size={32} color={colors.primary} />,
    },
    {
      title: "Bảo mật Thông tin",
      description:
        "Nền tảng học tập an toàn với công nghệ bảo mật cao cấp nhất dành cho dữ liệu tài chính của bạn.",
      icon: <MdLock size={32} color={colors.primary} />,
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn Nam",
      role: "Nhà đầu tư Cá nhân",
      content:
        "Lộ trình học tại SRM FinEdu rất thực tế. Tôi đã tự tin hơn rất nhiều khi xây dựng danh mục đầu tư cho riêng mình.",
      avatar: "https://i.pravatar.cc/150?u=nam",
    },
    {
      name: "Lê Thị Mai",
      role: "Chuyên viên Phân tích Tài chính",
      content:
        "Các khóa học về quản trị rủi ro ở đây thực sự xuất sắc. Đây là nền tảng tốt nhất cho bất kỳ ai muốn nghiêm túc với tài chính.",
      avatar: "https://i.pravatar.cc/150?u=mai",
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
      <Layout style={{ minHeight: "100vh", background: colors.white }}>
        {/* Navbar */}
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "0 50px",
            borderBottom: `1px solid ${colors.slate100}`,
            height: "80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.highlight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(247, 132, 4, 0.2)",
              }}
            >
              <MdSchool style={{ color: colors.white, fontSize: "24px" }} />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontWeight: 800, color: colors.slate800 }}
            >
              SRM <span style={{ color: colors.primary }}>FIN-EDU</span>
            </Title>
          </div>

          <div
            className="nav-links"
            style={{ display: "flex", alignItems: "center", gap: "32px" }}
          >
            <Text strong style={{ color: colors.slate600, cursor: "pointer" }}>
              Khóa học
            </Text>
            <Text strong style={{ color: colors.slate600, cursor: "pointer" }}>
              Lộ trình
            </Text>
            <Text strong style={{ color: colors.slate600, cursor: "pointer" }}>
              Cộng đồng
            </Text>
          </div>

          <Space size="middle">
            {isAuthenticated ? (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/admin/dashboard")}
              >
                Lớp học của tôi
              </Button>
            ) : (
              <>
                <Button
                  type="text"
                  size="large"
                  onClick={() => navigate("/login")}
                  style={{ fontWeight: 600 }}
                >
                  Đăng nhập
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate("/register")}
                  style={{ boxShadow: "0 4px 12px rgba(247, 132, 4, 0.2)" }}
                >
                  Đăng ký ngay
                </Button>
              </>
            )}
          </Space>
        </Header>

        <Content>
          {/* Hero Section */}
          <section
            style={{
              position: "relative",
              overflow: "hidden",
              padding: "80px 20px 120px",
              background: "linear-gradient(to bottom, #fffcf5, #ffffff)",
              textAlign: "center",
            }}
          >
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <Tag
                color="orange"
                style={{
                  marginBottom: "24px",
                  padding: "4px 16px",
                  borderRadius: "100px",
                  fontWeight: "bold",
                  border: "none",
                  background: "#fff7e6",
                  color: colors.primary,
                }}
              >
                CHƯƠNG TRÌNH ĐÀO TẠO TÀI CHÍNH THỰC CHIẾN 2026
              </Tag>
              <Title
                style={{
                  fontSize: "64px",
                  fontWeight: 900,
                  marginBottom: "32px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                Làm chủ Tài chính, <br />
                <span
                  style={{
                    color: "transparent",
                    backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.highlight})`,
                    WebkitBackgroundClip: "text",
                  }}
                >
                  Vững bước Tương lai
                </span>
              </Title>
              <Paragraph
                style={{
                  fontSize: "20px",
                  color: colors.slate600,
                  maxWidth: "700px",
                  margin: "0 auto 48px",
                  lineHeight: 1.6,
                }}
              >
                Nền tảng giáo dục tài chính hàng đầu giúp bạn từ một người mới
                trở thành nhà đầu tư chuyên nghiệp thông qua kiến thức bài bản
                và thực hành thực tế.
              </Paragraph>
              <Space size="large" style={{ marginBottom: "64px" }}>
                <Button
                  type="primary"
                  size="large"
                  style={{
                    height: "56px",
                    padding: "0 40px",
                    fontSize: "18px",
                    borderRadius: "14px",
                  }}
                  onClick={() => navigate("/register")}
                >
                  Bắt đầu Học miễn phí
                </Button>
                <Button
                  size="large"
                  icon={<MdPlayCircleOutline size={20} />}
                  style={{
                    height: "56px",
                    padding: "0 32px",
                    fontSize: "18px",
                    borderRadius: "14px",
                  }}
                >
                  Khám phá Khóa học
                </Button>
              </Space>

              {/* Progress Visualization Card */}
              <Card
                style={{
                  maxWidth: "1000px",
                  margin: "0 auto",
                  borderRadius: "24px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
                  border: "none",
                  overflow: "hidden",
                  padding: 0,
                }}
                styles={{ body: { padding: 0 } }}
              >
                <div
                  style={{
                    background: colors.slate50,
                    borderBottom: `1px solid ${colors.slate100}`,
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      flex: 1,
                    }}
                  >
                    <Text strong style={{ color: colors.slate700 }}>
                      Tiến độ Học tập của Tôi
                    </Text>
                    <Tag
                      style={{
                        borderRadius: "100px",
                        background: "white",
                        border: `1px solid ${colors.slate200}`,
                        color: colors.slate500,
                      }}
                    >
                      Mục tiêu Đang thực hiện
                    </Tag>
                  </div>
                  <Button
                    type="text"
                    icon={<MdAssessment />}
                    style={{ color: colors.primary, fontWeight: 600 }}
                  >
                    Thống kê
                  </Button>
                </div>
                <div style={{ padding: "24px", overflowX: "auto" }}>
                  <Row gutter={16} style={{ minWidth: "800px" }}>
                    {learningPaths.map((path, idx) => (
                      <Col span={6} key={idx}>
                        <div
                          style={{
                            background: colors.slate50,
                            borderRadius: "16px",
                            padding: "16px",
                            border: `1px solid ${colors.slate100}`,
                            height: "100%",
                          }}
                        >
                          <div style={{ marginBottom: "16px" }}>
                            <Text
                              strong
                              style={{
                                display: "block",
                                fontSize: "14px",
                                marginBottom: "4px",
                              }}
                            >
                              {path.title}
                            </Text>
                            <Text
                              style={{
                                color: colors.slate400,
                                fontSize: "12px",
                              }}
                            >
                              {path.lessons} Bài học hoàn thành
                            </Text>
                          </div>
                          <Progress
                            percent={path.progress}
                            strokeColor={path.color}
                            trailColor="#ffffff"
                            size="small"
                            style={{ marginBottom: "16px" }}
                          />
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                background: "white",
                                padding: "10px",
                                borderRadius: "10px",
                                border: "1px solid #f1f5f9",
                                textAlign: "left",
                              }}
                            >
                              <Text
                                strong
                                style={{ fontSize: "12px", display: "block" }}
                              >
                                Bài tiếp theo:
                              </Text>
                              <Text
                                style={{
                                  fontSize: "12px",
                                  color: colors.slate600,
                                }}
                              >
                                Chương 4: Quản trị Rủi ro
                              </Text>
                            </div>
                            <Button
                              size="small"
                              type="primary"
                              ghost
                              style={{
                                borderRadius: "8px",
                                fontSize: "11px",
                                height: "32px",
                              }}
                            >
                              Tiếp tục Học
                            </Button>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Card>
            </div>
          </section>

          {/* Integration Logos */}
          <section
            style={{
              padding: "80px 20px",
              borderTop: `1px solid ${colors.slate100}`,
              borderBottom: `1px solid ${colors.slate100}`,
            }}
          >
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <Text
                style={{
                  display: "block",
                  textAlign: "center",
                  color: colors.slate400,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  marginBottom: "48px",
                }}
              >
                Hợp tác cùng các định chế tài chính và giáo dục hàng đầu
              </Text>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "64px",
                  opacity: 0.6,
                }}
              >
                {integrations.map((brand) => (
                  <img
                    key={brand.name}
                    src={brand.icon}
                    alt={brand.name}
                    style={{
                      height: "32px",
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section style={{ padding: "120px 20px" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: "80px" }}>
                <Title
                  level={2}
                  style={{
                    fontSize: "40px",
                    fontWeight: 800,
                    marginBottom: "16px",
                  }}
                >
                  Hệ sinh thái Đào tạo Toàn diện
                </Title>
                <Paragraph
                  style={{
                    fontSize: "18px",
                    color: colors.slate500,
                    maxWidth: "600px",
                    margin: "0 auto",
                  }}
                >
                  Cung cấp mọi công cụ cần thiết để bạn làm chủ kiến thức tài
                  chính và áp dụng hiệu quả vào đầu tư thực tế.
                </Paragraph>
              </div>
              <Row gutter={[32, 32]}>
                {features.map((feature, idx) => (
                  <Col xs={24} md={8} key={idx}>
                    <Card
                      hoverable
                      style={{
                        height: "100%",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                        borderRadius: "20px",
                      }}
                    >
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "16px",
                          background: "#fff7e6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "24px",
                        }}
                      >
                        {feature.icon}
                      </div>
                      <Title level={4} style={{ marginBottom: "16px" }}>
                        {feature.title}
                      </Title>
                      <Paragraph
                        style={{ color: colors.slate500, lineHeight: 1.6 }}
                      >
                        {feature.description}
                      </Paragraph>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </section>

          {/* Customer Success Section */}
          <section
            style={{
              padding: "120px 20px",
              background: colors.slate900,
              color: colors.white,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                maxWidth: "1100px",
                margin: "0 auto",
                position: "relative",
                zIndex: 10,
              }}
            >
              <Row gutter={64} align="middle">
                <Col xs={24} lg={12} style={{ marginBottom: "64px" }}>
                  <Title
                    level={2}
                    style={{
                      color: colors.white,
                      fontSize: "40px",
                      fontWeight: 800,
                      marginBottom: "32px",
                    }}
                  >
                    Được các Nhà đầu tư Tin tưởng, <br />
                    <span style={{ color: colors.highlight }}>
                      Chuyên gia Khuyên dùng
                    </span>
                  </Title>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "32px",
                    }}
                  >
                    {testimonials.map((t, i) => (
                      <div
                        key={i}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          padding: "32px",
                          borderRadius: "24px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <Paragraph
                          style={{
                            fontSize: "18px",
                            color: "#cbd5e1",
                            fontStyle: "italic",
                            marginBottom: "24px",
                          }}
                        >
                          "{t.content}"
                        </Paragraph>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                          }}
                        >
                          <Avatar
                            size={56}
                            src={t.avatar}
                            style={{ border: `2px solid ${colors.primary}` }}
                          />
                          <div>
                            <Text
                              strong
                              style={{
                                color: colors.white,
                                display: "block",
                                fontSize: "18px",
                              }}
                            >
                              {t.name}
                            </Text>
                            <Text style={{ color: colors.slate500 }}>
                              {t.role}
                            </Text>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col xs={24} lg={12}>
                  <div
                    style={{
                      background: colors.primary,
                      padding: "48px",
                      borderRadius: "48px",
                      boxShadow: "0 20px 40px rgba(247, 132, 4, 0.3)",
                    }}
                  >
                    <Title
                      level={3}
                      style={{ color: colors.white, marginBottom: "32px" }}
                    >
                      Sẵn sàng nâng tầm kiến thức tài chính?
                    </Title>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        marginBottom: "40px",
                      }}
                    >
                      {[
                        "Hơn 500 bài giảng video chuyên sâu",
                        "Lộ trình học tập cá nhân hóa",
                        "Tài liệu học tập có thể tải về",
                        "Kết nối trực tiếp với chuyên gia",
                        "Cập nhật kiến thức thị trường trọn đời",
                      ].map((item) => (
                        <div
                          key={item}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            color: "rgba(255,255,255,0.9)",
                            fontWeight: 500,
                          }}
                        >
                          <MdCheckCircle
                            style={{ color: colors.white, fontSize: "20px" }}
                          />
                          {item}
                        </div>
                      ))}
                    </div>
                    <Button
                      size="large"
                      style={{
                        width: "100%",
                        height: "64px",
                        borderRadius: "16px",
                        fontSize: "18px",
                        fontWeight: "bold",
                        background: colors.white,
                        color: colors.primary,
                        border: "none",
                      }}
                    >
                      Bắt đầu ngay hôm nay
                    </Button>
                    <div style={{ textAlign: "center", marginTop: "24px" }}>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: "14px",
                          fontStyle: "italic",
                        }}
                      >
                        Không yêu cầu thẻ tín dụng. Tham gia miễn phí.
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </section>

          {/* CTA Footer Section */}
          <section style={{ padding: "120px 20px", textAlign: "center" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <Title
                level={2}
                style={{
                  fontSize: "48px",
                  fontWeight: 900,
                  marginBottom: "32px",
                  letterSpacing: "-0.02em",
                }}
              >
                Gia nhập cộng đồng 1 triệu+ học viên thành đạt
              </Title>
              <Paragraph
                style={{
                  fontSize: "20px",
                  color: colors.slate500,
                  marginBottom: "48px",
                }}
              >
                Đừng để tương lai của bạn chờ đợi. Hãy trang bị những kỹ năng
                tài chính cần thiết ngay bây giờ.
              </Paragraph>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  style={{
                    height: "64px",
                    padding: "0 48px",
                    fontSize: "18px",
                    borderRadius: "16px",
                  }}
                  onClick={() => navigate("/register")}
                >
                  Bắt đầu Học ngay
                </Button>
                <Button
                  size="large"
                  style={{
                    height: "64px",
                    padding: "0 48px",
                    fontSize: "18px",
                    borderRadius: "16px",
                  }}
                >
                  Xem Danh mục Khóa học
                </Button>
              </div>
            </div>
          </section>
        </Content>

        <Footer
          style={{
            background: colors.slate50,
            padding: "80px 50px",
            borderTop: `1px solid ${colors.slate100}`,
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <Row gutter={[48, 48]}>
              <Col xs={24} md={8}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: `linear-gradient(135deg, ${colors.primary}, ${colors.highlight})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdSchool
                      style={{ color: colors.white, fontSize: "18px" }}
                    />
                  </div>
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      fontWeight: 800,
                      color: colors.slate800,
                    }}
                  >
                    SRM <span style={{ color: colors.primary }}>FIN-EDU</span>
                  </Title>
                </div>
                <Paragraph
                  style={{ color: colors.slate500, marginBottom: "24px" }}
                >
                  Nỗ lực mang kiến thức tài chính chất lượng cao đến mọi người
                  thông qua công nghệ học tập đổi mới.
                </Paragraph>
              </Col>

              <Col xs={12} md={4}>
                <Title level={5} style={{ marginBottom: "24px" }}>
                  Khám phá
                </Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <Text style={{ color: colors.slate500, cursor: "pointer" }}>
                    Khóa học
                  </Text>
                  <Text style={{ color: colors.slate500, cursor: "pointer" }}>
                    Chứng chỉ
                  </Text>
                  <Text style={{ color: colors.slate500, cursor: "pointer" }}>
                    Chuyên gia
                  </Text>
                </div>
              </Col>

              <Col xs={12} md={4}>
                <Title level={5} style={{ marginBottom: "24px" }}>
                  Hỗ trợ
                </Title>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <Text style={{ color: colors.slate500, cursor: "pointer" }}>
                    Trung tâm trợ giúp
                  </Text>
                  <Text style={{ color: colors.slate500, cursor: "pointer" }}>
                    Cộng đồng
                  </Text>
                  <Text style={{ color: colors.slate500, cursor: "pointer" }}>
                    Hướng dẫn
                  </Text>
                </div>
              </Col>

              <Col xs={24} md={8}>
                <Title level={5} style={{ marginBottom: "24px" }}>
                  Bản tin
                </Title>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    style={{
                      flex: 1,
                      padding: "0 16px",
                      height: "40px",
                      borderRadius: "10px",
                      border: `1px solid ${colors.slate200}`,
                      outline: "none",
                    }}
                  />
                  <Button type="primary">Tham gia</Button>
                </div>
              </Col>
            </Row>
            <Divider style={{ margin: "48px 0" }} />
            <Text style={{ color: colors.slate400 }}>
              © {new Date().getFullYear()} SRM Finance Education. Bảo lưu mọi
              quyền.
            </Text>
          </div>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default LandingPage;
