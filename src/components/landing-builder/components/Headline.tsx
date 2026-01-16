import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Checkbox, Select } from "antd";

interface HeadlineProps {
  text?: string;
  highlightText?: string;
  highlightColor?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  hasUnderline?: boolean;
  marginBottom?: number;
  style?: React.CSSProperties;
}

export const Headline: React.FC<HeadlineProps> = ({
  text = "How To Make An Additional",
  highlightText = "$1,000 - $3,000",
  highlightColor = "yellow",
  fontSize = 36,
  fontWeight = 700,
  color = "#000000",
  textAlign = "center",
  hasUnderline = true,
  marginBottom = 30,
  style,
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const renderTextWithHighlight = () => {
    const fullText = `${text} ${highlightText} Per Day In Passive Income On Complete Autopilot In 2026...`;
    const parts = fullText.split(highlightText);

    return (
      <>
        {parts[0]}
        <span
          style={{
            backgroundColor: highlightColor,
            textDecoration: hasUnderline ? "underline" : "none",
            padding: "0 12px",
          }}
        >
          {highlightText}
        </span>
        {parts[1]}
      </>
    );
  };

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
          fontSize: `clamp(${Math.max(20, fontSize * 0.55)}px, ${
            fontSize * 0.7
          }px, ${fontSize}px)`,
          fontWeight,
          color,
          textAlign,
          margin: "0 auto",
          maxWidth: "900px",
          lineHeight: 1.3,
          padding: 0,
          ...style,
        }}
      >
        {renderTextWithHighlight()}
      </h1>
    </div>
  );
};

const HeadlineSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Main Text">
        <Input.TextArea
          value={props.text}
          onChange={(e) =>
            setProp((props: any) => (props.text = e.target.value))
          }
          rows={2}
        />
      </Form.Item>
      <Form.Item label="Highlight Text">
        <Input
          value={props.highlightText}
          onChange={(e) =>
            setProp((props: any) => (props.highlightText = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Highlight Color">
        <Input
          type="color"
          value={props.highlightColor}
          onChange={(e) =>
            setProp((props: any) => (props.highlightColor = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Text Color">
        <Input
          type="color"
          value={props.color}
          onChange={(e) =>
            setProp((props: any) => (props.color = e.target.value))
          }
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
      <Form.Item>
        <Checkbox
          checked={props.hasUnderline}
          onChange={(e) =>
            setProp((props: any) => (props.hasUnderline = e.target.checked))
          }
        >
          Underline Highlighted Text
        </Checkbox>
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

(Headline as any).craft = {
  displayName: "Headline",
  props: {
    text: "How To Make An Additional",
    highlightText: "$1,000 - $3,000",
    highlightColor: "yellow",
    fontSize: 36,
    fontWeight: 700,
    color: "#000000",
    textAlign: "center",
    hasUnderline: true,
    marginBottom: 30,
  },
  related: {
    toolbar: HeadlineSettings,
  },
};
