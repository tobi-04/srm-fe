import React from "react";
import { useNode } from "@craftjs/core";
import { Image as AntImage, Form, Input, Slider } from "antd";

interface ImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = "Image",
  width = "100%",
  height = "auto",
  padding = 8,
  marginTop = 0,
  marginBottom = 0,
  maxWidth = 1200,
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
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        margin: `${marginTop}px auto ${marginBottom}px auto`,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        textAlign: "center",
        ...style,
      }}>
      <AntImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        preview={false}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </div>
  );
};

const ImageSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  return (
    <Form layout="vertical">
      <Form.Item label="Image URL">
        <Input
          value={props.src}
          onChange={(e) =>
            setProp((props: any) => (props.src = e.target.value))
          }
        />
      </Form.Item>
      <Form.Item label="Alt Text">
        <Input
          value={props.alt}
          onChange={(e) =>
            setProp((props: any) => (props.alt = e.target.value))
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
          min={100}
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
  );
};

(Image as any).craft = {
  displayName: "Image",
  props: {
    src: "https://via.placeholder.com/400x200",
    alt: "Image",
    width: "100%",
    height: "auto",
    padding: 8,
    marginTop: 0,
    marginBottom: 0,
    maxWidth: 1200,
  },
  related: {
    toolbar: ImageSettings,
  },
};
