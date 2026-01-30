import React from "react";
import { useNode } from "@craftjs/core";
import { Button as AntButton, Form, Input, Select, Slider, Tabs } from "antd";
import { CSSEditor } from "./shared/CSSEditor";

interface ButtonProps {
  text: string;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  size?: "large" | "middle" | "small";
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  textAlign?: "left" | "center" | "right";
  customCSS?: React.CSSProperties;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  type = "primary",
  size = "middle",
  padding = 8,
  marginTop = 0,
  marginBottom = 0,
  maxWidth = 1200,
  textAlign = "center",
  customCSS = {},
  onClick,
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
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px ${
          textAlign === "center"
            ? "auto"
            : textAlign === "right"
              ? "0 0 0 auto"
              : "auto 0 0 0"
        } ${marginBottom}px ${
          textAlign === "center"
            ? "auto"
            : textAlign === "right"
              ? "0 0 0 auto"
              : "auto 0 0 0"
        }`,
        textAlign,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...customCSS,
      }}>
      <AntButton type={type} size={size} onClick={onClick}>
        {text}
      </AntButton>
    </div>
  );
};

const ButtonSettings = () => {
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
              <Form.Item label="Button Text">
                <Input
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
                    { value: "primary", label: "Primary" },
                    { value: "default", label: "Default" },
                    { value: "dashed", label: "Dashed" },
                    { value: "link", label: "Link" },
                    { value: "text", label: "Text" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Size">
                <Select
                  value={props.size}
                  onChange={(value) =>
                    setProp((props: any) => (props.size = value))
                  }
                  options={[
                    { value: "small", label: "Small" },
                    { value: "middle", label: "Middle" },
                    { value: "large", label: "Large" },
                  ]}
                />
              </Form.Item>
              <Form.Item label="Alignment">
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
              <Form.Item label={`Padding (${props.padding}px)`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.padding}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
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

(Button as any).craft = {
  displayName: "Button",
  props: {
    text: "Click Me",
    type: "primary",
    size: "middle",
    padding: 8,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 1200,
    textAlign: "center",
    customCSS: {},
  },
  related: {
    toolbar: ButtonSettings,
  },
};
