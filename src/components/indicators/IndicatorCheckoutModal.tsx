import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Card,
  Alert,
  Spin,
  Space,
  Checkbox,
  message,
} from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { indicatorApi } from "../../api/indicatorApi";
import { useAuthStore } from "../../stores/authStore";
import { CouponInput } from "../payment/CouponInput";
import { PriceBreakdown } from "../payment/PriceBreakdown";

const { Title, Text } = Typography;

interface IndicatorCheckoutModalProps {
  open: boolean;
  onCancel: () => void;
  indicator: any;
}

export const IndicatorCheckoutModal: React.FC<IndicatorCheckoutModalProps> = ({
  open,
  onCancel,
  indicator,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [couponDiscount, setCouponDiscount] = React.useState(0);
  const [couponCode, setCouponCode] = React.useState("");

  // Safeguard
  if (!indicator) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const colors = {
    primary: "#f78404",
    green: "#10b981",
    slate50: "#f8fafc",
    slate800: "#1e293b",
  };

  const handleCheckout = async (values: any) => {
    try {
      const response = await indicatorApi.subscribe({
        indicator_id: indicator._id,
        name: values.name,
        email: values.email,
        phone: values.phone,
        auto_renew: values.auto_renew,
        coupon_code: couponCode || undefined,
      });

      onCancel(); // Close the info modal

      const {
        subscription_id,
        qr_code_url,
        transfer_code,
        amount,
        bank,
        is_new_user,
        email,
      } = response.data;

      // START OF PAYMENT MODAL
      const modal = Modal.info({
        title: "Thanh toán thuê Indicator",
        icon: null,
        width: 500,
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={qr_code_url}
                alt="Payment QR Code"
                style={{
                  width: 250,
                  height: 250,
                  borderRadius: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  background: "#fff",
                  padding: 10,
                }}
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
        footer: null,
        closable: false,
        maskClosable: false,
      });

      let pollInterval: ReturnType<typeof setInterval>;

      function handleClosePayment() {
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
      }

      // Start polling
      pollInterval = setInterval(async () => {
        try {
          const statusRes =
            await indicatorApi.getSubscriptionStatus(subscription_id);
          if (statusRes.data.status === "ACTIVE") {
            clearInterval(pollInterval);

            // Use extended data from statusRes if available, otherwise fallback to indicator
            const detailedIndicator = {
              ...indicator,
              ...statusRes.data,
            };

            modal.destroy();

            Modal.success({
              title: (
                <Space>
                  <CheckCircleOutlined style={{ color: colors.green }} />
                  <span>Thanh toán thành công!</span>
                </Space>
              ),
              width: 600,
              content: (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Title level={4} style={{ marginBottom: 24 }}>
                    Bạn đã thuê thành công!
                  </Title>

                  <div
                    style={{
                      background: colors.slate50,
                      padding: 20,
                      borderRadius: 16,
                      marginBottom: 24,
                      border: `1px solid ${colors.slate800}20`,
                      textAlign: "left",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 16,
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      Thông tin truy cập Indicator:
                    </Text>

                    <Space
                      direction="vertical"
                      size={12}
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">Tên:</Text>
                        <Text strong>{detailedIndicator.name}</Text>
                      </div>

                      {detailedIndicator.owner_name && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary">Chủ sở hữu:</Text>
                          <Text strong>{detailedIndicator.owner_name}</Text>
                        </div>
                      )}

                      {detailedIndicator.contact_telegram && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary">Telegram hỗ trợ:</Text>
                          <Text
                            strong
                            copyable={{
                              text: detailedIndicator.contact_telegram,
                            }}
                          >
                            {detailedIndicator.contact_telegram}
                          </Text>
                        </div>
                      )}

                      {detailedIndicator.contact_email && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary">Email hỗ trợ:</Text>
                          <Text strong>{detailedIndicator.contact_email}</Text>
                        </div>
                      )}
                    </Space>

                    {detailedIndicator.description_detail && (
                      <div
                        style={{
                          marginTop: 16,
                          paddingTop: 16,
                          borderTop: "1px dashed #d9d9d9",
                        }}
                      >
                        <Text
                          strong
                          style={{ display: "block", marginBottom: 8 }}
                        >
                          Hướng dẫn sử dụng:
                        </Text>
                        <div
                          className="indicator-instructions"
                          style={{ fontSize: 14, color: "#4b5563" }}
                          dangerouslySetInnerHTML={{
                            __html: detailedIndicator.description_detail,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {is_new_user ? (
                    <div style={{ textAlign: "left" }}>
                      <Alert
                        type="info"
                        showIcon
                        message={<Text strong>Thông tin tài khoản mới</Text>}
                        description={
                          <div style={{ marginTop: 8 }}>
                            <Text>
                              Hệ thống đã tự động tạo tài khoản và gửi mật khẩu
                              đăng nhập vào email:
                            </Text>
                            <br />
                            <Text
                              strong
                              style={{ fontSize: 16, color: colors.slate800 }}
                            >
                              {email}
                            </Text>
                            <div
                              style={{
                                marginTop: 12,
                                padding: "8px 12px",
                                background: "#fff",
                                borderRadius: 8,
                                border: "1px solid #bae7ff",
                              }}
                            >
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                💡 <b>Lưu ý:</b> Vui lòng kiểm tra mục{" "}
                                <b>Thư rác (Spam)</b> nếu không thấy email.
                              </Text>
                            </div>
                          </div>
                        }
                        style={{
                          borderRadius: 12,
                          border: "1px solid #91d5ff",
                        }}
                      />
                    </div>
                  ) : (
                    <Alert
                      type="success"
                      showIcon
                      message="Kích hoạt thành công"
                      description={
                        <Text>
                          Bạn có thể truy cập trang <b>My Indicators</b> bất cứ
                          lúc nào để xem lại thông tin hướng dẫn và liên hệ hỗ
                          trợ.
                        </Text>
                      }
                      style={{ borderRadius: 12, textAlign: "left" }}
                    />
                  )}

                  {true && (
                    <div style={{ marginTop: 24 }}>
                      <Button
                        type="default"
                        size="large"
                        block
                        style={{
                          height: 50,
                          borderRadius: 12,
                          borderColor: "#0068ff",
                          color: "#0068ff",
                          fontWeight: 600,
                          fontSize: 16,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                        onClick={() =>
                          window.open(
                            detailedIndicator.zalo_group_url || "https://zalo.me/g/something",
                            "_blank",
                          )
                        }
                      >
                        THAM GIA NHÓM ZALO NGAY
                      </Button>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, marginTop: 8, display: "block" }}
                      >
                        Tham gia nhóm để nhận hỗ trợ cài đặt và thảo luận tín
                        hiệu (Link: {detailedIndicator.zalo_group_url || "Chưa có link"})
                      </Text>
                    </div>
                  )}
                </div>
              ),
              okText: is_new_user ? "Đăng nhập ngay" : "Xem Indicator của tôi",
              onOk: () => {
                if (is_new_user) {
                  navigate("/login");
                } else {
                  navigate("/student/my-indicators");
                }
              },
            });
          }
        } catch (err) {
          console.error("Polling error:", err);
          // If user already has an active subscription, stop polling
          const errorMessage = (err as any)?.response?.data?.message;
          if (errorMessage === "Bạn đang thuê indicator này và vẫn còn hạn sử dụng") {
            clearInterval(pollInterval);
            modal.destroy();
            message.info(errorMessage);
          }
        }
      }, 3000);
      // END OF PAYMENT MODAL Logic
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi thuê");
    }
  };

  return (
    <Modal
      title="Thông tin thuê Indicator"
      open={open}
      onCancel={onCancel}
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

        <CouponInput
          resourceType="indicator"
          resourceId={indicator._id}
          originalPrice={indicator.price_monthly}
          defaultDiscount={0}
          onCouponApplied={(discount: number, code: string) => {
            setCouponDiscount(discount);
            setCouponCode(code);
          }}
          onCouponRemoved={() => {
            setCouponDiscount(0);
            setCouponCode("");
          }}
        />

        <div
          style={{
            background: colors.slate50,
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <PriceBreakdown
            originalPrice={indicator.price_monthly}
            defaultDiscount={0}
            couponDiscount={couponDiscount}
            couponCode={couponCode}
          />
        </div>

        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          style={{
            height: 48,
            fontSize: 16,
            fontWeight: 600,
            background: `linear-gradient(135deg, ${colors.primary}, #ff5e00)`,
            border: "none",
          }}
        >
          <ThunderboltOutlined /> Tiến hành thanh toán
        </Button>
      </Form>
    </Modal>
  );
};
