import React, { useState } from "react";
import { Modal, Button, message } from "antd";
import { CouponInput } from "../payment/CouponInput";
import { PriceBreakdown } from "../payment/PriceBreakdown";

interface CourseCouponDialogProps {
  visible: boolean;
  courseId: string;
  coursePrice: number;
  defaultDiscount?: number;
  onConfirm: (couponCode?: string) => void;
  onCancel: () => void;
}

export const CourseCouponDialog: React.FC<CourseCouponDialogProps> = ({
  visible,
  courseId,
  coursePrice,
  defaultDiscount = 0,
  onConfirm,
  onCancel,
}) => {
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  const handleSkip = () => {
    onConfirm(undefined);
  };

  const handleConfirm = () => {
    if (couponCode) {
      onConfirm(couponCode);
    } else {
      message.info("Vui lòng áp dụng mã giảm giá hoặc bỏ qua");
    }
  };

  const defaultDiscountAmount = defaultDiscount
    ? Math.floor(coursePrice * (defaultDiscount / 100))
    : 0;

  return (
    <Modal
      title="Nhập mã giảm giá (Tùy chọn)"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="skip" onClick={handleSkip}>
          Bỏ qua
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={!couponCode}
        >
          Xác nhận
        </Button>,
      ]}
      width={500}
      centered
    >
      <div style={{ padding: "20px 0" }}>
        <CouponInput
          resourceType="course"
          resourceId={courseId}
          originalPrice={coursePrice}
          defaultDiscount={defaultDiscountAmount}
          onCouponApplied={(discount: number, code: string) => {
            setCouponDiscount(discount);
            setCouponCode(code);
          }}
          onCouponRemoved={() => {
            setCouponDiscount(0);
            setCouponCode("");
          }}
        />

        <div
          style={{
            background: "#f8fafc",
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            border: "1px solid #e2e8f0",
          }}
        >
          <PriceBreakdown
            originalPrice={coursePrice}
            defaultDiscount={defaultDiscountAmount}
            couponDiscount={couponDiscount}
            couponCode={couponCode}
          />
        </div>
      </div>
    </Modal>
  );
};
