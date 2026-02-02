import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Row,
  Col,
  Button,
  Spin,
  Empty,
  Layout,
  Breadcrumb,
  Divider,
  Space,
  Card,
  Tag,
  Modal,
  Form,
  Input,
  message,
  QRCode,
  Alert,
  Avatar,
  ConfigProvider,
  Tabs,
} from "antd";
import {
  BookOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  StarFilled,
  GlobalOutlined,
  ThunderboltOutlined,
  FileProtectOutlined,
  CreditCardOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { MdSchool, MdAccountCircle } from "react-icons/md";
import { motion } from "framer-motion";
import { bookApi } from "../../api/bookApi";
import { getLandingPages } from "../../api/landingPage";
import { useAuthStore } from "../../stores/authStore";
import { LandingPageRenderer } from "../landing/LandingPageRenderer";

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Footer } = Layout;

const BookDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", slug],
    queryFn: () => bookApi.getBookBySlug(slug!).then((res) => res.data),
    enabled: !!slug,
  });

  const { data: landingPageData } = useQuery({
    queryKey: ["landing-page-for-book", book?._id],
    queryFn: () => getLandingPages({ book_id: book?._id, status: "published" }),
    enabled: !!book?._id,
  });

  const activeLandingPage = landingPageData?.data?.[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    if (!discount) return price;
    return Math.floor(price * (1 - discount / 100));
  };

  const handleCheckout = async (values: any) => {
    try {
      const response = await bookApi.checkout({
        book_id: book._id,
        ...values,
      });
      setIsCheckoutModalOpen(false);

      const { order_id, is_new_user, email } = response.data;

      const modal = Modal.info({
        title: (
          <Space>
            <CreditCardOutlined style={{ color: "#f78404" }} />
            <span style={{ fontSize: 20 }}>Thanh toán đơn hàng</span>
          </Space>
        ),
        content: (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <Text type="secondary" style={{ display: "block" }}>
              Vui lòng chuyển khoản chính xác nội dung để hệ thống tự động kích
              hoạt sách.
            </Text>
            <div
              style={{
                background: "#f9f9f9",
                padding: 20,
                borderRadius: 16,
                margin: "20px 0",
                border: "1px dashed #d9d9d9",
              }}
            >
              <QRCode
                value={response.data.qr_code_url}
                size={200}
                style={{ margin: "0 auto", borderRadius: 8 }}
              />
            </div>

            <Alert
              message="Nội dung chuyển khoản (Bắt buộc)"
              description={
                <Text
                  copyable={{ text: response.data.transfer_code }}
                  strong
                  style={{ fontSize: 24, color: "#f78404", letterSpacing: 1 }}
                >
                  {response.data.transfer_code}
                </Text>
              }
              type="warning"
              showIcon
              style={{ borderRadius: 12, textAlign: "left", marginBottom: 16 }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                textAlign: "left",
              }}
            >
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ngân hàng
                </Text>
                <br />
                <Text strong>{response.data.bank.bank_name}</Text>
              </Card>
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chủ tài khoản
                </Text>
                <br />
                <Text strong>{response.data.bank.acc_name}</Text>
              </Card>
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tài khoản
                </Text>
                <br />
                <Text strong copyable>
                  {response.data.bank.acc_no}
                </Text>
              </Card>
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tiền
                </Text>
                <br />
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatPrice(response.data.amount)}
                </Text>
              </Card>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 18, color: "#f78404" }}
                    spin
                  />
                }
              />
              <Text strong style={{ color: "#f78404" }}>
                Đang chờ thanh toán...
              </Text>
            </div>
          </div>
        ),
        width: 500,
        footer: null,
        closable: false,
        maskClosable: false,
      });

      // Store pollInterval reference for cleanup
      let pollInterval: ReturnType<typeof setInterval>;

      // Handle modal close with confirmation
      const handleClosePayment = () => {
        Modal.confirm({
          title: "Hủy thanh toán?",
          content:
            "Bạn có chắc muốn hủy đơn hàng này không? Đơn hàng sẽ bị xóa khỏi hệ thống.",
          okText: "Hủy đơn hàng",
          cancelText: "Tiếp tục thanh toán",
          okButtonProps: { danger: true },
          onOk: async () => {
            clearInterval(pollInterval);
            modal.destroy();
            try {
              await bookApi.cancelOrder(order_id);
              message.success("Đã hủy đơn hàng");
            } catch (e) {
              console.error("Cancel order error:", e);
            }
          },
        });
      };

      // Update modal to include close button that triggers confirmation
      modal.update({
        content: (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <Text type="secondary" style={{ display: "block" }}>
              Vui lòng chuyển khoản chính xác nội dung để hệ thống tự động kích
              hoạt sách.
            </Text>
            <div
              style={{
                background: "#f9f9f9",
                padding: 20,
                borderRadius: 16,
                margin: "20px 0",
                border: "1px dashed #d9d9d9",
              }}
            >
              <QRCode
                value={response.data.qr_code_url}
                size={200}
                style={{ margin: "0 auto", borderRadius: 8 }}
              />
            </div>

            <Alert
              message="Nội dung chuyển khoản (Bắt buộc)"
              description={
                <Text
                  copyable={{ text: response.data.transfer_code }}
                  strong
                  style={{ fontSize: 24, color: "#f78404", letterSpacing: 1 }}
                >
                  {response.data.transfer_code}
                </Text>
              }
              type="warning"
              showIcon
              style={{ borderRadius: 12, textAlign: "left", marginBottom: 16 }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                textAlign: "left",
              }}
            >
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ngân hàng
                </Text>
                <br />
                <Text strong>{response.data.bank.bank_name}</Text>
              </Card>
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chủ tài khoản
                </Text>
                <br />
                <Text strong>{response.data.bank.acc_name}</Text>
              </Card>
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tài khoản
                </Text>
                <br />
                <Text strong copyable>
                  {response.data.bank.acc_no}
                </Text>
              </Card>
              <Card
                size="small"
                style={{ borderRadius: 12, background: "#fff" }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tiền
                </Text>
                <br />
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatPrice(response.data.amount)}
                </Text>
              </Card>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Spin
                indicator={
                  <LoadingOutlined
                    style={{ fontSize: 18, color: "#f78404" }}
                    spin
                  />
                }
              />
              <Text strong style={{ color: "#f78404" }}>
                Đang chờ thanh toán...
              </Text>
            </div>

            <Button
              type="text"
              danger
              style={{ marginTop: 16 }}
              onClick={handleClosePayment}
            >
              Hủy thanh toán
            </Button>
          </div>
        ),
      });

      // Start Polling
      pollInterval = setInterval(async () => {
        try {
          const statusRes = await bookApi.getOrderStatus(order_id);
          if (statusRes.data.status === "PAID") {
            clearInterval(pollInterval);
            modal.destroy();

            // Show Success Dialog
            Modal.success({
              title: "Thanh toán thành công!",
              width: 500,
              content: (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div
                    style={{ fontSize: 60, color: "#52c41a", marginBottom: 20 }}
                  >
                    <CheckCircleOutlined />
                  </div>
                  <Title level={4}>Cảm ơn bạn đã mua sách!</Title>

                  {is_new_user ? (
                    <Alert
                      type="success"
                      message="Tài khoản mới đã được tạo"
                      description={
                        <div style={{ textAlign: "left" }}>
                          <Text>
                            Hệ thống đã gửi thông tin đăng nhập vào email:{" "}
                            <Text strong>{email}</Text>
                          </Text>
                          <br />
                          <Text>
                            Vui lòng kiểm tra hộp thư (cả thư rác) để lấy mật
                            khẩu truy cập.
                          </Text>
                        </div>
                      }
                      icon={<MdAccountCircle style={{ fontSize: 24 }} />}
                      showIcon
                      style={{ borderRadius: 12, marginTop: 16 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 16 }}>
                      Sách đã được thêm vào thư viện của bạn. Bạn có thể vào
                      <Text strong style={{ color: "#f78404" }}>
                        {" "}
                        Dashboard{" "}
                      </Text>
                      để xem và tải về ngay.
                    </Text>
                  )}

                  <div
                    style={{
                      marginTop: 24,
                      padding: 16,
                      background: "#f8fafc",
                      borderRadius: 12,
                    }}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text strong>Bạn đã có quyền truy cập:</Text>
                      <Text
                        style={{
                          color: "#1e293b",
                          fontSize: 18,
                          fontWeight: 700,
                          display: "block",
                        }}
                      >
                        {book.title}
                      </Text>
                    </Space>
                  </div>
                </div>
              ),
              okText: "Vào xem sách ngay",
              onOk: () => navigate("/student/dashboard"),
            });
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    } catch (error) {
      message.error("Có lỗi xảy ra khi đặt hàng");
    }
  };

  if (isLoading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu sách..." />
      </div>
    );

  if (activeLandingPage) {
    return <LandingPageRenderer landingPage={activeLandingPage} urlStep={2} />;
  }

  if (!book)
    return (
      <Empty
        description="Không tìm thấy sách phù hợp"
        style={{ padding: "100px 0" }}
      >
        <Button type="primary" onClick={() => navigate("/books")}>
          Quay lại cửa hàng
        </Button>
      </Empty>
    );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#f78404",
          borderRadius: 12,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh", background: "#f8fafc" }}>
        {/* Header with Glassmorphism */}
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "0 5%",
            borderBottom: "1px solid #f1f5f9",
            height: "80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f78404, #fb9d14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(247, 132, 4, 0.2)",
              }}
            >
              <MdSchool style={{ color: "#fff", fontSize: "24px" }} />
            </div>
            <Title
              level={4}
              style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}
            >
              SRM <span style={{ color: "#f78404" }}>FIN-EDU</span>
            </Title>
          </div>

          <div
            className="nav-links"
            style={{ display: "flex", alignItems: "center", gap: "32px" }}
          >
            <Text
              strong
              style={{ color: "#475569", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Khóa học
            </Text>
            <Text strong style={{ color: "#475569", cursor: "pointer" }}>
              Lộ trình
            </Text>
            <Text
              strong
              style={{ color: "#f78404", cursor: "pointer" }}
              onClick={() => navigate("/books")}
            >
              Sách
            </Text>
            <Text strong style={{ color: "#475569", cursor: "pointer" }}>
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

        {/* Hero Section with Mesh Gradient Background */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 450,
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(247, 132, 4, 0.15)",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />

          <Content
            style={{
              padding: "40px 5%",
              maxWidth: 1400,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Breadcrumb
              style={{ marginBottom: 24 }}
              items={[
                {
                  title: (
                    <HomeOutlined style={{ color: "rgba(255,255,255,0.7)" }} />
                  ),
                  onClick: () => navigate("/"),
                },
                {
                  title: (
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>
                      Cửa hàng sách
                    </span>
                  ),
                  onClick: () => navigate("/books"),
                },
                { title: <span style={{ color: "#fff" }}>{book.title}</span> },
              ]}
            />

            <Row gutter={[40, 40]} align="top">
              {/* Left Column - Book Info */}
              <Col xs={24} lg={16}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Tag
                    color="orange"
                    style={{
                      borderRadius: 6,
                      padding: "4px 12px",
                      marginBottom: 16,
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                    }}
                  >
                    BEST SELLER
                  </Tag>
                  <Title
                    level={1}
                    style={{
                      color: "#fff",
                      fontSize: "clamp(2rem, 5vw, 3.5rem)",
                      marginBottom: 20,
                      fontWeight: 800,
                      lineHeight: 1.2,
                    }}
                  >
                    {book.title}
                  </Title>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      marginBottom: 32,
                    }}
                  >
                    <Space style={{ color: "rgba(255,255,255,0.8)" }}>
                      <Avatar
                        style={{ backgroundColor: "#f78404" }}
                        icon={<BookOutlined />}
                      />
                      <Text style={{ color: "#fff", fontWeight: 500 }}>
                        E-Book (Digital Version)
                      </Text>
                    </Space>
                    <Divider
                      type="vertical"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        height: 20,
                      }}
                    />
                    <Space>
                      <div style={{ color: "#fbbf24" }}>
                        <StarFilled /> <StarFilled /> <StarFilled />{" "}
                        <StarFilled /> <StarFilled />
                      </div>
                      <Text style={{ color: "rgba(255,255,255,0.7)" }}>
                        (128 đánh giá)
                      </Text>
                    </Space>
                    <Divider
                      type="vertical"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        height: 20,
                      }}
                    />
                    <Space style={{ color: "rgba(255,255,255,0.8)" }}>
                      <GlobalOutlined />
                      <Text style={{ color: "#fff" }}>Tiếng Việt</Text>
                    </Space>
                  </div>

                  <Card
                    style={{
                      borderRadius: 24,
                      background: "#fff",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                      border: "none",
                      padding: 12,
                    }}
                  >
                    <Tabs
                      defaultActiveKey="1"
                      items={[
                        {
                          key: "1",
                          label: (
                            <span style={{ fontSize: 16, fontWeight: 600 }}>
                              Giới thiệu
                            </span>
                          ),
                          children: (
                            <div style={{ padding: "10px 0" }}>
                              <Title level={4}>Về cuốn sách này</Title>
                              <Paragraph
                                style={{
                                  fontSize: 16,
                                  lineHeight: 1.8,
                                  color: "#475569",
                                }}
                              >
                                {book.description ||
                                  "Thông tin đang được cập nhật..."}
                              </Paragraph>

                              <div style={{ marginTop: 32 }}>
                                <Title level={4}>Bạn sẽ nhận được gì?</Title>
                                <Row gutter={[16, 16]}>
                                  {[
                                    "Quyền truy cập vĩnh viễn",
                                    "Tải xuống file PDF chất lượng cao",
                                    "Hỗ trợ định dạng EPUB cho máy đọc sách",
                                    "Cập nhật nội dung phiên bản mới nhất",
                                    "Hỗ trợ giải đáp thắc mắc liên quan",
                                    "Học mọi lúc, mọi nơi trên mọi thiết bị",
                                  ].map((benefit, i) => (
                                    <Col span={12} key={i}>
                                      <Space align="start">
                                        <CheckCircleOutlined
                                          style={{ color: "#22c55e" }}
                                        />
                                        <Text
                                          style={{
                                            color: "#334155",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {benefit}
                                        </Text>
                                      </Space>
                                    </Col>
                                  ))}
                                </Row>
                              </div>
                            </div>
                          ),
                        },
                        {
                          key: "2",
                          label: (
                            <span style={{ fontSize: 16, fontWeight: 600 }}>
                              Mục lục
                            </span>
                          ),
                          children: (
                            <div
                              style={{
                                padding: "40px 0",
                                textAlign: "center",
                                color: "#94a3b8",
                              }}
                            >
                              Mục lục chi tiết đang được chuẩn bị...
                            </div>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </motion.div>
              </Col>

              {/* Right Column - Purchase Card (Sticky) */}
              <Col xs={24} lg={8}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={{ position: "sticky", top: 100 }}
                >
                  <Card
                    cover={
                      <div
                        style={{
                          padding: 12,
                          background: "#fff",
                          textAlign: "center",
                        }}
                      >
                        <motion.img
                          src={
                            book.cover_image ||
                            "https://via.placeholder.com/600x800?text=No+Cover"
                          }
                          alt={book.title}
                          whileHover={{ scale: 1.02, y: -5 }}
                          style={{
                            width: "100%",
                            borderRadius: 16,
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            display: "block",
                          }}
                        />
                      </div>
                    }
                    style={{
                      borderRadius: 24,
                      overflow: "hidden",
                      border: "none",
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                    }}
                    bodyStyle={{ padding: 24 }}
                  >
                    <div style={{ marginBottom: 24 }}>
                      <Space align="baseline">
                        <Text
                          style={{
                            fontSize: 36,
                            fontWeight: 800,
                            color: "#1e293b",
                          }}
                        >
                          {formatPrice(
                            calculateDiscountedPrice(
                              book.price,
                              book.discount_percentage,
                            ),
                          )}
                        </Text>
                        {book.discount_percentage > 0 && (
                          <Text
                            delete
                            type="secondary"
                            style={{ fontSize: 18, marginLeft: 8 }}
                          >
                            {formatPrice(book.price)}
                          </Text>
                        )}
                      </Space>
                      {book.discount_percentage > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Space>
                            <Tag
                              color="volcano"
                              style={{ borderRadius: 4, fontWeight: 700 }}
                            >
                              GIẢM {book.discount_percentage}%
                            </Tag>
                            <Tag
                              color="red"
                              style={{
                                borderRadius: 4,
                                fontWeight: 700,
                              }}
                            >
                              ƯU ĐÃI CÓ HẠN
                            </Tag>
                          </Space>
                        </div>
                      )}
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<ShoppingCartOutlined />}
                      onClick={() => setIsCheckoutModalOpen(true)}
                      style={{
                        height: 56,
                        fontSize: 18,
                        fontWeight: 700,
                        borderRadius: 12,
                        background:
                          "linear-gradient(135deg, #f78404 0%, #ff5e00 100%)",
                        boxShadow: "0 8px 20px rgba(247, 132, 4, 0.3)",
                        border: "none",
                      }}
                    >
                      MUA NGAY
                    </Button>

                    <div style={{ marginTop: 24 }}>
                      <Text
                        strong
                        style={{
                          display: "block",
                          marginBottom: 16,
                          fontSize: 14,
                        }}
                      >
                        Sản phẩm bao gồm:
                      </Text>
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <BookItem
                          icon={
                            <ThunderboltOutlined style={{ color: "#f78404" }} />
                          }
                          text="Nhận ngay sau khi thanh toán"
                        />
                        <BookItem
                          icon={
                            <FileProtectOutlined style={{ color: "#f78404" }} />
                          }
                          text="Định dạng PDF & EPUB cao cấp"
                        />
                        <BookItem
                          icon={
                            <SafetyCertificateOutlined
                              style={{ color: "#f78404" }}
                            />
                          }
                          text="Thanh toán an toàn bảo mật"
                        />
                      </Space>
                    </div>

                    <Divider style={{ margin: "20px 0" }} />

                    <div style={{ textAlign: "center" }}>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        Bằng cách mua hàng, bạn đồng ý với Điều khoản & Chính
                        sách của chúng tôi.
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Content>
        </div>

        {/* Similar Books Section can be added here */}

        <Footer
          style={{
            textAlign: "center",
            padding: "80px 20px 40px",
            background: "#0f172a",
            color: "#fff",
            marginTop: 60,
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #f78404, #fb9d14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MdSchool style={{ color: "#fff", fontSize: "18px" }} />
              </div>
              <Title
                level={4}
                style={{ margin: 0, fontWeight: 800, color: "#fff" }}
              >
                SRM <span style={{ color: "#f78404" }}>FIN-EDU</span>
              </Title>
            </div>
            <Paragraph
              style={{
                color: "#64748b",
                maxWidth: "600px",
                margin: "0 auto 40px",
              }}
            >
              Nền tảng đào tạo tài chính hàng đầu Việt Nam. Chúng tôi cung cấp
              các giải pháp giáo dục số thực tiễn giúp nâng tầm tri thức cộng
              đồng.
            </Paragraph>
            <Divider
              style={{ borderColor: "rgba(255,255,255,0.1)", margin: "40px 0" }}
            />
            <div style={{ color: "#64748b", fontSize: "14px" }}>
              Copyright © {new Date().getFullYear()} SRM FIN-EDU. All rights
              reserved.
            </div>
          </div>
        </Footer>

        {/* Optimized Checkout Modal */}
        <Modal
          title={
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <Title level={4} style={{ margin: 0 }}>
                Thông tin thanh toán
              </Title>
              <Text type="secondary">
                Vui lòng điền thông tin để chúng tôi gửi sách
              </Text>
            </div>
          }
          open={isCheckoutModalOpen}
          onCancel={() => setIsCheckoutModalOpen(false)}
          footer={null}
          width={450}
          style={{ borderRadius: 20 }}
          centered
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCheckout}
            initialValues={{}}
            requiredMark={false}
          >
            <Form.Item
              label={<Text strong>Họ và tên người nhận</Text>}
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input
                size="large"
                prefix={
                  <Avatar
                    size="small"
                    style={{ backgroundColor: "#f0f0f0" }}
                    icon={<CreditCardOutlined style={{ color: "#888" }} />}
                  />
                }
                placeholder="Nhập họ và tên của bạn"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item
              label={<Text strong>Email nhận sách</Text>}
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Vui lòng nhập email hợp lệ",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập địa chỉ email chính xác"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
            <Form.Item
              label={<Text strong>Số điện thoại (Tùy chọn)</Text>}
              name="phone"
            >
              <Input
                size="large"
                placeholder="Số điện thoại của bạn"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              label={<Text strong>Mã giảm giá (Nếu có)</Text>}
              name="coupon_code"
            >
              <Input
                size="large"
                placeholder="NHẬP MÃ GIẢM GIÁ"
                style={{ borderRadius: 8, textTransform: "uppercase" }}
                onChange={(e) =>
                  form.setFieldsValue({
                    coupon_code: e.target.value.toUpperCase(),
                  })
                }
              />
            </Form.Item>

            <div
              style={{
                background: "#f8fafc",
                padding: 16,
                borderRadius: 12,
                marginBottom: 24,
                border: "1px solid #e2e8f0",
              }}
            >
              <Row justify="space-between">
                <Text>Giá gốc:</Text>
                <Text
                  style={{ textDecoration: "line-through", color: "#94a3b8" }}
                >
                  {formatPrice(book.price)}
                </Text>
              </Row>
              {book.discount_percentage > 0 && (
                <Row justify="space-between" style={{ marginTop: 4 }}>
                  <Text>Giảm giá sách:</Text>
                  <Text type="danger">-{book.discount_percentage}%</Text>
                </Row>
              )}
              <Row
                justify="space-between"
                style={{
                  marginTop: 8,
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: 8,
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  Tổng cộng:
                </Text>
                <Text strong style={{ fontSize: 18, color: "#f78404" }}>
                  {formatPrice(
                    calculateDiscountedPrice(
                      book.price,
                      book.discount_percentage,
                    ),
                  )}
                </Text>
              </Row>
              <Text
                type="secondary"
                style={{ fontSize: 12, marginTop: 8, display: "block" }}
              >
                * Tổng thanh toán cuối cùng sẽ được tính lại nếu có mã giảm giá
                hợp lệ.
              </Text>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  height: 52,
                  fontWeight: 700,
                  fontSize: 16,
                  borderRadius: 12,
                  background:
                    "linear-gradient(135deg, #f78404 0%, #ff5e00 100%)",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(247, 132, 4, 0.2)",
                }}
              >
                XÁC NHẬN ĐẶT HÀNG
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </ConfigProvider>
  );
};

// Helper Components

const BookItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#fff7e6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
      }}
    >
      {icon}
    </div>
    <Text style={{ fontSize: 14, color: "#475569" }}>{text}</Text>
  </div>
);

export default BookDetailPage;
