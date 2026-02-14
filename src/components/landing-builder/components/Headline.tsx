import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Checkbox, Select, Slider, Tabs } from "antd";
import { CSSEditor } from "./shared/CSSEditor";

interface HeadlineProps {
  text?: string;
  highlightText?: string;
  highlightColor?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  hasUnderline?: boolean;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
}

export const Headline: React.FC<HeadlineProps> = ({
  text = "How To Make An Additional $1,000 - $3,000 Per Day",
  highlightText = "$1,000 - $3,000",
  highlightColor = "yellow",
  fontSize = 36,
  fontWeight = 700,
  color = "#000000",
  textAlign = "center",
  hasUnderline = true,
  padding = 0,
  marginTop = 0,
  marginBottom = 30,
  maxWidth = 900,
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const renderTextWithHighlight = () => {
    // If no highlight text or highlight text not found in main text, just show main text
    if (!highlightText || !text.includes(highlightText)) {
      return text;
    }

    const parts = text.split(highlightText);

    return (
      <>
        {parts[0]}
        <span
          style={{
            backgroundColor: highlightColor,
            textDecoration: hasUnderline ? "underline" : "none",
            padding: "0 12px",
          }}>
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
        padding: `${padding}px 12px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}>
      <h1
        style={{
          fontSize: `clamp(${Math.max(20, fontSize * 0.55)}px, ${
            fontSize * 0.7
          }px, ${fontSize}px)`,
          fontWeight,
          color,
          textAlign,
          margin: "0 auto",
          maxWidth: maxWidth === 1200 ? "100%" : `${maxWidth}px`,
          lineHeight: 1.3,
          padding: 0,
          ...customCSS,
        }}>
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
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
            <Form layout="vertical">
              <Form.Item label="Toàn bộ nội dung" help="Nhập toàn bộ câu văn tiêu đề">
                <Input.TextArea
                  value={props.text}
                  onChange={(e) =>
                    setProp((props: any) => (props.text = e.target.value))
                  }
                  rows={3}
                  placeholder="Ví dụ: Làm Thế Nào Để Kiếm Thêm 1.000$ - 3.000$ Mỗi Ngày"
                />
              </Form.Item>
              <Form.Item label="Text cần highlight" help="Nhập đoạn text trong nội dung trên để tô màu">
                <Input
                  value={props.highlightText}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.highlightText = e.target.value),
                    )
                  }
                  placeholder="Ví dụ: 1.000$ - 3.000$"
                />
              </Form.Item>
              <Form.Item label="Highlight Color">
                <Input
                  type="color"
                  value={props.highlightColor}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.highlightColor = e.target.value),
                    )
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
              <Form.Item label={`Font Size: ${props.fontSize}px`}>
                <Slider
                  min={10}
                  max={100}
                  value={props.fontSize}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontSize = value))
                  }
                />
              </Form.Item>
              <Form.Item label="Font Weight">
                <Select
                  value={props.fontWeight}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontWeight = value))
                  }
                  options={[
                    { value: 100, label: "Thin" },
                    { value: 300, label: "Light" },
                    { value: 400, label: "Normal" },
                    { value: 600, label: "Semi Bold" },
                    { value: 700, label: "Bold" },
                    { value: 900, label: "Extra Bold" },
                  ]}
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
                    setProp(
                      (props: any) => (props.hasUnderline = e.target.checked),
                    )
                  }>
                  Underline Highlighted Text
                </Checkbox>
              </Form.Item>
              <Form.Item label={`Padding: ${props.padding || 0}px`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.padding || 0}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
                  }
                />
              </Form.Item>
              <Form.Item
                label={`Max Width: ${
                  props.maxWidth === 1200
                    ? "Full"
                    : (props.maxWidth || 900) + "px"
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
                  value={props.marginBottom || 0}
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

(Headline as any).craft = {
  displayName: "Headline",
  props: {
    text: "How To Make An Additional $1,000 - $3,000 Per Day",
    highlightText: "$1,000 - $3,000",
    highlightColor: "yellow",
    fontSize: 36,
    fontWeight: 700,
    color: "#000000",
    textAlign: "center",
    hasUnderline: true,
    padding: 0,
    marginTop: 0,
    marginBottom: 30,
    maxWidth: 900,
    customCSS: {},
  },
  related: {
    toolbar: HeadlineSettings,
  },
};
