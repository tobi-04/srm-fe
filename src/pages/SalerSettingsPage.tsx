import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Form,
  Input,
  Select,
  Button,
  Spin,
  Alert,
  message,
  Space,
  Avatar,
} from "antd";
import { MdSave, MdAccountBalance } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import salerApi, { BankAccount } from "../api/salerApi";

const { Title, Text } = Typography;

interface VietQRBank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export default function SalerSettingsPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [banks, setBanks] = useState<VietQRBank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  // Fetch banks from VietQR API
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const data = await response.json();
        if (data.code === "00" && data.data) {
          setBanks(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        message.error("Không thể tải danh sách ngân hàng");
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  // Fetch current bank account
  const { data: bankData, isLoading: loadingBankAccount } = useQuery({
    queryKey: ["saler-bank-account"],
    queryFn: () => salerApi.getBankAccount(),
  });

  // Set form values when bank account data is loaded
  useEffect(() => {
    if (bankData?.bank_account) {
      form.setFieldsValue(bankData.bank_account);
    }
  }, [bankData, form]);

  // Update bank account mutation
  const updateMutation = useMutation({
    mutationFn: (data: BankAccount) => salerApi.updateBankAccount(data),
    onSuccess: (result) => {
      message.success(result.message);
      queryClient.invalidateQueries({ queryKey: ["saler-bank-account"] });
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.",
      );
    },
  });

  const handleBankChange = (bankCode: string) => {
    const selectedBank = banks.find((b) => b.code === bankCode);
    if (selectedBank) {
      form.setFieldsValue({
        bank_code: selectedBank.code,
        bank_name: selectedBank.name,
      });
    }
  };

  const handleSubmit = (values: BankAccount) => {
    updateMutation.mutate(values);
  };

  if (loadingBankAccount) {
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
          Cài đặt
        </Title>
        <Text className="page-subtitle">
          Quản lý thông tin tài khoản ngân hàng để nhận hoa hồng
        </Text>
      </div>

      <Card
        title={
          <Space>
            <MdAccountBalance size={20} />
            <span>Thông tin tài khoản ngân hàng</span>
          </Space>
        }
        style={{ margin: "0 auto" }}>
        {!bankData?.bank_account && (
          <Alert
            message="Chưa có thông tin ngân hàng"
            description="Vui lòng cập nhật thông tin tài khoản ngân hàng để nhận thanh toán hoa hồng."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
          className="w-full">
          <Form.Item
            name="bank_code"
            label="Ngân hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}>
            <Select
              showSearch
              placeholder="Chọn ngân hàng"
              loading={loadingBanks}
              onChange={handleBankChange}
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              optionLabelProp="label">
              {banks.map((bank) => (
                <Select.Option
                  key={bank.code}
                  value={bank.code}
                  label={bank.shortName}>
                  <Space>
                    <Avatar
                      src={bank.logo}
                      size="small"
                      shape="square"
                      style={{ background: "#fff" }}
                    />
                    <span>
                      {bank.shortName} - {bank.name}
                    </span>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="bank_name" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="account_number"
            label="Số tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản" },
              { min: 6, message: "Số tài khoản phải có ít nhất 6 ký tự" },
            ]}>
            <Input placeholder="Nhập số tài khoản" maxLength={30} />
          </Form.Item>

          <Form.Item
            name="account_holder"
            label="Tên chủ tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ tài khoản" },
            ]}
            extra="Tên sẽ được tự động chuyển sang chữ in hoa">
            <Input
              placeholder="VD: NGUYEN VAN A"
              maxLength={100}
              style={{ textTransform: "uppercase" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMutation.isPending}
              icon={<MdSave />}
              size="large"
              style={{ width: "100%" }}>
              Lưu thông tin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  );
}
