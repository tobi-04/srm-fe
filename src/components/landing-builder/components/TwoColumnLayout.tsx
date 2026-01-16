import React from 'react';
import { useNode } from '@craftjs/core';
import { Form, Input, Slider } from 'antd';

interface TwoColumnLayoutProps {
  children?: React.ReactNode;
  gap?: number;
  backgroundColor?: string;
  boxShadow?: boolean;
  maxWidth?: number;
  style?: React.CSSProperties;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  children,
  gap = 40,
  backgroundColor = '#ffffff',
  boxShadow = true,
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
        padding: 0,
        border: selected ? '2px dashed #1890ff' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: `${maxWidth}px`,
          margin: '0 auto',
          backgroundColor,
          boxShadow: boxShadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
          borderRadius: '8px',
          padding: 0,
          ...style,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 400px), 1fr))`,
            gap: `${gap}px`,
          }}
        >
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
    <Form layout="vertical">
      <Form.Item label="Gap">
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
          onChange={(e) => setProp((props: any) => (props.backgroundColor = e.target.value))}
        />
      </Form.Item>
      <Form.Item label="Max Width">
        <Input
          type="number"
          value={props.maxWidth}
          onChange={(e) => setProp((props: any) => (props.maxWidth = parseInt(e.target.value)))}
        />
      </Form.Item>
    </Form>
  );
};

(TwoColumnLayout as any).craft = {
  displayName: 'Two Column Layout',
  props: {
    gap: 40,
    backgroundColor: '#ffffff',
    boxShadow: true,
    maxWidth: 1200,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    toolbar: TwoColumnLayoutSettings,
  },
};
