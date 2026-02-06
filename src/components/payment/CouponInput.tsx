import React, { useState } from "react";
import { Input, Button, message, Space, Tag, Alert } from "antd";
import { TagOutlined, CheckCircleOutlined } from "@ant-design/icons";
import apiClient from "../../api/client";

interface CouponInputProps {
  resourceType: "book" | "course" | "indicator";
  resourceId: string;
  originalPrice: number;
  defaultDiscount: number;
  onCouponApplied: (discount: number, code: string) => void;
  onCouponRemoved: () => void;
}

export const CouponInput: React.FC<CouponInputProps> = ({
  resourceType,
  resourceId,
  originalPrice,
  defaultDiscount,
  onCouponApplied,
  onCouponRemoved,
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/coupons/validate", {
        code: couponCode.trim(),
        resource_type: resourceType,
        resource_id: resourceId,
        original_price: originalPrice,
        default_discount: defaultDiscount,
      });

      const { discount_amount } = response.data;
      setAppliedCoupon({ code: couponCode.trim(), discount: discount_amount });
      onCouponApplied(discount_amount, couponCode.trim());
      message.success("Áp dụng mã giảm giá thành công!");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Mã giảm giá không hợp lệ";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    onCouponRemoved();
    message.info("Đã xóa mã giảm giá");
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {!appliedCoupon ? (
        <Space.Compact style={{ width: "100%" }}>
          <Input
            prefix={<TagOutlined />}
            placeholder="Nhập mã giảm giá"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onPressEnter={handleApplyCoupon}
            disabled={loading}
          />
          <Button type="primary" onClick={handleApplyCoupon} loading={loading}>
            Áp dụng
          </Button>
        </Space.Compact>
      ) : (
        <Alert
          message={
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <span>
                Mã giảm giá: <Tag color="success">{appliedCoupon.code}</Tag>
              </span>
              <span>
                Giảm {appliedCoupon.discount.toLocaleString("vi-VN")}đ
              </span>
            </Space>
          }
          type="success"
          closable
          onClose={handleRemoveCoupon}
        />
      )}
    </div>
  );
};
