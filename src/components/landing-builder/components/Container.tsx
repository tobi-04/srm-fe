import React from 'react';
import { useNode } from '@craftjs/core';
import { Form, Input, Slider } from 'antd';

interface ContainerProps {
  children?: React.ReactNode;
  background?: string;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  background = '#ffffff',
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
        minHeight: '100px',
        width: '100%',
        border: selected ? '1px dashed #1890ff' : '1px transparent solid',
        ...style,
      }}
    >
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
          onChange={(e) => setProp((props: any) => (props.background = e.target.value))}
        />
      </Form.Item>
    </Form>
  );
};

(Container as any).craft = {
  displayName: 'Container',
  props: {
    background: '#ffffff',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
  },
  related: {
    toolbar: ContainerSettings,
  },
};

