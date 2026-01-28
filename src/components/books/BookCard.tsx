import React from "react";
import { Card, Button, Typography, Tag, Space, Tooltip } from "antd";
import {
  ShoppingCartOutlined,
  BookOutlined,
  StarFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Book } from "../../api/bookApi";

const { Text, Title, Paragraph } = Typography;

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();

  const calculateDiscountedPrice = (price: number, discount: number) => {
    if (!discount) return price;
    return Math.floor(price * (1 - discount / 100));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  const colors = {
    primary: "#f78404",
    slate700: "#334155",
    slate500: "#64748b",
    slate400: "#94a3b8",
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        hoverable
        className="book-card"
        style={{
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid #f1f5f9",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
          height: "100%",
          background: "#fff",
        }}
        styles={{ body: { padding: 20 } }}
        cover={
          <div
            style={{ position: "relative", overflow: "hidden", height: 320 }}
          >
            <img
              alt={book.title}
              src={
                book.cover_image ||
                "https://via.placeholder.com/300x400?text=No+Cover"
              }
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                zIndex: 2,
              }}
            >
              <Tag
                color="rgba(0,0,0,0.6)"
                style={{
                  backdropFilter: "blur(4px)",
                  border: "none",
                  borderRadius: 6,
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <BookOutlined style={{ fontSize: 12 }} /> E-BOOK
              </Tag>
            </div>
          </div>
        }
        onClick={() => navigate(`/books/${book.slug}`)}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space size={4}>
              <StarFilled style={{ color: "#fbbf24", fontSize: 12 }} />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.slate400,
                  fontWeight: 500,
                }}
              >
                4.9 (120+)
              </Text>
            </Space>
            <Tag
              color="#fff7e6"
              style={{
                color: colors.primary,
                border: "none",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 10,
              }}
            >
              BEST SELLER
            </Tag>
          </div>

          <Tooltip title={book.title} placement="top">
            <Title
              level={5}
              ellipsis={{ rows: 1 }}
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: colors.slate700,
                lineHeight: 1.4,
              }}
            >
              {book.title}
            </Title>
          </Tooltip>

          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={{
              fontSize: 13,
              color: colors.slate500,
              lineHeight: 1.5,
              minHeight: 40,
              margin: 0,
            }}
          >
            {book.description || "Chưa có mô tả cho cuốn sách này."}
          </Paragraph>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: 4,
            }}
          >
            <div>
              {book.discount_percentage > 0 && (
                <Text
                  delete
                  style={{
                    fontSize: 12,
                    color: colors.slate400,
                    display: "block",
                  }}
                >
                  {formatPrice(book.price)}
                </Text>
              )}
              <Text strong style={{ fontSize: 20, color: colors.primary }}>
                {formatPrice(
                  calculateDiscountedPrice(
                    book.price,
                    book.discount_percentage,
                  ),
                )}
              </Text>
            </div>
            <Button
              type="primary"
              shape="circle"
              icon={<ShoppingCartOutlined style={{ fontSize: 18 }} />}
              style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f78404 0%, #ffab40 100%)",
                border: "none",
                boxShadow: "0 4px 10px rgba(247, 132, 4, 0.2)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/books/${book.slug}`);
              }}
            />
          </div>
        </Space>
      </Card>
    </motion.div>
  );
};

export default BookCard;
