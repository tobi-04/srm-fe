import React from "react";
import { Divider, Typography, Space } from "antd";

const { Text } = Typography;

interface PriceBreakdownProps {
  originalPrice: number;
  defaultDiscount?: number;
  couponDiscount?: number;
  couponCode?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  originalPrice,
  defaultDiscount = 0,
  couponDiscount = 0,
  couponCode,
}) => {
  const priceAfterDefault = originalPrice - defaultDiscount;
  const finalPrice = priceAfterDefault - couponDiscount;
  const totalSavings = defaultDiscount + couponDiscount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text type="secondary">Giá gốc:</Text>
          <Text delete={totalSavings > 0}>{formatPrice(originalPrice)}</Text>
        </div>

        {defaultDiscount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Giảm giá mặc định:</Text>
            <Text type="success">-{formatPrice(defaultDiscount)}</Text>
          </div>
        )}

        {couponDiscount > 0 && couponCode && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text type="secondary">Mã {couponCode}:</Text>
            <Text type="success">-{formatPrice(couponDiscount)}</Text>
          </div>
        )}

        <Divider style={{ margin: "8px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text strong style={{ fontSize: 16 }}>
            Tổng cộng:
          </Text>
          <Text strong style={{ fontSize: 16, color: "#1890ff" }}>
            {formatPrice(finalPrice)}
          </Text>
        </div>

        {totalSavings > 0 && (
          <div style={{ textAlign: "right" }}>
            <Text type="success" style={{ fontSize: 12 }}>
              Tiết kiệm: {formatPrice(totalSavings)}
            </Text>
          </div>
        )}
      </Space>
    </div>
  );
};
