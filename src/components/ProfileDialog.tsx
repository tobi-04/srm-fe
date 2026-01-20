import { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  message,
  Avatar,
  Typography,
  Row,
  Col,
  Spin,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdPerson, MdEmail, MdPhone, MdSave, MdClose } from "react-icons/md";
import { studentApi } from "../api/studentApi";
import { getAvatarStyles } from "../utils/color";

const { Title, Text } = Typography;

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentApi.getProfile(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: open, // Only fetch when dialog is open
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => studentApi.updateProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      message.success("Cập nhật thông tin thành công");
      onClose();
    },
    onError: () => {
      message.error("Cập nhật thất bại");
    },
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
    }
  }, [profile, form]);

  const handleSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      closeIcon={<MdClose size={20} />}
      styles={{
        body: { padding: "32px" },
      }}>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Title level={3} style={{ marginBottom: 8 }}>
            Hồ sơ cá nhân
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
            Quản lý thông tin tài khoản của bạn
          </Text>

          <Row gutter={24}>
            {/* Profile Info */}
            <Col xs={24} sm={8}>
              <div style={{ textAlign: "center" }}>
                <Avatar
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 16,
                    margin: "0 auto 16px",
                    ...getAvatarStyles(
                      profile?.name || profile?.email || "User",
                    ),
                    fontSize: 28,
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {profile?.name ? (
                    profile.name.substring(0, 2).toUpperCase()
                  ) : (
                    <MdPerson size={40} />
                  )}
                </Avatar>
                <Title level={5} style={{ margin: "0 0 4px 0" }}>
                  {profile?.name || "User"}
                </Title>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: 12, marginBottom: 8 }}>
                  {profile?.email}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Tham gia:{" "}
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("vi-VN")
                    : "N/A"}
                </Text>
              </div>
            </Col>

            {/* Edit Form */}
            <Col xs={24} sm={16}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  name: profile?.name,
                  email: profile?.email,
                  phone: profile?.phone,
                }}>
                <Form.Item
                  label="Họ và tên"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ tên" },
                    { min: 2, message: "Họ tên phải có ít nhất 2 ký tự" },
                  ]}>
                  <Input
                    prefix={<MdPerson size={18} style={{ color: "#94a3b8" }} />}
                    placeholder="Nhập họ và tên"
                  />
                </Form.Item>

                <Form.Item label="Email" name="email">
                  <Input
                    prefix={<MdEmail size={18} style={{ color: "#94a3b8" }} />}
                    placeholder="Nhập email"
                    disabled
                  />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    {
                      pattern: /^[0-9]{10,11}$/,
                      message: "Số điện thoại không hợp lệ",
                    },
                  ]}>
                  <Input
                    prefix={<MdPhone size={18} style={{ color: "#94a3b8" }} />}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateMutation.isPending}
                    icon={<MdSave />}
                    block>
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </>
      )}
    </Modal>
  );
}
