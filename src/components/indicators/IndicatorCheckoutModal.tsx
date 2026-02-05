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
  QRCode,
  Checkbox,
  message,
} from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { MdAccountCircle } from "react-icons/md";
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
            modal.destroy();

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
                      {indicator.name}
                    </Text>
                  </Card>
                </div>
              ),
              okText: "Xem Indicator của tôi",
              onOk: () => navigate("/student/my-indicators"),
            });
          }
        } catch (err) {
          console.error("Polling error:", err);
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
