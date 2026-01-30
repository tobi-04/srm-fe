import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Form,
  InputNumber,
  Switch,
  Button,
  Spin,
  message,
  Space,
} from "antd";
import { MdSettings, MdSave } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import adminWithdrawalApi from "../api/adminWithdrawalApi";

const { Title, Text } = Typography;

export default function AdminWithdrawalConfigPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch config
  const { data: config, isLoading } = useQuery({
    queryKey: ["admin-withdrawal-config"],
    queryFn: adminWithdrawalApi.getConfig,
  });

  // Set form values when config loads
  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        min_withdrawal_amount: config.min_withdrawal_amount,
        fee_rate: config.fee_rate,
        is_active: config.is_active,
        withdrawal_start_day: config.withdrawal_start_day || 1,
        withdrawal_end_day: config.withdrawal_end_day || 31,
      });
    }
  }, [config, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: adminWithdrawalApi.updateConfig,
    onSuccess: () => {
      message.success("Cấu hình đã được cập nhật!");
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-config"] });
    },
    onError: () => {
      message.error("Không thể cập nhật cấu hình");
    },
  });

  const handleSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2} className="page-title">
          Cấu hình rút tiền
        </Title>
        <Text className="page-subtitle">
          Thiết lập điều kiện và phí rút tiền cho Saler
        </Text>
      </div>

      {/* Config Form */}
      <Card
        title={
          <Space>
            <MdSettings size={20} />
            <span>Cấu hình rút tiền</span>
          </Space>
        }>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional">
          <Form.Item
            name="min_withdrawal_amount"
            label="Số tiền rút tối thiểu"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền tối thiểu" },
            ]}
            extra="Saler cần có ít nhất số tiền này mới được phép rút">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={10000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/,/g, "") as any}
              addonAfter="đ"
            />
          </Form.Item>

          <Form.Item
            name="fee_rate"
            label="Phí rút tiền (%)"
            rules={[{ required: true, message: "Vui lòng nhập phí rút tiền" }]}
            extra="Phần trăm phí sẽ được trừ từ số tiền rút">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={100}
              step={0.5}
              precision={1}
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Cho phép rút tiền"
            valuePropName="checked"
            extra="Tắt để tạm dừng tất cả yêu cầu rút tiền">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>

          <Form.Item
            name="withdrawal_start_day"
            label="Ngày bắt đầu cho phép rút tiền"
            rules={[
              { required: true, message: "Vui lòng nhập ngày bắt đầu" },
            ]}
            extra="Ngày đầu tiên trong tháng được phép rút tiền (1-31)">
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={31}
              step={1}
              addonAfter="Ngày"
            />
          </Form.Item>

          <Form.Item
            name="withdrawal_end_day"
            label="Ngày kết thúc cho phép rút tiền"
            rules={[{ required: true, message: "Vui lòng nhập ngày kết thúc" }]}
            extra="Ngày cuối cùng trong tháng được phép rút tiền (1-31)">
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={31}
              step={1}
              addonAfter="Ngày"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMutation.isPending}
              icon={<MdSave />}
              size="large">
              Lưu cấu hình
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
