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
  Row,
  Col,
  Dropdown,
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
  MoreOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { MdSettings } from "react-icons/md";
import { bookApi } from "../../api/bookApi";
import { createLandingPage, getLandingPages } from "../../api/landingPage";
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

  const handleEdit = async (record: any) => {
    try {
      message.loading({ content: "Đang tải thông tin sách...", key: "fetch-book" });
      const res = await bookApi.adminGetById(record._id);
      const bookData = res.data;
      setEditingBook(bookData);
      form.setFieldsValue(bookData);

      // Map existing files to fileList for display in the modal
      if (bookData.files && bookData.files.length > 0) {
        setFileList(
          bookData.files.map((f: any) => {
            const fileNameWithTimestamp = f.file_path.split("/").pop() || "";
            const fileName = fileNameWithTimestamp.includes("-")
              ? fileNameWithTimestamp.substring(fileNameWithTimestamp.indexOf("-") + 1)
              : fileNameWithTimestamp;

            return {
              uid: f._id,
              name: `[${f.file_type}] ${fileName}`,
              status: "done",
              url: f.file_path,
              isExisting: true,
            };
          }),
        );
      } else {
        setFileList([]);
      }

      setIsModalOpen(true);
      message.destroy("fetch-book");
    } catch (error) {
      console.error(error);
      message.error({ content: "Lỗi khi tải thông tin sách", key: "fetch-book" });
    }
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

    // Check if any existing files were removed from the fileList
    if (editingBook && editingBook.files) {
      const currentUids = fileList.map((f) => f.uid);
      editingBook.files.forEach((oldFile: any) => {
        if (!currentUids.includes(oldFile._id)) {
          // If the user removed an existing file from the list, delete it
          bookApi.adminDeleteFile(oldFile._id).catch(console.error);
        }
      });
    }

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
      setIsFileModalOpen(false); // Close modal after success
    } catch (err) {
      onError(err);
      message.error("Tải file thất bại");
    }
  };

  const handleManageLandingPage = async (book: any) => {
    try {
      message.loading({
        content: "Đang kiểm tra Landing Page...",
        key: "landing",
      });
      const res = await getLandingPages({ book_id: book._id });

      if (res.data && res.data.length > 0) {
        message.success({
          content: "Đã tìm thấy Landing Page!",
          key: "landing",
        });
        navigate(`/admin/landing-builder/${res.data[0]._id}`);
      } else {
        message.loading({
          content: "Đang tạo Landing Page mới...",
          key: "landing",
        });
        const newLp = await createLandingPage({
          resource_type: "book",
          book_id: book._id,
          title: book.title,
          slug: book.slug,
          status: "draft",
        });
        message.success({
          content: "Tạo Landing Page thành công!",
          key: "landing",
        });
        navigate(`/admin/landing-builder/${newLp._id}`);
      }
    } catch (error) {
      console.error(error);
      message.error({
        content: "Lỗi khi truy cập Landing Page",
        key: "landing",
      });
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
      width: 220,
      render: (record: any) => {
        const hasPdf = record.files?.some((f: any) => f.file_type === "PDF");
        const hasEpub = record.files?.some((f: any) => f.file_type === "EPUB");

        return (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            {record.files?.map((f: any) => {
              // Extract filename from path (remove timestamp prefix)
              const fullPath = f.file_path || "";
              const fileNameWithTimestamp = fullPath.split("/").pop() || "";
              const fileName = fileNameWithTimestamp.includes("-")
                ? fileNameWithTimestamp.substring(fileNameWithTimestamp.indexOf("-") + 1)
                : fileNameWithTimestamp;

              return (
                <div
                  key={f._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#f5f5f5",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    width: "100%",
                  }}
                >
                  <Space size={4} style={{ overflow: "hidden", flex: 1 }}>
                    {f.file_type === "PDF" ? (
                      <FilePdfOutlined style={{ color: "#ff4d4f" }} />
                    ) : (
                      <FileTextOutlined style={{ color: "#1890ff" }} />
                    )}
                    <Typography.Text
                      style={{ fontSize: "11px", maxWidth: "100px" }}
                      ellipsis={{ tooltip: fileName }}
                    >
                      {fileName}
                    </Typography.Text>
                  </Space>
                  <Space size={2}>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined style={{ fontSize: "12px" }} />}
                      onClick={() => {
                        setSelectedBookId(record._id);
                        setIsFileModalOpen(true);
                      }}
                      title="Thay thế file"
                      style={{ padding: "0 4px" }}
                    />
                    <Popconfirm
                      title="Xóa file này?"
                      onConfirm={() => deleteFileMutation.mutate(f._id)}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined style={{ fontSize: "12px" }} />}
                        style={{ padding: "0 4px" }}
                      />
                    </Popconfirm>
                  </Space>
                </div>
              );
            })}

            {(!hasPdf || !hasEpub) && (
              <Button
                size="small"
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedBookId(record._id);
                  setIsFileModalOpen(true);
                }}
                style={{ width: "100%", fontSize: "11px" }}
              >
                Thêm {!hasPdf ? "PDF" : ""}{!hasPdf && !hasEpub ? " / " : ""}{!hasEpub ? "EPUB" : ""}
              </Button>
            )}
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 80,
      render: (_: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: "Xem chi tiết",
                icon: <EyeOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: "edit",
                label: "Chỉnh sửa",
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: "landing",
                label: "Landing Page",
                icon: <BookOutlined />,
                onClick: () => handleManageLandingPage(record),
              },
              {
                key: "share",
                label: "Chia sẻ",
                icon: <ShareAltOutlined />,
                onClick: () => handleShare(record),
              },
              {
                type: "divider",
              },
              {
                key: "delete",
                label: (
                  <Popconfirm
                    title="Xóa sách này?"
                    onConfirm={() => deleteMutation.mutate(record._id)}
                    okText="Xóa"
                    cancelText="Hủy"
                  >
                    <span>Xóa</span>
                  </Popconfirm>
                ),
                icon: <DeleteOutlined />,
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
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

          <Form.Item name="zalo_group_url" label="Link nhóm Zalo">
            <Input placeholder="Ví dụ: https://zalo.me/g/xxxxxx" />
          </Form.Item>

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
