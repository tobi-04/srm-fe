import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Card,
  Table,
  Tag,
  Select,
  Space,
  Modal,
  Input,
  message,
  Spin,
  Descriptions,
  Dropdown,
  Button,
  Row,
  Col,
  Image,
  Statistic,
} from "antd";
import { MdCheck, MdClose, MdMoreVert } from "react-icons/md";
import DashboardLayout from "../components/DashboardLayout";
import adminWithdrawalApi, {
  WithdrawalRequest,
} from "../api/adminWithdrawalApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AdminWithdrawalListPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const queryClient = useQueryClient();

  // Fetch withdrawal requests
  const { data, isLoading } = useQuery({
    queryKey: ["admin-withdrawals", statusFilter],
    queryFn: () =>
      adminWithdrawalApi.getRequests({
        page: 1,
        limit: 50,
        status: statusFilter || undefined,
      }),
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ["admin-withdrawal-stats"],
    queryFn: adminWithdrawalApi.getStatistics,
  });

  // Process mutation
  const processMutation = useMutation({
    mutationFn: (params: {
      id: string;
      status: "approved" | "rejected";
      reject_reason?: string;
    }) =>
      adminWithdrawalApi.processRequest(params.id, {
        status: params.status,
        reject_reason: params.reject_reason,
      }),
    onSuccess: (_, variables) => {
      message.success(
        variables.status === "approved"
          ? "Đã duyệt yêu cầu rút tiền!"
          : "Đã từ chối yêu cầu rút tiền",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-stats"] });
      setIsDetailOpen(false);
      setIsRejectOpen(false);
      setRejectReason("");
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Không thể xử lý yêu cầu");
    },
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

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

  const handleRowClick = (record: WithdrawalRequest) => {
    setSelectedRequest(record);
    setIsDetailOpen(true);
  };

  const handleApprove = (request: WithdrawalRequest) => {
    Modal.confirm({
      title: "Xác nhận duyệt yêu cầu rút tiền?",
      content: (
        <div>
          <p>
            <strong>Saler:</strong> {request.user_id.name}
          </p>
          <p>
            <strong>Số tiền thực nhận:</strong>{" "}
            {formatCurrency(request.net_amount)}
          </p>
          <p>
            <strong>Ngân hàng:</strong> {request.bank_account.bank_name}
          </p>
          <p>
            <strong>STK:</strong> {request.bank_account.account_number}
          </p>
          <p>
            <strong>Chủ TK:</strong> {request.bank_account.account_holder}
          </p>
        </div>
      ),
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: () => {
        processMutation.mutate({ id: request._id, status: "approved" });
      },
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    if (selectedRequest) {
      processMutation.mutate({
        id: selectedRequest._id,
        status: "rejected",
        reject_reason: rejectReason,
      });
    }
  };

  // Generate VietQR URL
  const generateQRUrl = (request: WithdrawalRequest) => {
    const bankCode = request.bank_account?.bank_code || "";
    const accountNumber = request.bank_account?.account_number || "";
    const accountName = encodeURIComponent(
      request.bank_account?.account_holder || "",
    );
    const amount = request.net_amount;
    const description = encodeURIComponent(
      `Rut tien hoa hong ${request._id.slice(-6)}`,
    );

    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${description}&accountName=${accountName}`;
  };

  const getDropdownItems = (record: WithdrawalRequest) => {
    const items: any[] = [
      {
        key: "view",
        label: "Xem chi tiết",
        onClick: () => {
          setSelectedRequest(record);
          setIsDetailOpen(true);
        },
      },
    ];

    if (record.status === "pending") {
      items.push(
        {
          key: "approve",
          label: (
            <span style={{ color: "#10b981" }}>
              <MdCheck style={{ marginRight: 8 }} />
              Duyệt
            </span>
          ),
          onClick: () => handleApprove(record),
        },
        {
          key: "reject",
          label: (
            <span style={{ color: "#ef4444" }}>
              <MdClose style={{ marginRight: 8 }} />
              Từ chối
            </span>
          ),
          onClick: () => {
            setSelectedRequest(record);
            setIsRejectOpen(true);
          },
        },
      );
    }

    return items;
  };

  const columns = [
    {
      title: "Saler",
      key: "saler",
      render: (_: any, record: WithdrawalRequest) => (
        <div>
          <Text strong>{record.user_id?.name || "N/A"}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.user_id?.email || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: any, record: WithdrawalRequest) => (
        <Dropdown
          menu={{ items: getDropdownItems(record) }}
          trigger={["click"]}
          placement="bottomRight">
          <Button
            type="text"
            icon={<MdMoreVert size={20} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

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
          Quản lý yêu cầu rút tiền
        </Title>
        <Text className="page-subtitle">
          Xem và xử lý các yêu cầu rút tiền từ Saler
        </Text>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Yêu cầu chờ xử lý"
              value={stats?.pending || 0}
              valueStyle={{ color: "#f59e0b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats?.approved || 0}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã từ chối"
              value={stats?.rejected || 0}
              valueStyle={{ color: "#ef4444" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng đã chi trả"
              value={formatCurrency(stats?.total_paid || 0)}
              valueStyle={{ color: "#3b82f6", fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        extra={
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            placeholder="Lọc theo trạng thái">
            <Select.Option value="">Tất cả</Select.Option>
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="approved">Đã duyệt</Select.Option>
            <Select.Option value="rejected">Từ chối</Select.Option>
          </Select>
        }>
        <Table
          dataSource={data?.data || []}
          columns={columns}
          rowKey="_id"
          pagination={{
            total: data?.meta?.total || 0,
            pageSize: 50,
            showSizeChanger: false,
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: "pointer" },
          })}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu rút tiền"
        open={isDetailOpen}
        onCancel={() => setIsDetailOpen(false)}
        footer={
          selectedRequest?.status === "pending" ? (
            <Space>
              <Button onClick={() => setIsDetailOpen(false)}>Đóng</Button>
              <Button
                danger
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsRejectOpen(true);
                }}>
                Từ chối
              </Button>
              <Button
                type="primary"
                onClick={() => handleApprove(selectedRequest)}
                loading={processMutation.isPending}>
                Duyệt
              </Button>
            </Space>
          ) : null
        }
        width={700}>
        {selectedRequest && (
          <Row gutter={24}>
            <Col span={14}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Saler">
                  {selectedRequest.user_id?.name} (
                  {selectedRequest.user_id?.email})
                </Descriptions.Item>
                <Descriptions.Item label="Ngày yêu cầu">
                  {dayjs(selectedRequest.created_at).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền yêu cầu">
                  {formatCurrency(selectedRequest.amount)}
                </Descriptions.Item>
                <Descriptions.Item label="Phí">
                  {formatCurrency(selectedRequest.fee_amount)} (
                  {selectedRequest.fee_rate}%)
                </Descriptions.Item>
                <Descriptions.Item label="Thực nhận">
                  <Text strong style={{ color: "#10b981", fontSize: 16 }}>
                    {formatCurrency(selectedRequest.net_amount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngân hàng">
                  {selectedRequest.bank_account?.bank_name}
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">
                  <Text copyable>
                    {selectedRequest.bank_account?.account_number}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Chủ tài khoản">
                  {selectedRequest.bank_account?.account_holder}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {getStatusTag(selectedRequest.status)}
                </Descriptions.Item>
                {selectedRequest.reject_reason && (
                  <Descriptions.Item label="Lý do từ chối">
                    <Text type="danger">{selectedRequest.reject_reason}</Text>
                  </Descriptions.Item>
                )}
                {selectedRequest.processed_at && (
                  <Descriptions.Item label="Ngày xử lý">
                    {dayjs(selectedRequest.processed_at).format(
                      "DD/MM/YYYY HH:mm",
                    )}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>
            <Col span={10}>
              <div
                style={{
                  textAlign: "center",
                  padding: 16,
                  background: "#f8fafc",
                  borderRadius: 8,
                }}>
                <Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 8 }}>
                  QR Code chuyển khoản
                </Text>
                <Image
                  src={generateQRUrl(selectedRequest)}
                  alt="VietQR Code"
                  style={{ maxWidth: "100%", borderRadius: 8 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                />
              </div>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối yêu cầu rút tiền"
        open={isRejectOpen}
        onCancel={() => {
          setIsRejectOpen(false);
          setRejectReason("");
        }}
        onOk={handleReject}
        confirmLoading={processMutation.isPending}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}>
        <div style={{ marginBottom: 16 }}>
          <Text>
            Bạn đang từ chối yêu cầu rút tiền của{" "}
            <strong>{selectedRequest?.user_id?.name}</strong>
          </Text>
        </div>
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </DashboardLayout>
  );
}
