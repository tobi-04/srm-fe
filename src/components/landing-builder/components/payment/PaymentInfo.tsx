import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider } , Tabs } from "antd";

interface PaymentInfoProps {
  title?: string;
  instructions?: string[];
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
}

export const PaymentInfo: React.FC<PaymentInfoProps> = ({
  title = "Hướng dẫn thanh toán",
  instructions = [
    "Quét mã QR bằng ứng dụng ngân hàng",
    "Kiểm tra thông tin chuyển khoản",
    "Xác nhận thanh toán",
    "Chờ hệ thống xác nhận (tự động trong vài giây)",
  ],
  padding = 20,
  marginTop = 0,
  marginBottom = 30,
  maxWidth = 1200,
  customCSS = {},
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
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px auto ${marginBottom}px auto`,
        border: selected ? "2px dashed #1890ff" : "none",
        ...customCSS,
      }}>
      <h3
        style={{ marginBottom: "16px", fontSize: "20px", fontWeight: "bold" }}>
        {title}
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {instructions.map((instruction, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#1890ff",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                flexShrink: 0,
              }}>
              {index + 1}
            </div>
            <span style={{ fontSize: "16px", lineHeight: "24px" }}>
              {instruction}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          background: "#fff7e6",
          border: "1px solid #ffd591",
          borderRadius: "8px",
        }}>
        <p style={{ margin: 0, fontSize: "14px", color: "#d46b08" }}>
          <strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng nội dung để hệ
          thống tự động xác nhận thanh toán.
        </p>
      </div>
    </div>
  );
};

const PaymentInfoSettings = () => {
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
      <Form.Item label="Title">
        <Input
          value={props.title}
          onChange={(e) =>
            setProp((props: any) => (props.title = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Instructions (comma-separated)">
        <Input.TextArea
          value={props.instructions.join(", ")}
          onChange={(e) =>
            setProp(
              (props: any) =>
                (props.instructions = e.target.value
                  .split(",")
                  .map((i: string) => i.trim())),
            )
          }
          rows={4}
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

(PaymentInfo as any).craft = {
  displayName: "Payment Info",
  props: {
    title: "Hướng dẫn thanh toán",
    instructions: [
      "Quét mã QR bằng ứng dụng ngân hàng",
      "Kiểm tra thông tin chuyển khoản",
      "Xác nhận thanh toán",
      "Chờ hệ thống xác nhận (tự động trong vài giây)",
    ],
    padding: 20,
    marginTop: 0,
    marginBottom: 30,
    maxWidth: 1200,
    customCSS: {},
  },
  related: {
    toolbar: PaymentInfoSettings,
  },
};
