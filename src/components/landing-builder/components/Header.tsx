import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Select, Slider } from "antd";

interface HeaderProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  fontSize?: number;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const Header: React.FC<HeaderProps> = ({
  text = "FREE Limited-Time WEB CLASS Reveals...",
  backgroundColor = "rgb(7, 12, 54)",
  textColor = "#ffffff",
  textTransform = "uppercase",
  fontSize = 18,
  padding = 12,
  marginTop = 0,
  marginBottom = 0,
  maxWidth = 1200,
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
        color: textColor,
        padding: `${padding}px 12px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px auto ${marginBottom}px auto`,
        textAlign: "center",
        fontSize: `clamp(14px, ${fontSize}px, ${fontSize}px)`,
        fontWeight: "bold",
        textTransform,
        border: selected ? "2px dashed #1890ff" : "none",
        ...style,
      }}>
      {text}
    </div>
  );
};

const HeaderSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Text">
        <Input.TextArea
          value={props.text}
          onChange={(e) =>
            setProp((props: any) => (props.text = e.target.value))
          }
          rows={2}
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
      <Form.Item label="Text Color">
        <Input
          type="color"
          value={props.textColor}
          onChange={(e) =>
            setProp((props: any) => (props.textColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Text Transform">
        <Select
          value={props.textTransform}
          onChange={(value) =>
            setProp((props: any) => (props.textTransform = value))
          }
          options={[
            { value: "uppercase", label: "Uppercase" },
            { value: "lowercase", label: "Lowercase" },
            { value: "capitalize", label: "Capitalize" },
            { value: "none", label: "None" },
          ]}
        />
      </Form.Item>
      <Form.Item label={`Font Size (${props.fontSize}px)`}>
        <Slider
          min={10}
          max={100}
          value={props.fontSize}
          onChange={(value) =>
            setProp((props: any) => (props.fontSize = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Padding (${props.padding}px)`}>
        <Slider
          min={0}
          max={200}
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

(Header as any).craft = {
  displayName: "Header",
  props: {
    text: "FREE Limited-Time WEB CLASS Reveals...",
    backgroundColor: "rgb(7, 12, 54)",
    textColor: "#ffffff",
    textTransform: "uppercase",
    fontSize: 18,
    padding: 12,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 1200,
  },
  related: {
    toolbar: HeaderSettings,
  },
};
