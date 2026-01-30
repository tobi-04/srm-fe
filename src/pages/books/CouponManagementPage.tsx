import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Tag,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { couponApi } from "../../api/bookApi";
import DashboardLayout from "../../components/DashboardLayout";

const { Title, Text } = Typography;
const { Option } = Select;

const CouponManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () =>
      couponApi
        .adminGetCoupons({ page: 1, limit: 100 })
        .then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => couponApi.adminCreateCoupon(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      message.success("Tạo mã giảm giá thành công");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || "Lỗi khi tạo mã giảm giá");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      couponApi.adminUpdateCoupon(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      message.success("Cập nhật mã giảm giá thành công");
      setIsModalOpen(false);
      setEditingCoupon(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponApi.adminDeleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      message.success("Xóa mã giảm giá thành công");
    },
  });

  const handleEdit = (record: any) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      ...record,
      expires_at: record.expires_at ? dayjs(record.expires_at) : null,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    // Force uppercase for code
    const formattedValues = {
      ...values,
      code: values.code.toUpperCase(),
      expires_at: values.expires_at ? values.expires_at.toISOString() : null,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, values: formattedValues });
    } else {
      createMutation.mutate(formattedValues);
    }
  };

  const columns = [
    {
      title: "Mã Coupon",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <Tag color="blue" style={{ fontWeight: "bold", fontSize: 13 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "PERCENTAGE" ? "purple" : "cyan"}>
          {type === "PERCENTAGE" ? "Phần trăm (%)" : "Số tiền cố định"}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value: number, record: any) =>
        record.type === "PERCENTAGE"
          ? `${value}%`
          : new Intl.NumberFormat("vi-VN").format(value) + " đ",
    },
    {
      title: "Giới hạn sử dụng",
      key: "usage",
      render: (record: any) => (
        <Text>
          {record.usage_count} / {record.usage_limit || "∞"}
        </Text>
      ),
    },
    {
      title: "Hết hạn",
      dataIndex: "expires_at",
      key: "expires_at",
      render: (date: string) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "Không giới hạn",
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Đang hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa mã này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/books")}
          />
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Mã giảm giá (Coupon)
          </Title>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCoupon(null);
            form.resetFields();
            setIsModalOpen(true);
          }}
          style={{ background: "#f78404", borderColor: "#f78404" }}
        >
          Tạo mã mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        rowKey="_id"
      />

      <Modal
        title={editingCoupon ? "Cập nhật Coupon" : "Tạo Coupon mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="code"
            label="Mã Coupon (Ví dụ: GIAMGIA10)"
            rules={[{ required: true, message: "Vui lòng nhập mã coupon" }]}
          >
            <Input
              placeholder="Nhập mã coupon"
              style={{ textTransform: "uppercase" }}
              onChange={(e) =>
                form.setFieldsValue({ code: e.target.value.toUpperCase() })
              }
            />
          </Form.Item>

          <Space style={{ display: "flex" }} align="baseline">
            <Form.Item
              name="type"
              label="Loại giảm giá"
              rules={[{ required: true }]}
              initialValue="PERCENTAGE"
              style={{ width: 230 }}
            >
              <Select>
                <Option value="PERCENTAGE">Phần trăm (%)</Option>
                <Option value="FIXED_AMOUNT">Số tiền cố định (đ)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="value"
              label="Giá trị giảm"
              rules={[{ required: true }]}
              style={{ width: 230 }}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Space>

          <Space style={{ display: "flex" }} align="baseline">
            <Form.Item
              name="usage_limit"
              label="Giới hạn sử dụng (0 = ∞)"
              initialValue={0}
              style={{ width: 230 }}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item
              name="expires_at"
              label="Ngày hết hạn"
              style={{ width: 230 }}
            >
              <DatePicker style={{ width: "100%" }} showTime />
            </Form.Item>
          </Space>

          <Form.Item
            name="is_active"
            label="Trạng thái"
            valuePropName="checked"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Đang hoạt động</Option>
              <Option value={false}>Ngừng hoạt động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
};

export default CouponManagementPage;
