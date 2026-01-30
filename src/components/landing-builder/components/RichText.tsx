import React from "react";
import { useNode } from "@craftjs/core";
import {
  Form,
  Input,
  Select,
  Slider,
  InputNumber,
  ColorPicker,
  Tabs,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { CSSEditor } from "./shared/CSSEditor";

interface RichTextProps {
  text: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  color?: string;
  highlightColor?: string;
  highlightStart?: number;
  highlightEnd?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
}

const FONT_FAMILIES = [
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Georgia, serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Roboto, sans-serif",
  "Open Sans, sans-serif",
  "Lato, sans-serif",
  "Montserrat, sans-serif",
  "Poppins, sans-serif",
  "Inter, sans-serif",
];

export const RichText: React.FC<RichTextProps> = ({
  text = "Nhập nội dung văn bản",
  fontFamily = "Arial, sans-serif",
  fontSize = 16,
  fontWeight = 400,
  lineHeight = 1.5,
  letterSpacing = 0,
  color = "#000000",
  highlightColor = "#ffff00",
  highlightStart = 0,
  highlightEnd = 0,
  textAlign = "left",
  padding = 16,
  marginTop = 0,
  marginBottom = 0,
  maxWidth = 1200,
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Apply highlight to text
  const renderText = () => {
    if (
      highlightStart > 0 &&
      highlightEnd > highlightStart &&
      highlightEnd <= text.length
    ) {
      const before = text.slice(0, highlightStart);
      const highlighted = text.slice(highlightStart, highlightEnd);
      const after = text.slice(highlightEnd);

      return (
        <>
          {before}
          <span style={{ backgroundColor: highlightColor, padding: "2px 4px" }}>
            {highlighted}
          </span>
          {after}
        </>
      );
    }
    return text;
  };

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth === 1200 ? "100%" : `${maxWidth}px`,
        marginLeft:
          textAlign === "center"
            ? "auto"
            : textAlign === "right"
              ? "auto"
              : "0",
        marginRight:
          textAlign === "center" ? "auto" : textAlign === "left" ? "auto" : "0",
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...customCSS,
      }}>
      <div
        style={{
          fontFamily,
          fontSize: `${fontSize}px`,
          fontWeight,
          lineHeight,
          letterSpacing: `${letterSpacing}px`,
          color,
          textAlign,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
        {renderText()}
      </div>
    </div>
  );
};

const RichTextSettings = () => {
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
              <Form.Item label="Nội dung">
                <Input.TextArea
                  rows={4}
                  value={props.text}
                  onChange={(e) =>
                    setProp((props: any) => (props.text = e.target.value))
                  }
                />
              </Form.Item>

              <Form.Item label="Font chữ">
                <Select
                  value={props.fontFamily}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontFamily = value))
                  }
                  options={FONT_FAMILIES.map((font) => ({
                    value: font,
                    label: font.split(",")[0],
                  }))}
                />
              </Form.Item>

              <Form.Item label={`Kích thước chữ: ${props.fontSize}px`}>
                <Slider
                  min={8}
                  max={72}
                  value={props.fontSize}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontSize = value))
                  }
                />
              </Form.Item>

              <Form.Item label="Font weight">
                <Select
                  value={props.fontWeight}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontWeight = value))
                  }
                  options={[
                    { value: 300, label: "Light (300)" },
                    { value: 400, label: "Regular (400)" },
                    { value: 500, label: "Medium (500)" },
                    { value: 600, label: "Semi Bold (600)" },
                    { value: 700, label: "Bold (700)" },
                    { value: 800, label: "Extra Bold (800)" },
                  ]}
                />
              </Form.Item>

              <Form.Item label={`Line height: ${props.lineHeight}`}>
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={props.lineHeight}
                  onChange={(value) =>
                    setProp((props: any) => (props.lineHeight = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Letter spacing: ${props.letterSpacing}px`}>
                <Slider
                  min={-2}
                  max={10}
                  step={0.5}
                  value={props.letterSpacing}
                  onChange={(value) =>
                    setProp((props: any) => (props.letterSpacing = value))
                  }
                />
              </Form.Item>

              <Form.Item label="Màu chữ">
                <ColorPicker
                  value={props.color}
                  onChange={(color: Color) =>
                    setProp((props: any) => (props.color = color.toHexString()))
                  }
                  showText
                />
              </Form.Item>

              <Form.Item label="Màu highlight">
                <ColorPicker
                  value={props.highlightColor}
                  onChange={(color: Color) =>
                    setProp(
                      (props: any) =>
                        (props.highlightColor = color.toHexString()),
                    )
                  }
                  showText
                />
              </Form.Item>

              <Form.Item label="Vị trí bắt đầu highlight (ký tự)">
                <InputNumber
                  min={0}
                  max={props.text?.length || 0}
                  value={props.highlightStart}
                  onChange={(value) =>
                    setProp((props: any) => (props.highlightStart = value || 0))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item label="Vị trí kết thúc highlight (ký tự)">
                <InputNumber
                  min={0}
                  max={props.text?.length || 0}
                  value={props.highlightEnd}
                  onChange={(value) =>
                    setProp((props: any) => (props.highlightEnd = value || 0))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item label="Căn chỉnh">
                <Select
                  value={props.textAlign}
                  onChange={(value) =>
                    setProp((props: any) => (props.textAlign = value))
                  }
                  options={[
                    { value: "left", label: "Trái" },
                    { value: "center", label: "Giữa" },
                    { value: "right", label: "Phải" },
                    { value: "justify", label: "Căn đều" },
                  ]}
                />
              </Form.Item>

              <Form.Item label={`Padding: ${props.padding}px`}>
                <Slider
                  min={0}
                  max={60}
                  value={props.padding}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
                  }
                />
              </Form.Item>

              <Form.Item
                label={`Max Width: ${props.maxWidth === 1200 ? "Full" : props.maxWidth + "px"}`}>
                <Slider
                  min={300}
                  max={1200}
                  step={10}
                  value={props.maxWidth}
                  onChange={(value) =>
                    setProp((props: any) => (props.maxWidth = value))
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

(RichText as any).craft = {
  displayName: "Rich Text",
  props: {
    text: "Nhập nội dung văn bản",
    fontFamily: "Arial, sans-serif",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    color: "#000000",
    highlightColor: "#ffff00",
    highlightStart: 0,
    highlightEnd: 0,
    textAlign: "left",
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 1200,
    customCSS: {},
  },
  related: {
    toolbar: RichTextSettings,
  },
};
