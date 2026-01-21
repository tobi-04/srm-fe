import { useEffect, useState } from "react";
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
  Tabs,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdSave,
  MdClose,
  MdSecurity,
  MdLock,
} from "react-icons/md";
import { studentApi } from "../api/studentApi";
import { authApi } from "../api/auth";
import { getAvatarStyles } from "../utils/color";

const { Title, Text } = Typography;

interface ProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileDialog({ open, onClose }: ProfileDialogProps) {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState("profile");
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

  const changePasswordMutation = useMutation({
    mutationFn: (values: any) =>
      authApi.changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      }),
    onSuccess: () => {
      message.success("Đổi mật khẩu thành công");
      passwordForm.resetFields();
      setActiveTab("profile");
      onClose();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Đổi mật khẩu thất bại";
      message.error(errorMsg);
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

  const handlePasswordSubmit = (values: any) => {
    changePasswordMutation.mutate(values);
  };

  const tabsItems = [
    {
      key: "profile",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MdPerson size={18} /> Thông tin cá nhân
        </span>
      ),
      children: (
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
                  ...getAvatarStyles(profile?.name || profile?.email || "User"),
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
      ),
    },
    {
      key: "security",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MdSecurity size={18} /> Bảo mật
        </span>
      ),
      children: (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <Title level={4} style={{ marginBottom: 8 }}>
            Đổi mật khẩu
          </Title>
          <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
            Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới
          </Text>

          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordSubmit}>
            <Form.Item
              label="Mật khẩu hiện tại"
              name="old_password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}>
              <Input.Password
                prefix={<MdLock size={18} style={{ color: "#94a3b8" }} />}
                placeholder="Nhập mật khẩu hiện tại"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu mới"
              name="new_password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}>
              <Input.Password
                prefix={<MdLock size={18} style={{ color: "#94a3b8" }} />}
                placeholder="Nhập mật khẩu mới"
              />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu mới"
              name="confirm_password"
              dependencies={["new_password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("new_password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp"),
                    );
                  },
                }),
              ]}>
              <Input.Password
                prefix={<MdLock size={18} style={{ color: "#94a3b8" }} />}
                placeholder="Xác nhận mật khẩu mới"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={changePasswordMutation.isPending}
                icon={<MdSave />}
                block>
                Cập nhật mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={activeTab === "profile" ? 700 : 500} // Smaller for password tab
      closeIcon={<MdClose size={20} />}
      styles={{
        body: { padding: "24px 32px 32px" },
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
            Quản lý thông tin tài khoản và bảo mật của bạn
          </Text>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabsItems}
            style={{ marginTop: -8 }}
          />
        </>
      )}
    </Modal>
  );
}
