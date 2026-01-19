import { useState } from "react";
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  message,
  Spin,
  Row,
  Col,
  Avatar,
} from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdPerson, MdEmail, MdPhone, MdSave } from "react-icons/md";
import StudentDashboardLayout from "../components/StudentDashboardLayout";
import { studentApi } from "../api/studentApi";
import { getAvatarStyles } from "../utils/color";

const { Title, Text } = Typography;

export default function StudentProfilePage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentApi.getProfile(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => studentApi.updateProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      message.success("Cập nhật thông tin thành công");
    },
    onError: () => {
      message.error("Cập nhật thất bại");
    },
  });

  const handleSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <StudentDashboardLayout>
        <div
          style={{
            height: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <Spin size="large" />
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Hồ sơ cá nhân
          </Title>
          <Text type="secondary">Quản lý thông tin tài khoản của bạn</Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Info */}
          <Col xs={24} md={8}>
            <Card
              variant="borderless"
              style={{ borderRadius: 12, textAlign: "center" }}>
              <Avatar
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 20,
                  margin: "0 auto 16px",
                  ...getAvatarStyles(profile?.name || profile?.email || "User"),
                  fontSize: 32,
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                {profile?.name ? (
                  profile.name.substring(0, 2).toUpperCase()
                ) : (
                  <MdPerson size={48} />
                )}
              </Avatar>
              <Title level={4} style={{ margin: "0 0 4px 0" }}>
                {profile?.name || "Học viên"}
              </Title>
              <Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}>
                {profile?.email}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tham gia:{" "}
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("vi-VN")
                  : "N/A"}
              </Text>
            </Card>
          </Col>

          {/* Edit Form */}
          <Col xs={24} md={16}>
            <Card
              variant="borderless"
              style={{ borderRadius: 12 }}
              title={
                <Title level={4} style={{ margin: 0 }}>
                  Thông tin cá nhân
                </Title>
              }>
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  name: profile?.name,
                  email: profile?.email,
                  phone: profile?.phone,
                }}
                onFinish={handleSubmit}>
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
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="Email" name="email">
                  <Input
                    prefix={<MdEmail size={18} style={{ color: "#94a3b8" }} />}
                    placeholder="Nhập email"
                    disabled
                    size="large"
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
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={updateMutation.isPending}
                    icon={<MdSave />}
                    block
                    size="large">
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </StudentDashboardLayout>
  );
}
