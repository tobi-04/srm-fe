import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider } , Tabs } from "antd";

interface TwoColumnLayoutProps {
  children?: React.ReactNode;
  gap?: number;
  backgroundColor?: string;
  boxShadow?: boolean;
  maxWidth?: number;
  padding?: number;
  minHeight?: number;
  marginTop?: number;
  marginBottom?: number;
  customCSS?: React.CSSProperties;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  children,
  gap = 40,
  backgroundColor = "#ffffff",
  boxShadow = true,
  maxWidth = 1200,
  padding = 20,
  minHeight = 100,
  marginTop = 0,
  marginBottom = 0,
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
        padding: 0,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "2px dashed #1890ff" : "none",
      }}>
      <div
        style={{
          maxWidth: maxWidth === 1200 ? "100%" : `${maxWidth}px`,
          margin: "0 auto",
          backgroundColor,
          boxShadow: boxShadow ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
          borderRadius: "8px",
          padding: `${padding}px`,
          minHeight: `${minHeight}px`,
          boxSizing: "border-box",
          ...customCSS,
        }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 400px), 1fr))`,
            gap: `${gap}px`,
          }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const TwoColumnLayoutSettings = () => {
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
      <Form.Item label={`Gap: ${props.gap || 0}px`}>
        <Slider
          value={props.gap}
          onChange={(value) => setProp((props: any) => (props.gap = value))}
          min={0}
          max={100}
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
      <Form.Item
        label={`Max Width: ${
          props.maxWidth === 1200 ? "Full" : (props.maxWidth || 1200) + "px"
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
      <Form.Item label={`Padding: ${props.padding || 0}px`}>
        <Slider
          min={0}
          max={100}
          value={props.padding || 0}
          onChange={(value) => setProp((props: any) => (props.padding = value))}
        />
      </Form.Item>
      <Form.Item label={`Min Height: ${props.minHeight || 100}px`}>
        <Slider
          min={0}
          max={1000}
          value={props.minHeight || 100}
          onChange={(value) =>
            setProp((props: any) => (props.minHeight = value))
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

(TwoColumnLayout as any).craft = {
  displayName: "Two Column Layout",
  props: {
    gap: 40,
    backgroundColor: "#ffffff",
    boxShadow: true,
    maxWidth: 1200,
    padding: 20,
    minHeight: 100,
    marginTop: 0,
    marginBottom: 0,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    customCSS: {},
  },
  related: {
    toolbar: TwoColumnLayoutSettings,
  },
};
