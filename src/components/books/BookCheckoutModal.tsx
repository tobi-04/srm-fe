import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Row,
  Avatar,
  message,
  Space,
  Card,
  Alert,
  Spin,
  QRCode,
} from "antd";
import {
  CreditCardOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { MdAccountCircle } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { bookApi } from "../../api/bookApi";

const { Title, Text } = Typography;

interface BookCheckoutModalProps {
  open: boolean;
  onCancel: () => void;
  book: any;
}

export const BookCheckoutModal: React.FC<BookCheckoutModalProps> = ({
  open,
  onCancel,
  book,
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  // We keep the logic for showing the second step (payment info) inside this modal component
  // or we can handle it via a second modal.
  // In the original file, it closed the first modal and opened a second one via Modal.info.
  // We will replicate that behavior.

  // NOTE: In the original file, `handleCheckout` closes the modal (`setIsCheckoutModalOpen(false)`)
  // and then opens a `Modal.info`.
  // To keep it encapsulated, we might want to handle the "Payment Info" modal here too,
  // but Modal.info is a static method call.

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

      onCancel(); // Close current form modal

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
        width: 500,
        footer: null,
        closable: false,
        maskClosable: false,
      });

      // Store pollInterval reference for cleanup
      let pollInterval: NodeJS.Timeout;

      // Handle modal close with confirmation
      function handleClosePayment() {
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
      }

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

  return (
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
      open={open}
      onCancel={onCancel}
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
            <Text style={{ textDecoration: "line-through", color: "#94a3b8" }}>
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
                calculateDiscountedPrice(book.price, book.discount_percentage),
              )}
            </Text>
          </Row>
          <Text
            type="secondary"
            style={{ fontSize: 12, marginTop: 8, display: "block" }}
          >
            * Tổng thanh toán cuối cùng sẽ được tính lại nếu có mã giảm giá hợp
            lệ.
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
              background: "linear-gradient(135deg, #f78404 0%, #ff5e00 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(247, 132, 4, 0.2)",
            }}
          >
            XÁC NHẬN ĐẶT HÀNG
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
