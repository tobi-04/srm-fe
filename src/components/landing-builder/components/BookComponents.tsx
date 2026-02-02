import { useNode } from "@craftjs/core";
import { Button, Typography, Row, Col, Space, Tag, Divider } from "antd";
import { Text } from "./";
import { useLandingPageData } from "../../../contexts/LandingPageContext";
import { ShoppingCartOutlined, BookOutlined } from "@ant-design/icons";

const { Title } = Typography;

// Book Hero Component - Defaults to showing book info
export const BookHero = ({ ...props }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const { landingPage } = useLandingPageData();

  // Safe extraction of book data
  const book =
    landingPage &&
    (landingPage.resource_type === "book" || landingPage.book_id) &&
    typeof landingPage.book_id === "object"
      ? landingPage.book_id
      : null;

  if (!book) {
    return (
      <div
        ref={(ref) => connect(drag(ref!))}
        style={{ padding: 20, textAlign: "center", background: "#fff" }}
      >
        <Text text="Book details will appear here in published mode" />
      </div>
    );
  }

  return (
    <div
      ref={(ref) => connect(drag(ref!))}
      style={{
        background: props.background || "#ffffff",
        padding: props.padding || "40px 20px",
      }}
    >
      <Row
        gutter={[32, 32]}
        align="middle"
        justify="center"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <Col xs={24} md={10} style={{ textAlign: "center" }}>
          {book.cover_image ? (
            <img
              src={book.cover_image}
              alt={book.title}
              style={{
                maxWidth: "100%",
                maxHeight: 500,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                borderRadius: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 300,
                height: 450,
                background: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                borderRadius: 8,
              }}
            >
              <BookOutlined style={{ fontSize: 60, color: "#ccc" }} />
            </div>
          )}
        </Col>
        <Col xs={24} md={14}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Tag color="orange" style={{ fontSize: 14, padding: "4px 10px" }}>
                SÁCH MỚI
              </Tag>
              <Title
                level={1}
                style={{ marginTop: 16, marginBottom: 8, fontSize: 42 }}
              >
                {book.title}
              </Title>
              <Text
                text={
                  book.description ||
                  "Mô tả sách sẽ hiển thị ở đây. Cuốn sách này cung cấp kiến thức giá trị cho bạn..."
                }
                customCSS={{ fontSize: 18, color: "#555" }}
              />
            </div>

            <Divider />

            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              {book.discount_percentage > 0 && (
                <span
                  style={{
                    fontSize: 20,
                    textDecoration: "line-through",
                    color: "#999",
                  }}
                >
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(book.price)}
                </span>
              )}
              <span
                style={{ fontSize: 36, fontWeight: "bold", color: "#f78404" }}
              >
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(
                  book.price * (1 - (book.discount_percentage || 0) / 100),
                )}
              </span>
              {book.discount_percentage > 0 && (
                <Tag color="red">-{book.discount_percentage}%</Tag>
              )}
            </div>

            <BookCheckoutButton />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

BookHero.craft = {
  displayName: "Book Hero Section",
  props: {
    background: "#ffffff",
    padding: "40px 20px",
  },
  rules: {
    canDrag: true,
    canDrop: true,
    canDelete: false, // MANDATORY: Cannot be deleted
  },
};

// Start: Book Checkout Button
export const BookCheckoutButton = ({ ...props }) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  const { setPurchaseModalOpen } = useLandingPageData();

  return (
    <Button
      ref={(ref) => connect(drag(ref!))}
      type="primary"
      size="large"
      icon={<ShoppingCartOutlined />}
      onClick={() => setPurchaseModalOpen && setPurchaseModalOpen(true)}
      style={{
        background:
          props.background ||
          "linear-gradient(135deg, #f78404 0%, #ff5e00 100%)",
        borderColor: "transparent",
        height: 56,
        padding: "0 40px",
        fontSize: 18,
        fontWeight: "bold",
        borderRadius: 50,
        boxShadow: "0 10px 20px rgba(247, 132, 4, 0.3)",
        ...props.style,
      }}
    >
      {props.text || "MUA SÁCH NGAY"}
    </Button>
  );
};

BookCheckoutButton.craft = {
  displayName: "Book Checkout Button (Fixed)",
  props: {
    text: "MUA SÁCH NGAY",
    background: "linear-gradient(135deg, #f78404 0%, #ff5e00 100%)",
  },
  rules: {
    canDrag: true,
    canDelete: false, // MANDATORY: Cannot be deleted
  },
  related: {
    settings: () => (
      <div>
        <p>Nut mua hàng mặc định, không thể xóa.</p>
      </div>
    ),
  },
};
