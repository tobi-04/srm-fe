import React from "react";
import { useNode } from "@craftjs/core";
import { Image as AntImage, Form, Input, Slider, Select, Tabs } from "antd";
import { CSSEditor } from "./shared/CSSEditor";

interface ImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  maxWidth?: number;
  alignment?: "left" | "center" | "right";
  objectFit?: "cover" | "contain" | "fill" | "none";
  borderRadius?: number;
  boxShadow?: string;
  customCSS?: React.CSSProperties;
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
  alignment = "center",
  objectFit = "cover",
  borderRadius = 0,
  boxShadow = "none",
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
        maxWidth: maxWidth ? `${maxWidth}px` : "100%",
        marginLeft:
          alignment === "center"
            ? "auto"
            : alignment === "right"
              ? "auto"
              : "0",
        marginRight:
          alignment === "center" ? "auto" : alignment === "left" ? "auto" : "0",
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        textAlign: alignment,
        ...customCSS,
      }}>
      <AntImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        preview={false}
        style={{
          maxWidth: "100%",
          height: height === "auto" ? "auto" : height,
          objectFit: objectFit as any,
          borderRadius: `${borderRadius}px`,
          boxShadow: boxShadow !== "none" ? boxShadow : undefined,
        }}
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
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
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

              <Form.Item label="Căn chỉnh">
                <Select
                  value={props.alignment}
                  onChange={(value) =>
                    setProp((props: any) => (props.alignment = value))
                  }
                  options={[
                    { value: "left", label: "Trái" },
                    { value: "center", label: "Giữa" },
                    { value: "right", label: "Phải" },
                  ]}
                />
              </Form.Item>

              <Form.Item label="Object Fit">
                <Select
                  value={props.objectFit}
                  onChange={(value) =>
                    setProp((props: any) => (props.objectFit = value))
                  }
                  options={[
                    { value: "cover", label: "Cover (lấp đầy)" },
                    { value: "contain", label: "Contain (vừa khung)" },
                    { value: "fill", label: "Fill (kéo giãn)" },
                    { value: "none", label: "None (gốc)" },
                  ]}
                />
              </Form.Item>

              <Form.Item label={`Border Radius: ${props.borderRadius}px`}>
                <Slider
                  min={0}
                  max={50}
                  value={props.borderRadius}
                  onChange={(value) =>
                    setProp((props: any) => (props.borderRadius = value))
                  }
                />
              </Form.Item>

              <Form.Item label="Box Shadow">
                <Select
                  value={props.boxShadow}
                  onChange={(value) =>
                    setProp((props: any) => (props.boxShadow = value))
                  }
                  options={[
                    { value: "none", label: "Không có" },
                    { value: "0 2px 8px rgba(0,0,0,0.1)", label: "Nhẹ" },
                    { value: "0 4px 12px rgba(0,0,0,0.15)", label: "Vừa" },
                    { value: "0 8px 24px rgba(0,0,0,0.2)", label: "Đậm" },
                  ]}
                />
              </Form.Item>

              <Form.Item label={`Padding: ${props.padding}px`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.padding}
                  onChange={(value) =>
                    setProp((props: any) => (props.padding = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Max Width: ${props.maxWidth}px`}>
                <Slider
                  min={100}
                  max={2000}
                  value={props.maxWidth}
                  onChange={(value) =>
                    setProp((props: any) => (props.maxWidth = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Margin Top: ${props.marginTop}px`}>
                <Slider
                  min={0}
                  max={100}
                  value={props.marginTop}
                  onChange={(value) =>
                    setProp((props: any) => (props.marginTop = value))
                  }
                />
              </Form.Item>
              <Form.Item label={`Margin Bottom: ${props.marginBottom}px`}>
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
    alignment: "center",
    objectFit: "cover",
    borderRadius: 0,
    boxShadow: "none",
    customCSS: {},
  },
  related: {
    toolbar: ImageSettings,
  },
};
