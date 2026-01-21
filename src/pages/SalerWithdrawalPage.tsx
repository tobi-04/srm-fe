import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Form,
  InputNumber,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Alert,
  Spin,
  message,
} from "antd";
import {
  MdAccountBalanceWallet,
  MdSend,
  MdHistory,
  MdInfo,
} from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import salerApi, { withdrawalApi, WithdrawalRequest } from "../api/salerApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function SalerWithdrawalPage() {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewAmount, setPreviewAmount] = useState(0);
  const queryClient = useQueryClient();

  // Fetch withdrawal config
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["withdrawal-config"],
    queryFn: withdrawalApi.getConfig,
  });

  // Fetch commission summary for available balance
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["saler-commission-summary"],
    queryFn: salerApi.getCommissionSummary,
  });

  // Fetch withdrawal requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["saler-withdrawals"],
    queryFn: () => withdrawalApi.getMyRequests(1, 20),
  });

  // Create withdrawal mutation
  const createMutation = useMutation({
    mutationFn: (amount: number) => withdrawalApi.createRequest(amount),
    onSuccess: () => {
      message.success("Yêu cầu rút tiền đã được gửi!");
      queryClient.invalidateQueries({ queryKey: ["saler-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["saler-commission-summary"] });
      setIsModalOpen(false);
      form.resetFields();
      setPreviewAmount(0);
    },
    onError: (error: any) => {
      message.error(
        error.response?.data?.message || "Không thể tạo yêu cầu rút tiền",
      );
    },
  });

  const availableBalance = summary?.available?.total || 0;
  const feeRate = config?.fee_rate || 0;
  const minAmount = config?.min_withdrawal_amount || 0;

  const feeAmount = Math.round((previewAmount * feeRate) / 100);
  const netAmount = previewAmount - feeAmount;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleAmountChange = (value: number | null) => {
    setPreviewAmount(value || 0);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      createMutation.mutate(values.amount);
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: "warning", text: "Chờ xử lý" },
      approved: { color: "success", text: "Đã duyệt" },
      rejected: { color: "error", text: "Từ chối" },
      completed: { color: "blue", text: "Hoàn thành" },
    };
    const s = statusMap[status] || { color: "default", text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const columns = [
    {
      title: "Ngày yêu cầu",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số tiền yêu cầu",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Phí",
      dataIndex: "fee_amount",
      key: "fee_amount",
      render: (amount: number, record: WithdrawalRequest) =>
        `${formatCurrency(amount)} (${record.fee_rate}%)`,
    },
    {
      title: "Thực nhận",
      dataIndex: "net_amount",
      key: "net_amount",
      render: (amount: number) => (
        <Text strong style={{ color: "#10b981" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
  ];

  if (configLoading || summaryLoading) {
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
          Rút tiền
        </Title>
        <Text className="page-subtitle">
          Quản lý yêu cầu rút hoa hồng về tài khoản ngân hàng
        </Text>
      </div>

      {/* Balance Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Số dư khả dụng"
              value={formatCurrency(availableBalance)}
              prefix={<MdAccountBalanceWallet style={{ color: "#10b981" }} />}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Số tiền tối thiểu"
              value={formatCurrency(minAmount)}
              prefix={<MdInfo style={{ color: "#f59e0b" }} />}
              valueStyle={{ color: "#64748b", fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Phí rút tiền"
              value={`${feeRate}%`}
              prefix={<MdInfo style={{ color: "#3b82f6" }} />}
              valueStyle={{ color: "#64748b", fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Withdrawal Form */}
      <Card
        title={
          <Space>
            <MdSend size={20} />
            <span>Tạo yêu cầu rút tiền</span>
          </Space>
        }
        style={{ marginBottom: 24 }}>
        {!config?.is_active ? (
          <Alert
            message="Chức năng rút tiền tạm dừng"
            description="Vui lòng liên hệ quản trị viên để biết thêm thông tin."
            type="warning"
            showIcon
          />
        ) : availableBalance < minAmount ? (
          <Alert
            message="Số dư không đủ"
            description={`Bạn cần có ít nhất ${formatCurrency(minAmount)} để yêu cầu rút tiền.`}
            type="info"
            showIcon
          />
        ) : (
          <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
            <Form.Item
              name="amount"
              label="Số tiền muốn rút"
              rules={[
                { required: true, message: "Vui lòng nhập số tiền" },
                {
                  type: "number",
                  min: minAmount,
                  message: `Số tiền tối thiểu là ${formatCurrency(minAmount)}`,
                },
                {
                  type: "number",
                  max: availableBalance,
                  message: `Số tiền tối đa là ${formatCurrency(availableBalance)}`,
                },
              ]}>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập số tiền"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/,/g, "") as any}
                onChange={handleAmountChange}
                addonAfter="đ"
              />
            </Form.Item>

            {previewAmount > 0 && (
              <Card
                size="small"
                style={{
                  background: "#f8fafc",
                  marginBottom: 16,
                }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text type="secondary">Phí ({feeRate}%):</Text>
                    <br />
                    <Text>{formatCurrency(feeAmount)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Thực nhận:</Text>
                    <br />
                    <Text strong style={{ color: "#10b981" }}>
                      {formatCurrency(netAmount)}
                    </Text>
                  </Col>
                </Row>
              </Card>
            )}

            <Button
              type="primary"
              icon={<MdSend />}
              onClick={() => setIsModalOpen(true)}
              disabled={previewAmount < minAmount}>
              Gửi yêu cầu rút tiền
            </Button>
          </Form>
        )}
      </Card>

      {/* Withdrawal History */}
      <Card
        title={
          <Space>
            <MdHistory size={20} />
            <span>Lịch sử yêu cầu rút tiền</span>
          </Space>
        }>
        <Table
          dataSource={requests?.data || []}
          columns={columns}
          rowKey="_id"
          loading={requestsLoading}
          pagination={{
            total: requests?.meta?.total || 0,
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận yêu cầu rút tiền"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending}
        okText="Xác nhận"
        cancelText="Hủy">
        <div style={{ padding: "16px 0" }}>
          <p>
            <strong>Số tiền yêu cầu:</strong> {formatCurrency(previewAmount)}
          </p>
          <p>
            <strong>Phí rút tiền ({feeRate}%):</strong>{" "}
            {formatCurrency(feeAmount)}
          </p>
          <p>
            <strong>Số tiền thực nhận:</strong>{" "}
            <Text strong style={{ color: "#10b981", fontSize: 18 }}>
              {formatCurrency(netAmount)}
            </Text>
          </p>
          <Alert
            message="Lưu ý"
            description="Yêu cầu rút tiền sẽ được xử lý trong vòng 1-3 ngày làm việc."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
}
