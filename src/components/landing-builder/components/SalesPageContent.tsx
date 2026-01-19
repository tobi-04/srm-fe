import React, { useState } from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, message, Slider } from "antd";
import { MdCheckCircle } from "react-icons/md";
import { useCountdown } from "../../../contexts/CountdownContext";
import { useParams } from "react-router-dom";
import { createPaymentTransaction } from "../../../api/paymentTransaction";
import { useLandingPageData } from "../../../contexts/LandingPageContext";

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
  style?: React.CSSProperties;
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
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { isCountdownFinished } = useCountdown();
  const { slug } = useParams<{ slug: string }>();
  const { landingPage } = useLandingPageData();
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  const handleNavigateToPayment = async () => {
    // In builder mode, just show info
    if (!slug || !landingPage) {
      message.info(
        "This button will navigate to payment page when viewing the published landing page.",
      );
      return;
    }

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

      // Get real course_id and course_price from landing page data
      const courseId =
        typeof landingPage.course_id === "string"
          ? landingPage.course_id
          : landingPage.course_id._id;

      const coursePrice =
        typeof landingPage.course_id === "object"
          ? landingPage.course_id.price
          : landingPage.course_price || 0;

      // Create payment transaction
      const response = await createPaymentTransaction({
        course_id: courseId,
        user_submission_id: submissionId,
        course_price: coursePrice,
      });

      message.success("Payment created successfully!");

      // Navigate to step 3 with transaction ID
      window.location.href = `${window.location.pathname}?step=3&tx=${response.transaction_id}`;
    } catch (error: any) {
      console.error("Payment creation error:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to create payment. Please try again.",
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
      }}>
      <div style={style}>
        {/* Confirmation Text */}
        <p
          style={{
            fontSize: "clamp(14px, 18px, 18px)",
            fontWeight: 600,
            color: "#000",
            marginBottom: "20px",
            textAlign: "center",
          }}>
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
              }}>
              <MdCheckCircle
                style={{
                  fontSize: "clamp(20px, 24px, 24px)",
                  color: checkIconColor,
                  marginRight: "12px",
                  flexShrink: 0,
                }}
              />
              <span
                style={{ fontSize: "clamp(14px, 16px, 16px)", color: "#000" }}>
                {benefit}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button - Only show when countdown is finished */}
        {isCountdownFinished && (
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
            }}>
            <span
              style={{
                fontSize: "clamp(16px, 22px, 22px)",
                fontWeight: "bold",
                textTransform: "uppercase",
              }}>
              {isCreatingPayment ? "Processing..." : buttonMainText}
            </span>
            <span
              style={{
                fontSize: "clamp(12px, 14px, 14px)",
                fontWeight: "normal",
              }}>
              {buttonSubText}
            </span>
          </button>
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
    <Form layout="vertical">
      <Form.Item label="Confirmation Text">
        <Input.TextArea
          value={props.confirmationText}
          onChange={(e) =>
            setProp((props: any) => (props.confirmationText = e.target.value))
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
            setProp((props: any) => (props.buttonMainText = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Button Sub Text">
        <Input
          value={props.buttonSubText}
          onChange={(e) =>
            setProp((props: any) => (props.buttonSubText = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Button Color">
        <Input
          type="color"
          value={props.buttonColor}
          onChange={(e) =>
            setProp((props: any) => (props.buttonColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Button Text Color">
        <Input
          type="color"
          value={props.buttonTextColor}
          onChange={(e) =>
            setProp((props: any) => (props.buttonTextColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Check Icon Color">
        <Input
          type="color"
          value={props.checkIconColor}
          onChange={(e) =>
            setProp((props: any) => (props.checkIconColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Background Color">
        <Input
          type="color"
          value={props.backgroundColor}
          onChange={(e) =>
            setProp((props: any) => (props.backgroundColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label={`Padding (${props.padding}px)`}>
        <Slider
          min={0}
          max={100}
          value={props.padding}
          onChange={(value) => setProp((props: any) => (props.padding = value))}
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
  },
  related: {
    toolbar: SalesPageContentSettings,
  },
};
