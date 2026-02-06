import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Typography,
  Row,
  Col,
  Input,
  Pagination,
  Spin,
  Empty,
  ConfigProvider,
  Button,
  Tag,
} from "antd";
import { SearchOutlined, StarFilled } from "@ant-design/icons";
import { bookApi } from "../../api/bookApi";
import BookCard from "../../components/books/BookCard";
import PublicLayout from "../../components/layout/PublicLayout";
import { motion } from "framer-motion";
import SEO from "../../components/common/SEO";

const { Title, Text, Paragraph } = Typography;

const BookListPage: React.FC = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 12,
    search: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["books", params],
    queryFn: () => bookApi.getBooks(params).then((res) => res.data),
  });

  const handleSearch = (value: string) => {
    setParams({ ...params, search: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
  };

  const colors = {
    primary: "#f78404",
    highlight: "#fb9d14",
    slate50: "#f8fafc",
    slate100: "#f1f5f9",
    slate200: "#e2e8f0",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",
    white: "#ffffff",
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primary,
          borderRadius: 12,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <SEO
        title="Thư viện Sách Tài chính"
        description="Khám phá kho tàng tri thức về đầu tư và tài chính qua bộ sưu tập sách điện tử chuyên sâu tại SRM Lesson."
      />
      <PublicLayout>
        {/* Books Hero Section */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "60px 5% 80px",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "rgba(247, 132, 4, 0.05)",
              filter: "blur(80px)",
              zIndex: 0,
            }}
          />

          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Row gutter={[40, 40]} align="middle">
              <Col xs={24} md={14}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Tag
                    color="orange"
                    style={{
                      marginBottom: "16px",
                      padding: "4px 12px",
                      borderRadius: "100px",
                      fontWeight: "bold",
                      border: "none",
                      background: "#fff7e6",
                      color: colors.primary,
                    }}
                  >
                    KHO TÀNG TRI THỨC SỐ
                  </Tag>
                  <Title
                    style={{
                      fontSize: "48px",
                      fontWeight: 900,
                      marginBottom: "24px",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      color: colors.slate800,
                    }}
                  >
                    Nâng Tầm Tư Duy <br />
                    <span style={{ color: colors.primary }}>
                      Làm Chủ Tài Chính
                    </span>
                  </Title>
                  <Paragraph
                    style={{
                      fontSize: "18px",
                      color: colors.slate600,
                      maxWidth: "600px",
                      marginBottom: "32px",
                      lineHeight: 1.6,
                    }}
                  >
                    Khám phá bộ sưu tập sách điện tử chuyên sâu về đầu tư, quản
                    lý tài chính và phát triển bản thân được biên soạn bởi các
                    chuyên gia hàng đầu.
                  </Paragraph>
                  <Input
                    placeholder="Tìm cuốn sách bạn cần..."
                    prefix={
                      <SearchOutlined
                        style={{ color: colors.slate400, marginRight: 8 }}
                      />
                    }
                    size="large"
                    style={{
                      maxWidth: "500px",
                      height: "56px",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      border: "1px solid #e2e8f0",
                    }}
                    onPressEnter={(e) =>
                      handleSearch((e.target as HTMLInputElement).value)
                    }
                  />
                </motion.div>
              </Col>
              <Col xs={0} md={10} style={{ textAlign: "right" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: -20,
                        left: -20,
                        background: "#fff",
                        padding: "16px",
                        borderRadius: "16px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          background: "#fbbf24",
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <StarFilled style={{ color: "#fff" }} />
                      </div>
                      <div>
                        <Text strong style={{ fontSize: 16, display: "block" }}>
                          4.9/5.0
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Xếp hạng tin cậy
                        </Text>
                      </div>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                      alt="Books"
                      style={{
                        width: "320px",
                        borderRadius: "24px",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* Books Grid */}
        <section style={{ padding: "80px 5%", background: "#fff" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "48px",
              }}
            >
              <div>
                <Title level={2} style={{ margin: 0, fontWeight: 800 }}>
                  Tất cả sách
                </Title>
                <Text type="secondary">
                  Tìm thấy {data?.meta?.total || 0} cuốn sách phù hợp
                </Text>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Tag
                  color="orange"
                  style={{
                    cursor: "pointer",
                    borderRadius: "6px",
                    padding: "4px 12px",
                  }}
                >
                  Mới nhất
                </Tag>
                <Tag
                  style={{
                    cursor: "pointer",
                    borderRadius: "6px",
                    padding: "4px 12px",
                  }}
                >
                  Phổ biến
                </Tag>
                <Tag
                  style={{
                    cursor: "pointer",
                    borderRadius: "6px",
                    padding: "4px 12px",
                  }}
                >
                  Giá thấp
                </Tag>
              </div>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "100px 0" }}>
                <Spin size="large" tip="Đang tải danh sách sách..." />
              </div>
            ) : data?.data?.length > 0 ? (
              <>
                <Row gutter={[32, 40]}>
                  {data.data.map((book: any, idx: number) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                      >
                        <BookCard book={book} />
                      </motion.div>
                    </Col>
                  ))}
                </Row>
                <div style={{ textAlign: "center", marginTop: "64px" }}>
                  <Pagination
                    current={params.page}
                    pageSize={params.limit}
                    total={data.meta?.total || 0}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: "80px 0",
                  textAlign: "center",
                  background: "#f8fafc",
                  borderRadius: "32px",
                }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div style={{ marginTop: "16px" }}>
                      <Title level={4} style={{ margin: 0 }}>
                        Không tìm thấy sách nào
                      </Title>
                      <Text type="secondary">
                        Cần thử từ khóa khác hoặc quay lại sau
                      </Text>
                    </div>
                  }
                />
                <Button
                  type="primary"
                  style={{ marginTop: "24px" }}
                  onClick={() => handleSearch("")}
                >
                  Xem tất cả sách
                </Button>
              </div>
            )}
          </div>
        </section>
      </PublicLayout>
    </ConfigProvider>
  );
};

export default BookListPage;
