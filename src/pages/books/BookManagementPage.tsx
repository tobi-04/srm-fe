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
  Upload,
  Divider,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  BookOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { MdSettings } from "react-icons/md";
import { bookApi } from "../../api/bookApi";
import DashboardLayout from "../../components/DashboardLayout";
import ImageUpload from "../../components/ImageUpload";

const { Title } = Typography;
const { Option } = Select;

const BookManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-books"],
    queryFn: () =>
      bookApi.adminGetBooks({ page: 1, limit: 100 }).then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (values: any) => bookApi.adminCreateBook(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      message.success("Tạo sách thành công");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Lỗi khi tạo sách";
      message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: any }) =>
      bookApi.adminUpdateBook(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      message.success("Cập nhật sách thành công");
      setIsModalOpen(false);
      setEditingBook(null);
      form.resetFields();
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Lỗi khi cập nhật sách";
      message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookApi.adminDeleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      message.success("Xóa sách thành công");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Lỗi khi xóa sách";
      message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => bookApi.adminDeleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
      message.success("Xóa file thành công");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Lỗi khi xóa file";
      message.error(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
    },
  });

  const handleEdit = (record: any) => {
    setEditingBook(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSubmit = (values: any) => {
    const formData = new FormData();

    // Only send what changed if we are editing
    Object.keys(values).forEach((key) => {
      const formValue = values[key];
      const originalValue = editingBook ? editingBook[key] : undefined;

      // Check if value is truly different
      if (formValue !== undefined && formValue !== null) {
        if (!editingBook || formValue !== originalValue) {
          formData.append(key, formValue);
        }
      }
    });

    // Always check for new files
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("files", file.originFileObj);
      }
    });

    // Only hit the API if something actually changed or new files were added
    const hasChanges = Array.from((formData as any).entries()).length > 0;

    if (editingBook) {
      if (!hasChanges) {
        setIsModalOpen(false);
        return;
      }
      updateMutation.mutate({ id: editingBook._id, values: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleShare = (record: any) => {
    const url = `${window.location.origin}/books/${record.slug}`;
    navigator.clipboard.writeText(url);
    message.success("Đã sao chép link chia sẻ vào bộ nhớ tạm");
  };

  const handleUploadFile = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", file.type.includes("pdf") ? "PDF" : "EPUB");

    try {
      await bookApi.adminUploadFile(selectedBookId!, formData);
      onSuccess("ok");
      message.success("Tải file lên thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-books"] });
    } catch (err) {
      onError(err);
      message.error("Tải file thất bại");
    }
  };

  const columns = [
    {
      title: "Ảnh bìa",
      dataIndex: "cover_image",
      key: "cover_image",
      render: (url: string) => (
        <img
          src={url}
          alt="Cover"
          style={{ width: 50, height: 70, objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Tên sách",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Tag color="blue" style={{ fontSize: 10 }}>
            {record.slug}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
    },
    {
      title: "Giảm giá (%)",
      dataIndex: "discount_percentage",
      key: "discount_percentage",
      render: (percent: number) => (
        <Tag color={percent > 0 ? "volcano" : "default"}>
          {percent > 0 ? `-${percent}%` : "0%"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "orange"}>
          {status === "ACTIVE" ? "Đang bán" : "Bản nháp"}
        </Tag>
      ),
    },
    {
      title: "Files",
      key: "files",
      render: (record: any) => (
        <Space direction="vertical" size={4}>
          {record.files?.map((f: any) => (
            <Tag
              key={f._id}
              closable
              onClose={() => deleteFileMutation.mutate(f._id)}
            >
              {f.file_type === "PDF" ? (
                <FilePdfOutlined />
              ) : (
                <FileTextOutlined />
              )}{" "}
              {f.file_type}
            </Tag>
          ))}
          <Button
            size="small"
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedBookId(record._id);
              setIsFileModalOpen(true);
            }}
          >
            Thêm file
          </Button>
        </Space>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<ShareAltOutlined />}
            onClick={() => handleShare(record)}
            type="dashed"
          >
            Chia sẻ
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sách này?"
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
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
          alignItems: "center",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Quản lý Sách (Book Store)
        </Title>
        <Space>
          <Button
            type="default"
            icon={<MdSettings />}
            onClick={() => navigate("/admin/books/coupons")}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            Quản lý Coupon
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBook(null);
              setFileList([]);
              form.resetFields();
              setIsModalOpen(true);
            }}
            style={{
              background: "#f78404",
              borderColor: "#f78404",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Thêm sách mới
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        rowKey="_id"
        pagination={{ pageSize: 20 }}
        style={{ background: "#fff", padding: 24, borderRadius: 12 }}
      />

      {/* Book Form Modal */}
      <Modal
        title={editingBook ? "Cập nhật sách" : "Thêm sách mới"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="Tên sách"
                rules={[{ required: true }]}
              >
                <Input placeholder="Nhập tên sách" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá bán (VND)"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="cover_image"
            label="Ảnh bìa"
            rules={[
              {
                required: true,
                message: "Vui lòng tải lên hoặc dán link ảnh bìa",
              },
            ]}
          >
            <ImageUpload folder="books" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả sách">
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả ngắn gọn về sách"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="discount_percentage"
                label="Giảm giá (%)"
                initialValue={0}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  formatter={(value) => `${value}%`}
                  parser={(value) =>
                    (value ? value.replace("%", "") : "") as any
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                <Select>
                  <Option value="ACTIVE">Kích hoạt (Đang bán)</Option>
                  <Option value="DRAFT">Bản nháp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Chọn file PDF hoặc EPUB">
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              multiple
              accept=".pdf,.epub"
            >
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* File Upload Modal */}
      <Modal
        title="Quản lý file sách"
        open={isFileModalOpen}
        onCancel={() => setIsFileModalOpen(false)}
        footer={null}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <Upload.Dragger
            name="file"
            customRequest={handleUploadFile}
            showUploadList={false}
            accept=".pdf,.epub"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Nhấp hoặc kéo file vào đây để tải lên
            </p>
            <p className="ant-upload-hint">Hỗ trợ định dạng PDF hoặc EPUB.</p>
          </Upload.Dragger>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

const { Text } = Typography;

export default BookManagementPage;
