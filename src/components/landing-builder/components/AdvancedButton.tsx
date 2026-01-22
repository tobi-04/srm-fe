import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Input, Select, Slider, ColorPicker, Switch, Tabs } from "antd";
import type { Color } from "antd/es/color-picker";
import { CSSEditor } from "./shared/CSSEditor";
import * as Icons from "react-icons/md";

interface AdvancedButtonProps {
  label: string;
  icon?: string;
  iconPosition?: "start" | "end";
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  padding?: string;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderWidth?: number;
  borderColor?: string;
  fullWidth?: boolean;
  alignment?: "left" | "center" | "right";
  marginTop?: number;
  marginBottom?: number;
  fontSize?: number;
  customCSS?: React.CSSProperties;
}

const ICON_OPTIONS = [
  { value: "", label: "Không có icon" },
  { value: "MdArrowForward", label: "Arrow Forward" },
  { value: "MdArrowBack", label: "Arrow Back" },
  { value: "MdCheck", label: "Check" },
  { value: "MdClose", label: "Close" },
  { value: "MdDownload", label: "Download" },
  { value: "MdUpload", label: "Upload" },
  { value: "MdShoppingCart", label: "Shopping Cart" },
  { value: "MdFavorite", label: "Favorite" },
  { value: "MdStar", label: "Star" },
  { value: "MdPlayArrow", label: "Play" },
  { value: "MdSettings", label: "Settings" },
  { value: "MdPerson", label: "Person" },
  { value: "MdEmail", label: "Email" },
  { value: "MdPhone", label: "Phone" },
  { value: "MdHome", label: "Home" },
  { value: "MdInfo", label: "Info" },
  { value: "MdWarning", label: "Warning" },
  { value: "MdError", label: "Error" },
  { value: "MdCheckCircle", label: "Check Circle" },
];

export const AdvancedButton: React.FC<AdvancedButtonProps> = ({
  label = "Nhấp vào đây",
  icon = "",
  iconPosition = "start",
  backgroundColor = "#1890ff",
  textColor = "#ffffff",
  borderRadius = 4,
  padding = "12px 24px",
  borderStyle = "none",
  borderWidth = 1,
  borderColor = "#1890ff",
  fullWidth = false,
  alignment = "center",
  marginTop = 0,
  marginBottom = 0,
  fontSize = 16,
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  // Get icon component
  const IconComponent = icon ? (Icons as any)[icon] : null;

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        textAlign: alignment,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        display: fullWidth ? "block" : "inline-block",
        width: fullWidth ? "100%" : "auto",
      }}>
      <button
        style={{
          backgroundColor,
          color: textColor,
          borderRadius: `${borderRadius}px`,
          padding,
          border:
            borderStyle === "none"
              ? "none"
              : `${borderWidth}px ${borderStyle} ${borderColor}`,
          fontSize: `${fontSize}px`,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontWeight: 500,
          transition: "all 0.3s",
          width: fullWidth ? "100%" : "auto",
          justifyContent: fullWidth ? "center" : "flex-start",
          ...customCSS,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}>
        {IconComponent && iconPosition === "start" && (
          <IconComponent size={fontSize} />
        )}
        <span>{label}</span>
        {IconComponent && iconPosition === "end" && (
          <IconComponent size={fontSize} />
        )}
      </button>
    </div>
  );
};

const AdvancedButtonSettings = () => {
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
              <Form.Item label="Nhãn nút">
                <Input
                  value={props.label}
                  onChange={(e) =>
                    setProp((props: any) => (props.label = e.target.value))
                  }
                />
              </Form.Item>

              <Form.Item label="Icon">
                <Select
                  value={props.icon}
                  onChange={(value) =>
                    setProp((props: any) => (props.icon = value))
                  }
                  options={ICON_OPTIONS}
                  showSearch
                />
              </Form.Item>

              {props.icon && (
                <Form.Item label="Vị trí icon">
                  <Select
                    value={props.iconPosition}
                    onChange={(value) =>
                      setProp((props: any) => (props.iconPosition = value))
                    }
                    options={[
                      { value: "start", label: "Đầu" },
                      { value: "end", label: "Cuối" },
                    ]}
                  />
                </Form.Item>
              )}

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

              <Form.Item label={`Kích thước chữ: ${props.fontSize}px`}>
                <Slider
                  min={10}
                  max={32}
                  value={props.fontSize}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontSize = value))
                  }
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

              <Form.Item label="Padding">
                <Input
                  value={props.padding}
                  onChange={(e) =>
                    setProp((props: any) => (props.padding = e.target.value))
                  }
                  placeholder="12px 24px"
                />
              </Form.Item>

              <Form.Item label="Border Style">
                <Select
                  value={props.borderStyle}
                  onChange={(value) =>
                    setProp((props: any) => (props.borderStyle = value))
                  }
                  options={[
                    { value: "none", label: "Không có" },
                    { value: "solid", label: "Solid" },
                    { value: "dashed", label: "Dashed" },
                    { value: "dotted", label: "Dotted" },
                  ]}
                />
              </Form.Item>

              {props.borderStyle !== "none" && (
                <>
                  <Form.Item label={`Border Width: ${props.borderWidth}px`}>
                    <Slider
                      min={1}
                      max={10}
                      value={props.borderWidth}
                      onChange={(value) =>
                        setProp((props: any) => (props.borderWidth = value))
                      }
                    />
                  </Form.Item>

                  <Form.Item label="Border Color">
                    <ColorPicker
                      value={props.borderColor}
                      onChange={(color: Color) =>
                        setProp(
                          (props: any) =>
                            (props.borderColor = color.toHexString()),
                        )
                      }
                      showText
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item label="Chiều rộng đầy đủ">
                <Switch
                  checked={props.fullWidth}
                  onChange={(checked) =>
                    setProp((props: any) => (props.fullWidth = checked))
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

(AdvancedButton as any).craft = {
  displayName: "Advanced Button",
  props: {
    label: "Nhấp vào đây",
    icon: "",
    iconPosition: "start",
    backgroundColor: "#1890ff",
    textColor: "#ffffff",
    borderRadius: 4,
    padding: "12px 24px",
    borderStyle: "none",
    borderWidth: 1,
    borderColor: "#1890ff",
    fullWidth: false,
    alignment: "center",
    marginTop: 0,
    marginBottom: 0,
    fontSize: 16,
    customCSS: {},
  },
  related: {
    toolbar: AdvancedButtonSettings,
  },
};
