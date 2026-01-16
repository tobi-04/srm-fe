import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Select } from "antd";

interface HeaderProps {
  text?: string;
  backgroundColor?: string;
  textColor?: string;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  fontSize?: number;
  marginBottom?: number;
  style?: React.CSSProperties;
}

export const Header: React.FC<HeaderProps> = ({
  text = "FREE Limited-Time WEB CLASS Reveals...",
  backgroundColor = "rgb(7, 12, 54)",
  textColor = "#ffffff",
  textTransform = "uppercase",
  fontSize = 18,
  marginBottom = 0,
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
        padding: "0 12px",
        marginBottom: `${marginBottom}px`,
        textAlign: "center",
        fontSize: `clamp(14px, ${fontSize}px, ${fontSize}px)`,
        fontWeight: "bold",
        textTransform,
        border: selected ? "2px dashed #1890ff" : "none",
        ...style,
      }}
    >
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
      <Form.Item label="Font Size">
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) =>
            setProp((props: any) => (props.fontSize = parseInt(e.target.value)))
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

(Header as any).craft = {
  displayName: "Header",
  props: {
    text: "FREE Limited-Time WEB CLASS Reveals...",
    backgroundColor: "rgb(7, 12, 54)",
    textColor: "#ffffff",
    textTransform: "uppercase",
    fontSize: 18,
    marginBottom: 0,
  },
  related: {
    toolbar: HeaderSettings,
  },
};
