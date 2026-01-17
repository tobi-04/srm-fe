import { useState, useEffect } from "react";
import { Modal, Button, Typography, Space } from "antd";
import { MdLock, MdLogout, MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const { Title, Text, Paragraph } = Typography;

export default function AccountLockedModal() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const handleAccountLocked = (event: CustomEvent) => {
      setMessage(event.detail?.message || "Tài khoản của bạn đã bị khóa.");
      setVisible(true);
    };

    window.addEventListener(
      "account-locked",
      handleAccountLocked as EventListener
    );

    return () => {
      window.removeEventListener(
        "account-locked",
        handleAccountLocked as EventListener
      );
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setVisible(false);
    navigate("/login");
  };

  return (
    <Modal
      open={visible}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      centered
      width={420}>
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}>
          <MdLock size={40} color="#dc2626" />
        </div>

        <Title level={3} style={{ marginBottom: 8, color: "#1e293b" }}>
          Tài khoản đã bị khóa
        </Title>

        <Paragraph style={{ color: "#64748b", marginBottom: 24 }}>
          {message}
        </Paragraph>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div
            style={{
              background: "#f1f5f9",
              borderRadius: 12,
              padding: 16,
              textAlign: "left",
            }}>
            <Space>
              <MdEmail size={20} color="#6366f1" />
              <Text strong>Liên hệ hỗ trợ:</Text>
            </Space>
            <Paragraph style={{ margin: "8px 0 0", color: "#475569" }}>
              Vui lòng liên hệ Admin qua email hoặc hotline để được hỗ trợ mở
              khóa tài khoản.
            </Paragraph>
          </div>

          <Button
            type="primary"
            danger
            size="large"
            block
            icon={<MdLogout size={20} />}
            onClick={handleLogout}
            style={{ height: 48, fontWeight: 600 }}>
            Đăng xuất
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
