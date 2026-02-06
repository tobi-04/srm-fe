import React, { useState } from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, message, Slider, Tabs, Switch } from "antd";
import { MdCheckCircle } from "react-icons/md";
import { useCountdown } from "../../../contexts/CountdownContext";
import { useParams } from "react-router-dom";
import { createPaymentTransaction } from "../../../api/paymentTransaction";
import { useLandingPageData } from "../../../contexts/LandingPageContext";
import { CSSEditor } from "./shared/CSSEditor";
import { CourseCouponDialog } from "../../payment/CourseCouponDialog";

interface SalesPageContentProps {
  confirmationText?: string;
  benefits?: string[];
  buttonMainText?: string;
  buttonSubText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  checkIconColor?: string;
  backgroundColor?: string;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  showButtonImmediately?: boolean;
  customCSS?: React.CSSProperties;
}

export const SalesPageContent: React.FC<SalesPageContentProps> = ({
  confirmationText = "Success! You're Registered For The Web Class!",
  benefits = [
    "High Ticket Commission Quickstart kit",
    "Access to 2025 exclusive offers",
  ],
  buttonMainText = "Join The LIVE Room",
  buttonSubText = "Connect To The Web Class",
  buttonColor = "#1890ff",
  buttonTextColor = "#ffffff",
  checkIconColor = "#52c41a",
  backgroundColor = "#ffffff",
  padding = 0,
  marginTop = 0,
  marginBottom = 30,
  maxWidth = 1200,
  showButtonImmediately = false,
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { isCountdownFinished } = useCountdown();
  const { slug } = useParams<{ slug: string }>();
  const { landingPage, setPurchaseModalOpen } = useLandingPageData();
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);

  const handleNavigateToPayment = async () => {
    // 1. Handle Books/Indicators (Direct Purchase Modal)
    if (
      landingPage?.resource_type === "book" ||
      landingPage?.book_id ||
      landingPage?.resource_type === "indicator" ||
      landingPage?.indicator_id
    ) {
      if (setPurchaseModalOpen) {
        setPurchaseModalOpen(true);
      } else {
        message.info("Button will open Purchase Modal in published view.");
      }
      return;
    }

    // 2. Handle Courses (Step 3 Flow with Coupon Dialog)
    // In builder mode, just show info
    if (!slug || !landingPage) {
      message.info(
        "This button will navigate to payment page when viewing the published landing page.",
      );
      return;
    }

    // Show coupon dialog first for courses
    setShowCouponDialog(true);
  };

  const handleCouponDialogConfirm = async (couponCode?: string) => {
    setShowCouponDialog(false);

    if (!landingPage) return;

    setIsCreatingPayment(true);

    try {
      // Get user submission ID from localStorage (saved during form submission)
      const submissionId = localStorage.getItem(
        `landing_${slug}_submission_id`,
      );

      if (!submissionId) {
        message.error("Please complete the registration form first");
        // Navigate back to step 1
        window.location.href = `${window.location.pathname}?step=1`;
        return;
      }

      // Check if course_id exists (it might not if it's a book but caught in this block for some reason)
      if (!landingPage.course_id) {
        message.error("Invalid configuration: No Course ID found.");
        return;
      }

      // Get real course_id
      const courseId =
        typeof landingPage.course_id === "string"
          ? landingPage.course_id
          : landingPage.course_id._id;

      const coursePrice =
        typeof landingPage.course_id === "object"
          ? landingPage.course_id.price
          : landingPage.course_price || 0;

      // Create payment transaction with optional coupon
      const response = await createPaymentTransaction({
        course_id: courseId,
        user_submission_id: submissionId,
        course_price: coursePrice,
        coupon_code: couponCode,
      });

      message.success("Payment created successfully!");

      // Navigate to step 3 with transaction ID
      window.location.href = `${window.location.pathname}?step=3&tx=${response.transaction_id}`;
    } catch (error: any) {
      console.error("Payment creation error:", error);
      const errorMessage = error.response?.data?.message;

      if (errorMessage === "ALREADY_ENROLLED") {
        message.info("Bạn đã sở hữu khóa học này!");
        // If we are already enrolled, we can redirect to the learn page
        if (landingPage.course_id) {
          const courseId =
            typeof landingPage.course_id === "string"
              ? landingPage.course_id
              : landingPage.course_id._id;
          window.location.href = `/login?from=/learn/${courseId}`;
        }
        return;
      }

      message.error(
        errorMessage || "Failed to create payment. Please try again.",
      );
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        backgroundColor,
        padding: `${padding}px 12px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px auto ${marginBottom}px auto`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}
    >
      <div style={customCSS}>
        {/* Confirmation Text */}
        <p
          style={{
            fontSize: "clamp(14px, 18px, 18px)",
            fontWeight: 600,
            color: "#000",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {confirmationText}
        </p>

        {/* Benefits List */}
        <div style={{ marginBottom: "24px" }}>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <MdCheckCircle
                style={{
                  fontSize: "clamp(20px, 24px, 24px)",
                  color: checkIconColor,
                  marginRight: "12px",
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: "clamp(14px, 16px, 16px)", color: "#000" }}
              >
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button - Show based on countdown or immediate setting */}
        {(showButtonImmediately || isCountdownFinished) && (
          <button
            onClick={handleNavigateToPayment}
            disabled={isCreatingPayment}
            style={{
              width: "100%",
              padding: "16px 24px",
              backgroundColor: buttonColor,
              color: buttonTextColor,
              border: "none",
              borderRadius: "6px",
              cursor: isCreatingPayment ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              opacity: isCreatingPayment ? 0.7 : 1,
            }}
          >
            <span
              style={{
                fontSize: "clamp(16px, 22px, 22px)",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {isCreatingPayment ? "Processing..." : buttonMainText}
            </span>
            <span
              style={{
                fontSize: "clamp(12px, 14px, 14px)",
                fontWeight: "normal",
              }}
            >
              {buttonSubText}
            </span>
          </button>
        )}

        {/* Coupon Dialog for Courses */}
        {landingPage && landingPage.course_id && (
          <CourseCouponDialog
            visible={showCouponDialog}
            courseId={
              typeof landingPage.course_id === "string"
                ? landingPage.course_id
                : landingPage.course_id._id
            }
            coursePrice={
              typeof landingPage.course_id === "object"
                ? landingPage.course_id.price || 0
                : landingPage.course_price || 0
            }
            defaultDiscount={
              typeof landingPage.course_id === "object" &&
              landingPage.course_id.default_discount_percent
                ? landingPage.course_id.default_discount_percent
                : 0
            }
            onConfirm={handleCouponDialogConfirm}
            onCancel={() => setShowCouponDialog(false)}
          />
        )}
      </div>
    </div>
  );
};

const SalesPageContentSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
            <Form layout="vertical">
              <Form.Item label="Confirmation Text">
                <Input.TextArea
                  value={props.confirmationText}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.confirmationText = e.target.value),
                    )
                  }
                  rows={2}
                />
              </Form.Item>
              <Form.Item label="Benefits (comma-separated)">
                <Input.TextArea
                  value={props.benefits.join(", ")}
                  onChange={(e) =>
                    setProp(
                      (props: any) =>
                        (props.benefits = e.target.value
                          .split(",")
                          .map((b: string) => b.trim())),
                    )
                  }
                  rows={3}
                />
              </Form.Item>
              <Form.Item label="Button Main Text">
                <Input
                  value={props.buttonMainText}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.buttonMainText = e.target.value),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label="Button Sub Text">
                <Input
                  value={props.buttonSubText}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.buttonSubText = e.target.value),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label="Button Color">
                <Input
                  type="color"
                  value={props.buttonColor}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.buttonColor = e.target.value),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label="Button Text Color">
                <Input
                  type="color"
                  value={props.buttonTextColor}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.buttonTextColor = e.target.value),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label="Check Icon Color">
                <Input
                  type="color"
                  value={props.checkIconColor}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.checkIconColor = e.target.value),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label="Background Color">
                <Input
                  type="color"
                  value={props.backgroundColor}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.backgroundColor = e.target.value),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label="Hiển thị button ngay lập tức (không đợi countdown)">
                <Switch
                  checked={props.showButtonImmediately}
                  onChange={(checked) =>
                    setProp(
                      (props: any) => (props.showButtonImmediately = checked),
                    )
                  }
                />
              </Form.Item>
              <Form.Item label={`Padding (${props.padding}px)`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.padding}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Max Width (${props.maxWidth}px)`}>
                <Slider
                  min={400}
                  max={2000}
                  value={props.maxWidth}
                  onChange={(value) =>
                    setProp((props: any) => (props.maxWidth = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Margin Top (${props.marginTop}px)`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.marginTop}
                  onChange={(value) =>
                    setProp((props: any) => (props.marginTop = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Margin Bottom (${props.marginBottom}px)`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.marginBottom}
                  onChange={(value) =>
                    setProp((props: any) => (props.marginBottom = value))
                  }
                />
              </Form.Item>
            </Form>
          ),
        },
        {
          key: "css",
          label: "",
          children: (
            <CSSEditor
              value={props.customCSS}
              onChange={(value) =>
                setProp((props: any) => (props.customCSS = value))
              }
            />
          ),
        },
      ]}
    />
  );
};

(SalesPageContent as any).craft = {
  displayName: "Sales Page Content",
  props: {
    confirmationText: "Success! You're Registered For The Web Class!",
    benefits: [
      "High Ticket Commission Quickstart kit",
      "Access to 2025 exclusive offers",
    ],
    buttonMainText: "Join The LIVE Room",
    buttonSubText: "Connect To The Web Class",
    buttonColor: "#1890ff",
    buttonTextColor: "#ffffff",
    checkIconColor: "#52c41a",
    backgroundColor: "#ffffff",
    padding: 0,
    marginTop: 0,
    marginBottom: 30,
    maxWidth: 600,
    showButtonImmediately: false,
    customCSS: {},
  },
  related: {
    toolbar: SalesPageContentSettings,
  },
};
