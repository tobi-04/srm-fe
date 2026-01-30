import React from "react";
import { useNode } from "@craftjs/core";
import {
  Form,
  Select,
  Slider,
  Button,
  Input,
  ColorPicker,
  Space,
  Tabs,
} from "antd";
import type { Color } from "antd/es/color-picker";
import { CSSEditor } from "./shared/CSSEditor";
import * as Icons from "react-icons/md";
import { MdAdd, MdDelete } from "react-icons/md";

interface ListProps {
  items?: string[];
  listType?: "unordered" | "ordered";
  icon?: string;
  iconColor?: string;
  iconSize?: number;
  spacing?: number;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  fontSize?: number;
  textColor?: string;
  customCSS?: React.CSSProperties;
}

const ICON_OPTIONS = [
  { value: "MdCheckCircle", label: "Check Circle" },
  { value: "MdArrowForward", label: "Arrow Forward" },
  { value: "MdStar", label: "Star" },
  { value: "MdCheck", label: "Check" },
  { value: "MdCircle", label: "Circle" },
  { value: "MdSquare", label: "Square" },
  { value: "MdKeyboardArrowRight", label: "Arrow Right" },
  { value: "MdFiberManualRecord", label: "Dot" },
  { value: "MdPlayArrow", label: "Play Arrow" },
  { value: "MdDone", label: "Done" },
];

export const List: React.FC<ListProps> = ({
  items = ["Mục danh sách 1", "Mục danh sách 2", "Mục danh sách 3"],
  listType = "unordered",
  icon = "MdCheckCircle",
  iconColor = "#1890ff",
  iconSize = 20,
  spacing = 12,
  padding = 16,
  marginTop = 0,
  marginBottom = 0,
  fontSize = 16,
  textColor = "#000000",
  customCSS = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const IconComponent =
    listType === "unordered" && icon ? (Icons as any)[icon] : null;

  return (
    <div
      ref={(ref) => ref && connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...customCSS,
      }}>
      {listType === "ordered" ? (
        <ol
          style={{
            margin: 0,
            paddingLeft: "24px",
            listStyle: "decimal",
          }}>
          {items.map((item, index) => (
            <li
              key={index}
              style={{
                marginBottom: `${spacing}px`,
                fontSize: `${fontSize}px`,
                color: textColor,
                lineHeight: 1.6,
              }}>
              {item}
            </li>
          ))}
        </ol>
      ) : (
        <ul
          style={{
            margin: 0,
            paddingLeft: IconComponent ? "0" : "24px",
            listStyle: IconComponent ? "none" : "disc",
          }}>
          {items.map((item, index) => (
            <li
              key={index}
              style={{
                marginBottom: `${spacing}px`,
                fontSize: `${fontSize}px`,
                color: textColor,
                lineHeight: 1.6,
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}>
              {IconComponent && (
                <IconComponent
                  size={iconSize}
                  style={{ color: iconColor, marginTop: "2px", flexShrink: 0 }}
                />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ListSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props,
  }));

  const addItem = () => {
    setProp((props: any) => {
      props.items = [
        ...(props.items || []),
        `Mục danh sách ${(props.items?.length || 0) + 1}`,
      ];
    });
  };

  const removeItem = (index: number) => {
    setProp((props: any) => {
      props.items = props.items.filter((_: any, i: number) => i !== index);
    });
  };

  const updateItem = (index: number, value: string) => {
    setProp((props: any) => {
      props.items[index] = value;
    });
  };

  return (
    <Tabs
      items={[
        {
          key: "settings",
          label: "Cài đặt",
          children: (
            <Form layout="vertical">
              <Form.Item label="Loại danh sách">
                <Select
                  value={props.listType}
                  onChange={(value) =>
                    setProp((props: any) => (props.listType = value))
                  }
                  options={[
                    { value: "unordered", label: "Không thứ tự (Bullet)" },
                    { value: "ordered", label: "Có thứ tự (Số)" },
                  ]}
                />
              </Form.Item>

              {props.listType === "unordered" && (
                <>
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

                  <Form.Item label="Màu icon">
                    <ColorPicker
                      value={props.iconColor}
                      onChange={(color: Color) =>
                        setProp(
                          (props: any) =>
                            (props.iconColor = color.toHexString()),
                        )
                      }
                      showText
                    />
                  </Form.Item>

                  <Form.Item label={`Kích thước icon: ${props.iconSize}px`}>
                    <Slider
                      min={12}
                      max={40}
                      value={props.iconSize}
                      onChange={(value) =>
                        setProp((props: any) => (props.iconSize = value))
                      }
                    />
                  </Form.Item>
                </>
              )}

              <Form.Item label="Các mục danh sách">
                <Space direction="vertical" style={{ width: "100%" }}>
                  {(props.items || []).map((item: string, index: number) => (
                    <Space key={index} style={{ width: "100%" }}>
                      <Input
                        value={item}
                        onChange={(e) => updateItem(index, e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <Button
                        danger
                        size="small"
                        icon={<MdDelete />}
                        onClick={() => removeItem(index)}
                      />
                    </Space>
                  ))}
                  <Button block icon={<MdAdd />} onClick={addItem}>
                    Thêm mục
                  </Button>
                </Space>
              </Form.Item>

              <Form.Item label={`Kích thước chữ: ${props.fontSize}px`}>
                <Slider
                  min={12}
                  max={32}
                  value={props.fontSize}
                  onChange={(value) =>
                    setProp((props: any) => (props.fontSize = value))
                  }
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

              <Form.Item label={`Khoảng cách giữa các mục: ${props.spacing}px`}>
                <Slider
                  min={0}
                  max={40}
                  value={props.spacing}
                  onChange={(value) =>
                    setProp((props: any) => (props.spacing = value))
                  }
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

(List as any).craft = {
  displayName: "List",
  props: {
    items: ["Mục danh sách 1", "Mục danh sách 2", "Mục danh sách 3"],
    listType: "unordered",
    icon: "MdCheckCircle",
    iconColor: "#1890ff",
    iconSize: 20,
    spacing: 12,
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    fontSize: 16,
    textColor: "#000000",
    customCSS: {},
  },
  related: {
    toolbar: ListSettings,
  },
};
