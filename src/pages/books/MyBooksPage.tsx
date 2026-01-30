import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Spin,
  Empty,
  Space,
  Tag,
  List,
  message,
} from "antd";
import {
  DownloadOutlined,
  BookOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { bookApi } from "../../api/bookApi";
import StudentDashboardLayout from "../../components/StudentDashboardLayout";

const { Title, Text } = Typography;

// Define Divider at the top to avoid hoisting issues
const Divider = ({ style }: { style?: React.CSSProperties }) => (
  <div
    style={{ height: "1px", background: "#f0f0f0", width: "100%", ...style }}
  />
);

const MyBooksPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-books"],
    queryFn: () => bookApi.getMyBooks().then((res) => res.data),
  });

  const handleDownload = async (bookId: string, fileId: string) => {
    try {
      const response = await bookApi.getDownloadUrl(bookId, fileId);
      window.open(response.data.url, "_blank");
    } catch (error) {
      message.error("Không thể lấy link tải sách. Vui lòng thử lại sau.");
    }
  };

  return (
    <StudentDashboardLayout>
      <div style={{ marginBottom: 32 }}>
        <Title level={2}>Sách của tôi</Title>
        <Text type="secondary">
          Tất cả các cuốn sách bạn đã sở hữu trên hệ thống.
        </Text>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" />
        </div>
      ) : data?.length > 0 ? (
        <Row gutter={[24, 24]}>
          {data.map((item: any) => (
            <Col xs={24} md={12} lg={8} key={item._id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={item.book.title}
                    src={
                      item.book.cover_image ||
                      "https://via.placeholder.com/300x400?text=No+Cover"
                    }
                    style={{ height: 260, objectFit: "cover" }}
                  />
                }
              >
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Tag color="blue" icon={<BookOutlined />}>
                    Đã sở hữu
                  </Tag>
                  <Title
                    level={5}
                    ellipsis={{ rows: 2 }}
                    style={{ margin: "8px 0", minHeight: 48 }}
                  >
                    {item.book.title}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> Sở hữu từ:{" "}
                    {new Date(item.granted_at).toLocaleDateString("vi-VN")}
                  </Text>

                  <Divider style={{ margin: "12px 0" }} />

                  <Text strong>Tải sách về:</Text>
                  <List
                    size="small"
                    dataSource={item.files}
                    renderItem={(file: any) => (
                      <List.Item
                        actions={[
                          <Button
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() =>
                              handleDownload(item.book._id, file._id)
                            }
                          >
                            Tải về
                          </Button>,
                        ]}
                      >
                        <Space>
                          {file.file_type === "PDF" ? (
                            <FilePdfOutlined style={{ color: "#ff4d4f" }} />
                          ) : (
                            <FileTextOutlined style={{ color: "#1890ff" }} />
                          )}
                          <Text>
                            {file.file_type} (
                            {(file.file_size / 1024 / 1024).toFixed(1)} MB)
                          </Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty
          description="Bạn chưa sở hữu cuốn sách nào"
          style={{ padding: "100px 0" }}
        >
          <Button
            type="primary"
            onClick={() => (window.location.href = "/books")}
          >
            Khám phá cửa hàng sách
          </Button>
        </Empty>
      )}
    </StudentDashboardLayout>
  );
};

export default MyBooksPage;
