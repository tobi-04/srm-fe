import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input } from "antd";
import { MdCheckCircle } from "react-icons/md";

interface SalesPageContentProps {
  confirmationText?: string;
  benefits?: string[];
  buttonMainText?: string;
  buttonSubText?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  checkIconColor?: string;
  backgroundColor?: string;
  marginBottom?: number;
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
  marginBottom = 30,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        backgroundColor,
        padding: "0 12px",
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}
    >
      <div style={style}>
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

        {/* CTA Button with Two Lines */}
        <button
          style={{
            width: "100%",
            padding: "16px 24px",
            backgroundColor: buttonColor,
            color: buttonTextColor,
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "clamp(16px, 22px, 22px)",
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {buttonMainText}
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
                  .map((b: string) => b.trim()))
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
      <Form.Item label="Margin Bottom">
        <Input
          type="number"
          value={props.marginBottom}
          onChange={(e) =>
            setProp(
              (props: any) => (props.marginBottom = parseInt(e.target.value))
            )
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
    marginBottom: 30,
  },
  related: {
    toolbar: SalesPageContentSettings,
  },
};
