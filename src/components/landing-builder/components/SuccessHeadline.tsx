import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input } from "antd";

interface SuccessHeadlineProps {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  marginBottom?: number;
  style?: React.CSSProperties;
}

export const SuccessHeadline: React.FC<SuccessHeadlineProps> = ({
  text = "Success! You're Registered For The Web Class!",
  fontSize = 42,
  fontWeight = 900,
  color = "#000000",
  textAlign = "center",
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
        padding: "0 12px",
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}
    >
      <h1
        style={{
          fontSize: `clamp(${Math.max(24, fontSize * 0.55)}px, ${
            fontSize * 0.75
          }px, ${fontSize}px)`,
          fontWeight,
          color,
          textAlign,
          margin: 0,
          lineHeight: 1.2,
          padding: 0,
          ...style,
        }}
      >
        {text}
      </h1>
    </div>
  );
};

const SuccessHeadlineSettings = () => {
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
      <Form.Item label="Font Size">
        <Input
          type="number"
          value={props.fontSize}
          onChange={(e) =>
            setProp((props: any) => (props.fontSize = parseInt(e.target.value)))
          }
        />
      </Form.Item>
      <Form.Item label="Font Weight">
        <Input
          type="number"
          value={props.fontWeight}
          min={100}
          max={900}
          step={100}
          onChange={(e) =>
            setProp(
              (props: any) => (props.fontWeight = parseInt(e.target.value))
            )
          }
        />
      </Form.Item>
      <Form.Item label="Color">
        <Input
          type="color"
          value={props.color}
          onChange={(e) =>
            setProp((props: any) => (props.color = e.target.value))
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

(SuccessHeadline as any).craft = {
  displayName: "Success Headline",
  props: {
    text: "Success! You're Registered For The Web Class!",
    fontSize: 42,
    fontWeight: 900,
    color: "#000000",
    textAlign: "center",
    marginBottom: 30,
  },
  related: {
    toolbar: SuccessHeadlineSettings,
  },
};
