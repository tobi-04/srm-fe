import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider } , Tabs } from "antd";

interface SuccessHeadlineProps {
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
}

export const SuccessHeadline: React.FC<SuccessHeadlineProps> = ({
  text = "Success! You're Registered For The Web Class!",
  fontSize = 42,
  fontWeight = 900,
  color = "#000000",
  textAlign = "center",
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
        textAlign,
      }}>
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
          ...customCSS,
        }}>
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
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
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
      <Form.Item label={`Font Weight (${props.fontWeight})`}>
        <Slider
          min={100}
          max={900}
          step={100}
          value={props.fontWeight}
          onChange={(value) =>
            setProp((props: any) => (props.fontWeight = value))
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

(SuccessHeadline as any).craft = {
  displayName: "Success Headline",
  props: {
    text: "Success! You're Registered For The Web Class!",
    fontSize: 42,
    fontWeight: 900,
    padding: 0,
    color: "#000000",
    textAlign: "center",
    marginTop: 0,
    marginBottom: 30,
    maxWidth: 1200,
    customCSS: {},
  },
  related: {
    toolbar: SuccessHeadlineSettings,
  },
};
