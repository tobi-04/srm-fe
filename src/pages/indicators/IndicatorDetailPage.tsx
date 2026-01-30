import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Button,
  Space,
  Spin,
  Layout,
  ConfigProvider,
  Form,
  Input,
  Checkbox,
  Modal,
  Alert,
  QRCode,
  message,
  Tag,
  Row,
  Col,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ThunderboltOutlined,
  MailOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { MdShowChart, MdAccountCircle } from "react-icons/md";
import { indicatorApi } from "../../api/indicatorApi";
import { useAuthStore } from "../../stores/authStore";
import { motion } from "framer-motion";

const { Title, Text, Paragraph } = Typography;
const { Header, Content } = Layout;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
};

const IndicatorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const { data: indicator, isLoading } = useQuery({
    queryKey: ["indicator", slug],
    queryFn: () => indicatorApi.getBySlug(slug!).then((res: any) => res.data),
    enabled: !!slug,
  });

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
    green: "#10b981",
  };

  const handleCheckout = async (values: any) => {
    if (!indicator) return;

    try {
      const response = await indicatorApi.subscribe({
        indicator_id: (indicator as any)._id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        auto_renew: values.auto_renew,
      });

      const {
        subscription_id,
        qr_code_url,
        transfer_code,
        amount,
        bank,
        is_new_user,
        email,
      } = response.data;

      setShowCheckoutModal(false);

      // Show payment modal
      const modal = Modal.info({
        title: "Thanh toán thuê Indicator",
        icon: null,
        content: (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <Text type="secondary" style={{ display: "block" }}>
              Quét mã QR hoặc chuyển khoản với nội dung bên dưới
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
                value={qr_code_url}
                size={200}
                style={{ margin: "0 auto", borderRadius: 8 }}
              />
            </div>

            <Alert
              message="Nội dung chuyển khoản (Bắt buộc)"
              description={
                <Text
                  copyable={{ text: transfer_code }}
                  strong
                  style={{
                    fontSize: 24,
                    color: colors.primary,
                    letterSpacing: 1,
                  }}
                >
                  {transfer_code}
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
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ngân hàng
                </Text>
                <br />
                <Text strong>{bank.bank_name}</Text>
              </Card>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chủ tài khoản
                </Text>
                <br />
                <Text strong>{bank.acc_name}</Text>
              </Card>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tài khoản
                </Text>
                <br />
                <Text strong copyable>
                  {bank.acc_no}
                </Text>
              </Card>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tiền
                </Text>
                <br />
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatPrice(amount)}
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
                    style={{ fontSize: 18, color: colors.primary }}
                    spin
                  />
                }
              />
              <Text strong style={{ color: colors.primary }}>
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

      // Store pollInterval reference
      let pollInterval: ReturnType<typeof setInterval>;

      // Handle cancel
      const handleClosePayment = () => {
        Modal.confirm({
          title: "Hủy thanh toán?",
          content: "Đơn hàng sẽ bị xóa khỏi hệ thống.",
          okText: "Hủy đơn hàng",
          cancelText: "Tiếp tục thanh toán",
          okButtonProps: { danger: true },
          onOk: async () => {
            clearInterval(pollInterval);
            modal.destroy();
            try {
              await indicatorApi.cancelSubscription(subscription_id);
              message.success("Đã hủy đơn hàng");
            } catch (e) {
              console.error("Cancel error:", e);
            }
          },
        });
      };

      // Update modal with cancel button
      modal.update({
        content: (
          <div style={{ textAlign: "center", paddingTop: 10 }}>
            <Text type="secondary" style={{ display: "block" }}>
              Quét mã QR hoặc chuyển khoản với nội dung bên dưới
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
                value={qr_code_url}
                size={200}
                style={{ margin: "0 auto", borderRadius: 8 }}
              />
            </div>

            <Alert
              message="Nội dung chuyển khoản (Bắt buộc)"
              description={
                <Text
                  copyable={{ text: transfer_code }}
                  strong
                  style={{
                    fontSize: 24,
                    color: colors.primary,
                    letterSpacing: 1,
                  }}
                >
                  {transfer_code}
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
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ngân hàng
                </Text>
                <br />
                <Text strong>{bank.bank_name}</Text>
              </Card>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Chủ tài khoản
                </Text>
                <br />
                <Text strong>{bank.acc_name}</Text>
              </Card>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tài khoản
                </Text>
                <br />
                <Text strong copyable>
                  {bank.acc_no}
                </Text>
              </Card>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Số tiền
                </Text>
                <br />
                <Text strong style={{ color: "#ff4d4f" }}>
                  {formatPrice(amount)}
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
                    style={{ fontSize: 18, color: colors.primary }}
                    spin
                  />
                }
              />
              <Text strong style={{ color: colors.primary }}>
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

      // Start polling
      pollInterval = setInterval(async () => {
        try {
          const statusRes =
            await indicatorApi.getSubscriptionStatus(subscription_id);
          if (statusRes.data.status === "ACTIVE") {
            clearInterval(pollInterval);
            modal.destroy();

            // Success modal
            Modal.success({
              title: "Thanh toán thành công!",
              width: 500,
              content: (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div
                    style={{
                      fontSize: 60,
                      color: colors.green,
                      marginBottom: 20,
                    }}
                  >
                    <CheckCircleOutlined />
                  </div>
                  <Title level={4}>Bạn đã thuê thành công!</Title>

                  {is_new_user ? (
                    <Alert
                      type="success"
                      message="Tài khoản mới đã được tạo"
                      description={
                        <div style={{ textAlign: "left" }}>
                          <Text>
                            Thông tin đăng nhập đã được gửi đến:{" "}
                            <Text strong>{email}</Text>
                          </Text>
                          <br />
                          <Text>Vui lòng check email để lấy mật khẩu.</Text>
                        </div>
                      }
                      icon={<MdAccountCircle style={{ fontSize: 24 }} />}
                      showIcon
                      style={{ borderRadius: 12, marginTop: 16 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 16 }}>
                      Indicator đã được thêm vào tài khoản của bạn.
                    </Text>
                  )}

                  <Card
                    style={{
                      marginTop: 24,
                      borderRadius: 12,
                      background: colors.slate50,
                    }}
                  >
                    <Text strong>Bạn đã có quyền truy cập:</Text>
                    <br />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: colors.slate800,
                      }}
                    >
                      {indicator?.name}
                    </Text>
                  </Card>
                </div>
              ),
              okText: "Xem Indicator của tôi",
              onOk: () => navigate("/my-indicators"),
            });
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!indicator) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Title level={3}>Không tìm thấy Indicator</Title>
        <Button onClick={() => navigate("/indicators")}>Quay lại</Button>
      </div>
    );
  }

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
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            padding: "0 5%",
            borderBottom: `1px solid ${colors.slate100}`,
            height: "80px",
          }}
        >
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/indicators")}
            style={{ marginRight: 16 }}
          >
            Quay lại
          </Button>
          <Title level={4} style={{ margin: 0, color: colors.slate800 }}>
            Chi tiết Indicator
          </Title>
        </Header>

        <Content style={{ padding: "40px 5%", background: colors.slate50 }}>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "none",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
                  }}
                >
                  {/* Cover */}
                  <div
                    style={{
                      height: 280,
                      background: `linear-gradient(135deg, ${colors.primary}20, ${colors.highlight}20)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: -24,
                      marginBottom: 24,
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
                          fontSize: 120,
                          color: colors.primary,
                          opacity: 0.5,
                        }}
                      />
                    )}
                  </div>

                  <Tag color="orange" style={{ marginBottom: 16 }}>
                    <ThunderboltOutlined /> Subscription
                  </Tag>

                  <Title level={2} style={{ marginBottom: 16 }}>
                    {indicator.name}
                  </Title>

                  <Paragraph style={{ fontSize: 16, color: colors.slate600 }}>
                    {indicator.description ||
                      "Thuê indicator chuyên nghiệp từ chuyên gia."}
                  </Paragraph>

                  <Divider />

                  {/* Contact Info - Only for subscribers */}
                  {indicator.has_subscription ? (
                    <div>
                      <Title level={4} style={{ color: colors.green }}>
                        <CheckCircleOutlined /> Thông tin liên hệ
                      </Title>
                      <Space
                        direction="vertical"
                        size="middle"
                        style={{ width: "100%" }}
                      >
                        {indicator.owner_name && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <UserOutlined
                              style={{ fontSize: 20, color: colors.primary }}
                            />
                            <div>
                              <Text type="secondary">Người cung cấp</Text>
                              <br />
                              <Text strong style={{ fontSize: 16 }}>
                                {indicator.owner_name}
                              </Text>
                            </div>
                          </div>
                        )}
                        {indicator.contact_email && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <MailOutlined
                              style={{ fontSize: 20, color: colors.primary }}
                            />
                            <div>
                              <Text type="secondary">Email</Text>
                              <br />
                              <Text strong copyable style={{ fontSize: 16 }}>
                                {indicator.contact_email}
                              </Text>
                            </div>
                          </div>
                        )}
                        {indicator.contact_telegram && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <MessageOutlined
                              style={{ fontSize: 20, color: colors.primary }}
                            />
                            <div>
                              <Text type="secondary">Telegram</Text>
                              <br />
                              <Text strong copyable style={{ fontSize: 16 }}>
                                {indicator.contact_telegram}
                              </Text>
                            </div>
                          </div>
                        )}
                        {indicator.description_detail && (
                          <div style={{ marginTop: 16 }}>
                            <Text type="secondary">Chi tiết hướng dẫn</Text>
                            <Paragraph
                              style={{ marginTop: 8, whiteSpace: "pre-wrap" }}
                            >
                              {indicator.description_detail}
                            </Paragraph>
                          </div>
                        )}
                      </Space>
                    </div>
                  ) : (
                    <Alert
                      type="info"
                      message="Thông tin liên hệ sẽ được hiển thị sau khi bạn thuê Indicator này"
                      showIcon
                      style={{ borderRadius: 12 }}
                    />
                  )}
                </Card>
              </motion.div>
            </Col>

            <Col xs={24} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card
                  style={{
                    borderRadius: 20,
                    border: "none",
                    boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
                    position: "sticky",
                    top: 100,
                  }}
                >
                  <Title level={4} style={{ marginBottom: 24 }}>
                    Đăng ký thuê
                  </Title>

                  <div style={{ marginBottom: 24 }}>
                    <Text type="secondary">Giá thuê hàng tháng</Text>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: 36,
                          color: colors.primary,
                          lineHeight: 1.2,
                        }}
                      >
                        {formatPrice(indicator.price_monthly)}
                      </Text>
                      <Text type="secondary"> /tháng</Text>
                    </div>
                  </div>

                  {indicator.has_subscription ? (
                    <Alert
                      type="success"
                      message="Bạn đang thuê Indicator này"
                      showIcon
                      icon={<CheckCircleOutlined />}
                      style={{ borderRadius: 12 }}
                    />
                  ) : (
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={() => setShowCheckoutModal(true)}
                      style={{
                        height: 56,
                        fontSize: 18,
                        fontWeight: 600,
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.highlight})`,
                      }}
                    >
                      <ThunderboltOutlined /> Thuê ngay
                    </Button>
                  )}

                  <Divider />

                  <Space direction="vertical" size="small">
                    <Text>✓ Truy cập đầy đủ thông tin liên hệ</Text>
                    <Text>✓ Hỗ trợ qua email & Telegram</Text>
                    <Text>✓ Hủy bất cứ lúc nào</Text>
                    <Text>✓ Tự động gia hạn</Text>
                  </Space>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Content>
      </Layout>

      {/* Checkout Modal */}
      <Modal
        title="Thông tin thuê Indicator"
        open={showCheckoutModal}
        onCancel={() => setShowCheckoutModal(false)}
        footer={null}
        width={480}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheckout}
          initialValues={{
            name: user?.name || "",
            email: user?.email || "",
            auto_renew: true,
          }}
        >
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input size="large" placeholder="email@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input size="large" placeholder="0901234567" />
          </Form.Item>

          <Form.Item name="auto_renew" valuePropName="checked">
            <Checkbox>Tự động gia hạn hàng tháng</Checkbox>
          </Form.Item>

          <div
            style={{
              background: colors.slate50,
              padding: 16,
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text>Phí thuê tháng đầu</Text>
              <Text strong style={{ color: colors.primary }}>
                {formatPrice(indicator.price_monthly)}
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            block
            htmlType="submit"
            style={{
              height: 52,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.highlight})`,
            }}
          >
            Tiến hành thanh toán
          </Button>
        </Form>
      </Modal>
    </ConfigProvider>
  );
};

export default IndicatorDetailPage;
