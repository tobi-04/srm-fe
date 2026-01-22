import React from "react";
import { useNode } from "@craftjs/core";
import { Typography, Input, Select, Form, Slider, Tabs } from "antd";
import { CSSEditor } from "./shared/CSSEditor";

const { Title, Paragraph } = Typography;

interface TextProps {
  text: string;
  type?: "title" | "paragraph";
  level?: 1 | 2 | 3 | 4 | 5;
  textAlign?: "left" | "center" | "right";
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  customCSS?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  text,
  type = "paragraph",
  level = 3,
  textAlign = "left",
  padding = 8,
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
        textAlign,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...customCSS,
      }}>
      {type === "title" ? (
        <Title level={level as any} style={{ margin: 0, textAlign }}>
          {text}
        </Title>
      ) : (
        <Paragraph style={{ margin: 0, textAlign }}>{text}</Paragraph>
      )}
    </div>
  );
};

const TextSettings = () => {
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
              <Form.Item label="Text Content">
                <Input.TextArea
                  value={props.text}
                  onChange={(e) =>
                    setProp((props: any) => (props.text = e.target.value))
                  }
                />
              </Form.Item>
              <Form.Item label="Type">
                <Select
                  value={props.type}
                  onChange={(value) =>
                    setProp((props: any) => (props.type = value))
                  }
                  options={[
                    { value: "title", label: "Title" },
                    { value: "paragraph", label: "Paragraph" },
                  ]}
                />
              </Form.Item>
              {props.type === "title" && (
                <Form.Item label="Title Level">
                  <Select
                    value={props.level}
                    onChange={(value) =>
                      setProp((props: any) => (props.level = value))
                    }
                    options={[
                      { value: 1, label: "Level 1" },
                      { value: 2, label: "Level 2" },
                      { value: 3, label: "Level 3" },
                      { value: 4, label: "Level 4" },
                    ]}
                  />
                </Form.Item>
              )}
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
              <Form.Item label={`Padding: ${props.padding || 8}px`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.padding || 8}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
                  }
                />
              </Form.Item>
              <Form.Item
                label={`Max Width: ${
                  props.maxWidth === 1200
                    ? "Full"
                    : (props.maxWidth || 1200) + "px"
                }`}>
                <Slider
                  min={400}
                  max={1200}
                  step={10}
                  value={props.maxWidth || 1200}
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

(Text as any).craft = {
  displayName: "Text",
  props: {
    text: "Edit this text",
    type: "paragraph",
    level: 3,
    textAlign: "left",
    padding: 8,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 1200,
    customCSS: {},
  },
  related: {
    toolbar: TextSettings,
  },
};
