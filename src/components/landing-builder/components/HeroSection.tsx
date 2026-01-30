import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Select, Slider, ColorPicker, Input, Tabs } from "antd";
import type { Color } from "antd/es/color-picker";
import { CSSEditor } from "./shared/CSSEditor";

interface HeroSectionProps {
  backgroundColor?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  textColor?: string;
  contentAlignment?: "left" | "center" | "right";
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  minHeight?: number;
  customCSS?: React.CSSProperties;
  children?: React.ReactNode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundColor = "#1890ff",
  backgroundImage = "",
  overlayOpacity = 0,
  textColor = "#ffffff",
  contentAlignment = "center",
  paddingTop = 80,
  paddingBottom = 80,
  paddingLeft = 40,
  paddingRight = 40,
  minHeight = 400,
  customCSS = {},
  children,
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
        position: "relative",
        minHeight: `${minHeight}px`,
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: textColor,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        textAlign: contentAlignment,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems:
          contentAlignment === "left"
            ? "flex-start"
            : contentAlignment === "right"
              ? "flex-end"
              : "center",
        border: selected ? "2px dashed #1890ff" : "none",
        ...customCSS,
      }}>
      {/* Overlay */}
      {backgroundImage && overlayOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, " + overlayOpacity / 100 + ")",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "1200px",
        }}>
        {children}
      </div>
    </div>
  );
};

const HeroSectionSettings = () => {
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
              <Form.Item label="Màu nền">
                <ColorPicker
                  value={props.backgroundColor}
                  onChange={(color: Color) =>
                    setProp(
                      (props: any) =>
                        (props.backgroundColor = color.toHexString()),
                    )
                  }
                  showText
                />
              </Form.Item>

              <Form.Item label="Ảnh nền (URL)">
                <Input
                  value={props.backgroundImage}
                  onChange={(e) =>
                    setProp(
                      (props: any) => (props.backgroundImage = e.target.value),
                    )
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </Form.Item>

              {props.backgroundImage && (
                <Form.Item label={`Độ mờ overlay: ${props.overlayOpacity}%`}>
                  <Slider
                    min={0}
                    max={100}
                    value={props.overlayOpacity}
                    onChange={(value) =>
                      setProp((props: any) => (props.overlayOpacity = value))
                    }
                  />
                </Form.Item>
              )}

              <Form.Item label="Màu chữ">
                <ColorPicker
                  value={props.textColor}
                  onChange={(color: Color) =>
                    setProp(
                      (props: any) => (props.textColor = color.toHexString()),
                    )
                  }
                  showText
                />
              </Form.Item>

              <Form.Item label="Căn chỉnh nội dung">
                <Select
                  value={props.contentAlignment}
                  onChange={(value) =>
                    setProp((props: any) => (props.contentAlignment = value))
                  }
                  options={[
                    { value: "left", label: "Trái" },
                    { value: "center", label: "Giữa" },
                    { value: "right", label: "Phải" },
                  ]}
                />
              </Form.Item>

              <Form.Item label={`Chiều cao tối thiểu: ${props.minHeight}px`}>
                <Slider
                  min={200}
                  max={800}
                  step={10}
                  value={props.minHeight}
                  onChange={(value) =>
                    setProp((props: any) => (props.minHeight = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Padding Top: ${props.paddingTop}px`}>
                <Slider
                  min={0}
                  max={200}
                  value={props.paddingTop}
                  onChange={(value) =>
                    setProp((props: any) => (props.paddingTop = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Padding Bottom: ${props.paddingBottom}px`}>
                <Slider
                  min={0}
                  max={200}
                  value={props.paddingBottom}
                  onChange={(value) =>
                    setProp((props: any) => (props.paddingBottom = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Padding Left: ${props.paddingLeft}px`}>
                <Slider
                  min={0}
                  max={200}
                  value={props.paddingLeft}
                  onChange={(value) =>
                    setProp((props: any) => (props.paddingLeft = value))
                  }
                />
              </Form.Item>

              <Form.Item label={`Padding Right: ${props.paddingRight}px`}>
                <Slider
                  min={0}
                  max={200}
                  value={props.paddingRight}
                  onChange={(value) =>
                    setProp((props: any) => (props.paddingRight = value))
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

(HeroSection as any).craft = {
  displayName: "Hero Section",
  props: {
    backgroundColor: "#1890ff",
    backgroundImage: "",
    overlayOpacity: 0,
    textColor: "#ffffff",
    contentAlignment: "center",
    paddingTop: 80,
    paddingBottom: 80,
    paddingLeft: 40,
    paddingRight: 40,
    minHeight: 400,
    customCSS: {},
  },
  related: {
    toolbar: HeroSectionSettings,
  },
  rules: {
    canMoveIn: () => true,
  },
};
