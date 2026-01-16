import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Select } from "antd";

interface SubtitleProps {
  text?: string;
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  marginBottom?: number;
  style?: React.CSSProperties;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text = "...Without expensive costs or tech-y skills.",
  fontSize = 18,
  color = "#000000",
  textAlign = "center",
  marginBottom = 20,
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
      <p
        style={{
          fontSize: `clamp(${Math.max(14, fontSize * 0.75)}px, ${
            fontSize * 0.85
          }px, ${fontSize}px)`,
          color,
          textAlign,
          margin: "0 auto",
          maxWidth: "900px",
          padding: 0,
          ...style,
        }}
      >
        {text}
      </p>
    </div>
  );
};

const SubtitleSettings = () => {
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
      <Form.Item label="Color">
        <Input
          type="color"
          value={props.color}
          onChange={(e) =>
            setProp((props: any) => (props.color = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Text Align">
        <Select
          value={props.textAlign}
          onChange={(value) =>
            setProp((props: any) => (props.textAlign = value))
          }
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
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

(Subtitle as any).craft = {
  displayName: "Subtitle",
  props: {
    text: "...Without expensive costs or tech-y skills.",
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
  },
  related: {
    toolbar: SubtitleSettings,
  },
};
