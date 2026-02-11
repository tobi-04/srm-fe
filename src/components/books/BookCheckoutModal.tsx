import React from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Avatar,
  message,
  Space,
  Card,
  Alert,
  Spin,
} from "antd";
import {
  CreditCardOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { bookApi } from "../../api/bookApi";
import { CouponInput } from "../payment/CouponInput";
import { PriceBreakdown } from "../payment/PriceBreakdown";

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
  const [couponDiscount, setCouponDiscount] = React.useState(0);
  const [couponCode, setCouponCode] = React.useState("");

  // Safeguard: If book is missing, do not render or crash
  if (!book) {
    return null;
  }

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

  const handleCheckout = async (values: any) => {
    try {
      const response = await bookApi.checkout({
        book_id: book._id,
        ...values,
        coupon_code: couponCode || undefined,
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={response.data.qr_code_url}
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
      let pollInterval: ReturnType<typeof setInterval>;

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

            // Prepare book info with data from statusRes (like zalo link)
            const paidBook = {
              ...book,
              ...statusRes.data
            };

            // Show Success Dialog
            Modal.success({
              title: (
                <Space>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                  <span>Thanh toán thành công!</span>
                </Space>
              ),
              width: 550,
              content: (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Title level={4} style={{ marginBottom: 24 }}>Cảm ơn bạn đã mua sách!</Title>

                  <div style={{
                    background: "#f8fafc",
                    padding: 20,
                    borderRadius: 16,
                    marginBottom: 24,
                    border: "1px solid #e2e8f0",
                    textAlign: "left"
                  }}>
                    <Text strong style={{ fontSize: 16, display: "block", marginBottom: 8 }}>
                      Sản phẩm đã kích hoạt:
                    </Text>
                    <Text style={{ fontSize: 18, color: "#f78404", fontWeight: 700 }}>
                      {paidBook.title}
                    </Text>
                  </div>

                  {is_new_user ? (
                    <div style={{ textAlign: "left" }}>
                      <Alert
                        type="info"
                        showIcon
                        message={<Text strong>Thông tin tài khoản mới</Text>}
                        description={
                          <div style={{ marginTop: 8 }}>
                            <Text>Hệ thống đã tự động tạo tài khoản và gửi mật khẩu đăng nhập vào email:</Text>
                            <br />
                            <Text strong style={{ fontSize: 16, color: "#1e293b" }}>{email}</Text>
                            <div style={{ marginTop: 12, padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #bae7ff" }}>
                              <Text type="secondary" style={{ fontSize: 13 }}>
                                💡 <b>Lưu ý:</b> Nếu không thấy email trong Hộp thư đến, vui lòng kiểm tra mục <b>Thư rác (Spam)</b> hoặc <b>Quảng cáo</b>.
                              </Text>
                            </div>
                          </div>
                        }
                        style={{ borderRadius: 12, border: "1px solid #91d5ff" }}
                      />
                    </div>
                  ) : (
                    <Alert
                      type="success"
                      showIcon
                      message="Kích hoạt thành công"
                      description={
                        <Text>
                          Cuốn sách này đã được thêm vào thư viện của bạn. Bạn có thể truy cập <b>Dashboard</b> để xem và tải về ngay.
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
                        onClick={() => window.open(paidBook.zalo_group_url || "https://zalo.me/g/something", "_blank")}
                      >
                        THAM GIA NHÓM ZALO NGAY
                      </Button>
                      <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: "block" }}>
                        Tham gia nhóm để nhận hỗ trợ và thảo luận cùng cộng đồng (Link: {paidBook.zalo_group_url || "Chưa có link"})
                      </Text>
                    </div>
                  )}
                </div>
              ),
              okText: is_new_user ? "Đăng nhập ngay" : "Vào xem sách ngay",
              onOk: () => {
                if (is_new_user) {
                  navigate("/login");
                } else {
                  navigate("/student/dashboard");
                }
              },
            });
          }
        } catch (err) {
          console.error("Polling error:", err);
          // If user already owns the book, stop polling and show message
          const errorMessage = (err as any)?.response?.data?.message;
          if (errorMessage === "Bạn đã mua sách này rồi") {
            clearInterval(pollInterval);
            modal.destroy();
            message.info(errorMessage);
          }
        }
      }, 3000);
    } catch (error: any) {
      console.error("Book checkout error:", error);
      message.error(error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng");
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

        {/* Coupon Input */}
        <CouponInput
          resourceType="book"
          resourceId={book._id}
          originalPrice={book.price}
          defaultDiscount={
            book.discount_percentage
              ? Math.floor(book.price * (book.discount_percentage / 100))
              : 0
          }
          onCouponApplied={(discount: number, code: string) => {
            setCouponDiscount(discount);
            setCouponCode(code);
          }}
          onCouponRemoved={() => {
            setCouponDiscount(0);
            setCouponCode("");
          }}
        />

        {/* Price Breakdown */}
        <div
          style={{
            background: "#f8fafc",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
            border: "1px solid #e2e8f0",
          }}
        >
          <PriceBreakdown
            originalPrice={book.price}
            defaultDiscount={
              book.discount_percentage
                ? Math.floor(book.price * (book.discount_percentage / 100))
                : 0
            }
            couponDiscount={couponDiscount}
            couponCode={couponCode}
          />
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
