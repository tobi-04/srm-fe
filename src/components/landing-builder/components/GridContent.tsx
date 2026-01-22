import React from "react";
import { useNode } from "@craftjs/core";
import { Form, Select, Slider, InputNumber, Tabs } from "antd";
import { CSSEditor } from "./shared/CSSEditor";

interface GridContentProps {
  columns?: 2 | 3 | 4;
  gap?: number;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  customCSS?: React.CSSProperties;
  children?: React.ReactNode;
}

export const GridContent: React.FC<GridContentProps> = ({
  columns = 3,
  gap = 20,
  padding = 16,
  marginTop = 0,
  marginBottom = 0,
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
        padding: `${padding}px`,
        marginTop: `${marginTop}px`,
        marginBottom: `${marginBottom}px`,
        border: selected ? "1px dashed #1890ff" : "1px transparent solid",
        ...customCSS,
      }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}>
        {children}
      </div>
    </div>
  );
};

// Grid Item component
interface GridItemProps {
  customCSS?: React.CSSProperties;
  children?: React.ReactNode;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
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
        padding: "16px",
        border: selected ? "1px dashed #52c41a" : "1px solid #f0f0f0",
        borderRadius: "4px",
        minHeight: "100px",
        ...customCSS,
      }}>
      {children}
    </div>
  );
};

const GridContentSettings = () => {
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
              <Form.Item label="Số cột">
                <Select
                  value={props.columns}
                  onChange={(value) =>
                    setProp((props: any) => (props.columns = value))
                  }
                  options={[
                    { value: 2, label: "2 cột" },
                    { value: 3, label: "3 cột" },
                    { value: 4, label: "4 cột" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="Số mục (Grid Items)"
                help="Số lượng ô trong grid">
                <InputNumber
                  min={1}
                  max={12}
                  value={props.itemCount}
                  onChange={(value) =>
                    setProp((props: any) => (props.itemCount = value || 1))
                  }
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item label={`Khoảng cách: ${props.gap}px`}>
                <Slider
                  min={0}
                  max={60}
                  value={props.gap}
                  onChange={(value) =>
                    setProp((props: any) => (props.gap = value))
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

const GridItemSettings = () => {
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

(GridContent as any).craft = {
  displayName: "Grid Content",
  props: {
    columns: 3,
    itemCount: 3,
    gap: 20,
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    customCSS: {},
  },
  related: {
    toolbar: GridContentSettings,
  },
  rules: {
    canMoveIn: () => true,
  },
};

(GridItem as any).craft = {
  displayName: "Grid Item",
  props: {
    customCSS: {},
  },
  related: {
    toolbar: GridItemSettings,
  },
  rules: {
    canMoveIn: () => true,
  },
};
