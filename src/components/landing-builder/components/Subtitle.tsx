import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Select, Slider } from "antd";

interface SubtitleProps {
  text?: string;
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text = "...Without expensive costs or tech-y skills.",
  fontSize = 18,
  color = "#000000",
  textAlign = "center",
  padding = 0,
  marginTop = 0,
  marginBottom = 20,
  maxWidth = 900,
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
        padding: `${padding}px 12px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}>
      <p
        style={{
          fontSize: `clamp(${Math.max(14, fontSize * 0.75)}px, ${
            fontSize * 0.85
          }px, ${fontSize}px)`,
          color,
          textAlign,
          margin: "0 auto",
          maxWidth: maxWidth === 1200 ? "100%" : `${maxWidth}px`,
          padding: 0,
          ...style,
        }}>
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
      <Form.Item label={`Font Size: ${props.fontSize}px`}>
        <Slider
          min={10}
          max={50}
          value={props.fontSize}
          onChange={(value) =>
            setProp((props: any) => (props.fontSize = value))
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
      <Form.Item label={`Padding: ${props.padding || 0}px`}>
        <Slider
          min={0}
          max={100}
          value={props.padding || 0}
          onChange={(value) => setProp((props: any) => (props.padding = value))}
        />
      </Form.Item>
      <Form.Item
        label={`Max Width: ${
          props.maxWidth === 1200 ? "Full" : (props.maxWidth || 900) + "px"
        }`}>
        <Slider
          min={400}
          max={1200}
          step={10}
          value={props.maxWidth || 900}
          onChange={(value) =>
            setProp((props: any) => (props.maxWidth = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Margin Top: ${props.marginTop || 0}px`}>
        <Slider
          min={0}
          max={100}
          value={props.marginTop || 0}
          onChange={(value) =>
            setProp((props: any) => (props.marginTop = value))
          }
        />
      </Form.Item>
      <Form.Item label={`Margin Bottom: ${props.marginBottom || 0}px`}>
        <Slider
          min={0}
          max={100}
          value={props.marginBottom || 20}
          onChange={(value) =>
            setProp((props: any) => (props.marginBottom = value))
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
    padding: 0,
    marginTop: 0,
    marginBottom: 20,
    maxWidth: 900,
  },
  related: {
    toolbar: SubtitleSettings,
  },
};
