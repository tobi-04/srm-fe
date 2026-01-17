import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Slider } from "antd";

interface ContainerProps {
  children?: React.ReactNode;
  background?: string;
  padding?: number;
  maxWidth?: number;
  minHeight?: number;
  marginTop?: number;
  marginBottom?: number;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  background = "#ffffff",
  padding = 0,
  maxWidth = 1200,
  minHeight = 100,
  marginTop = 0,
  marginBottom = 0,
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
      style={{
        background,
        padding: `${padding}px`,
        maxWidth: maxWidth === 1200 ? "100%" : `${maxWidth}px`,
        minHeight: `${minHeight}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        boxSizing: "border-box",
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...style,
      }}>
      {children}
    </div>
  );
};

const ContainerSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Background Color">
        <Input
          type="color"
          value={props.background}
          onChange={(e) =>
            setProp((props: any) => (props.background = e.target.value))
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
  );
};

(Container as any).craft = {
  displayName: "Container",
  props: {
    background: "#ffffff",
    padding: 0,
    maxWidth: 1200,
    minHeight: 100,
    marginTop: 0,
    marginBottom: 0,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    toolbar: ContainerSettings,
  },
};
