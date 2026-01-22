import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider, Select, Tabs } from "antd";
import { MdCheckCircle, MdPending, MdError } from "react-icons/md";
import { usePaymentData } from "../../../../contexts/PaymentContext";
import { CSSEditor } from "../shared/CSSEditor";

interface PaymentStatusProps {
  status?: "pending" | "completed" | "failed";
  pendingText?: string;
  completedText?: string;
  failedText?: string;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status: initialStatus = "pending",
  pendingText = "Đang chờ thanh toán...",
  completedText = "Thanh toán thành công! Cảm ơn bạn đã đăng ký khóa học.",
  failedText = "Thanh toán thất bại. Vui lòng thử lại.",
  padding = 0,
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

  const { transaction } = usePaymentData();

  // Use dynamic status from transaction context if we are in the live payment flow
  const status = transaction?.status || initialStatus;

  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          icon: <MdCheckCircle size={64} />,
          color: "#52c41a",
          bgColor: "#f6ffed",
          borderColor: "#b7eb8f",
          text: completedText,
        };
      case "failed":
        return {
          icon: <MdError size={64} />,
          color: "#ff4d4f",
          bgColor: "#fff2f0",
          borderColor: "#ffccc7",
          text: failedText,
        };
      default:
        return {
          icon: <MdPending size={64} />,
          color: "#1890ff",
          bgColor: "#e6f7ff",
          borderColor: "#91d5ff",
          text: pendingText,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      className="landing-builder-component"
      style={{
        padding: `${padding}px 12px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px auto ${marginBottom}px auto`,
        border: selected ? "2px dashed #1890ff" : "none",
        ...customCSS,
      }}>
      <div
        style={{
          padding: "32px",
          background: config.bgColor,
          border: `2px solid ${config.borderColor}`,
          borderRadius: "12px",
          textAlign: "center",
        }}>
        <div style={{ color: config.color, marginBottom: "16px" }}>
          {config.icon}
        </div>
        <p
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: config.color,
            margin: 0,
          }}>
          {config.text}
        </p>
        {status === "pending" && (
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginTop: "8px",
              margin: 0,
            }}>
            Hệ thống sẽ tự động xác nhận khi nhận được thanh toán
          </p>
        )}
      </div>
    </div>
  );
};

const PaymentStatusSettings = () => {
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
              <Form.Item label="Status">
                <Select
                  value={props.status}
                  onChange={(value) =>
                    setProp((props: any) => (props.status = value))
                  }
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "completed", label: "Completed" },
                    { value: "failed", label: "Failed" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Pending Text">
                <Input.TextArea
                  value={props.pendingText}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.pendingText = e.target.value),
                    )
                  }
                  rows={2}
                />
              </Form.Item>
              <Form.Item label="Completed Text">
                <Input.TextArea
                  value={props.completedText}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.completedText = e.target.value),
                    )
                  }
                  rows={2}
                />
              </Form.Item>
              <Form.Item label="Failed Text">
                <Input.TextArea
                  value={props.failedText}
                  onChange={(e) =>
                    setProp((props: any) => (props.failedText = e.target.value))
                  }
                  rows={2}
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
                  max={1200}
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

(PaymentStatus as any).craft = {
  displayName: "Payment Status",
  props: {
    status: "pending",
    pendingText: "Đang chờ thanh toán...",
    completedText: "Thanh toán thành công! Cảm ơn bạn đã đăng ký khóa học.",
    failedText: "Thanh toán thất bại. Vui lòng thử lại.",
    padding: 0,
    marginTop: 0,
    marginBottom: 30,
    maxWidth: 600,
    customCSS: {},
  },
  related: {
    toolbar: PaymentStatusSettings,
  },
};
